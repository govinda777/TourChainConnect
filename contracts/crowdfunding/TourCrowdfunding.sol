// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TourCrowdfunding
 * @dev Contrato para realizar financiamento coletivo de projetos na plataforma TourChain
 */
contract TourCrowdfunding is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant PROJECT_ADMIN_ROLE = keccak256("PROJECT_ADMIN_ROLE");
    
    enum RewardTierType { FIXED, DYNAMIC }
    enum CampaignStatus { ACTIVE, SUCCESSFUL, FAILED, CANCELED }
    enum PledgeStatus { PENDING, COMPLETED, CANCELLED }

    struct RewardTier {
        uint256 id;
        string title;
        uint256 minimumAmount;
        uint256 tokenAmount;
        string description;
        uint256 claimed;
        uint256 limit;
        RewardTierType tierType;
    }

    struct Campaign {
        uint256 id;
        string title;
        string description;
        address payable creator;
        uint256 fundingGoal;
        uint256 deadline;
        uint256 totalFunds;
        CampaignStatus status;
        uint256 numberOfBackers;
        bool claimedByCreator;
    }

    struct Pledge {
        uint256 id;
        address backer;
        string name;
        string email;
        uint256 amount;
        uint256 rewardTierId;
        string comment;
        bool isAnonymous;
        PledgeStatus status;
        uint256 timestamp;
    }

    // Variáveis de estado
    IERC20 public immutable paymentToken;
    uint256 public platformFeePercent;
    address payable public feeCollector;
    
    uint256 private campaignCounter;
    uint256 private rewardTierCounter;
    uint256 private pledgeCounter;

    // Mapeamentos
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(uint256 => RewardTier)) public campaignRewardTiers;
    mapping(uint256 => uint256[]) public campaignRewardTierIds;
    mapping(uint256 => Pledge) public pledges;
    mapping(uint256 => uint256[]) public campaignPledges;
    mapping(address => uint256[]) public backerPledges;

    // Eventos
    event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 goal, uint256 deadline);
    event RewardTierAdded(uint256 indexed campaignId, uint256 indexed tierId, string title, uint256 minimumAmount);
    event PledgeCreated(uint256 indexed campaignId, uint256 indexed pledgeId, address indexed backer, uint256 amount, uint256 rewardTierId);
    event PledgeStatusChanged(uint256 indexed pledgeId, PledgeStatus status);
    event CampaignStatusUpdated(uint256 indexed campaignId, CampaignStatus status);
    event CreatorClaimed(uint256 indexed campaignId, uint256 amount);
    event RefundIssued(uint256 indexed pledgeId, address indexed backer, uint256 amount);
    event PlatformFeeUpdated(uint256 newFeePercent);
    event FeeCollectorUpdated(address newFeeCollector);

    /**
     * @dev Inicializa o contrato com o token de pagamento
     */
    constructor(address _paymentToken, uint256 _platformFeePercent, address payable _feeCollector) {
        require(_paymentToken != address(0), "TourCrowdfunding: zero token address");
        require(_feeCollector != address(0), "TourCrowdfunding: zero fee collector address");
        require(_platformFeePercent <= 2000, "TourCrowdfunding: fee too high"); // Max 20%

        paymentToken = IERC20(_paymentToken);
        platformFeePercent = _platformFeePercent;
        feeCollector = _feeCollector;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROJECT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Cria uma nova campanha de financiamento
     */
    function createCampaign(
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint256 durationInDays
    ) external nonReentrant returns (uint256) {
        require(fundingGoal > 0, "TourCrowdfunding: goal must be > 0");
        require(durationInDays > 0 && durationInDays <= 90, "TourCrowdfunding: invalid duration");

        uint256 deadline = block.timestamp + (durationInDays * 1 days);
        uint256 campaignId = ++campaignCounter;

        campaigns[campaignId] = Campaign({
            id: campaignId,
            title: title,
            description: description,
            creator: payable(msg.sender),
            fundingGoal: fundingGoal,
            deadline: deadline,
            totalFunds: 0,
            status: CampaignStatus.ACTIVE,
            numberOfBackers: 0,
            claimedByCreator: false
        });

        emit CampaignCreated(campaignId, msg.sender, title, fundingGoal, deadline);
        return campaignId;
    }

    /**
     * @dev Adiciona um nível de recompensa a uma campanha
     */
    function addRewardTier(
        uint256 campaignId,
        string memory title,
        uint256 minimumAmount,
        uint256 tokenAmount,
        string memory description,
        uint256 limit,
        RewardTierType tierType
    ) external nonReentrant returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id > 0, "TourCrowdfunding: campaign not found");
        require(campaign.creator == msg.sender || hasRole(PROJECT_ADMIN_ROLE, msg.sender), "TourCrowdfunding: not authorized");
        require(campaign.status == CampaignStatus.ACTIVE, "TourCrowdfunding: campaign not active");
        require(minimumAmount > 0, "TourCrowdfunding: minimum amount must be > 0");

        uint256 tierId = ++rewardTierCounter;
        
        campaignRewardTiers[campaignId][tierId] = RewardTier({
            id: tierId,
            title: title,
            minimumAmount: minimumAmount,
            tokenAmount: tokenAmount,
            description: description,
            claimed: 0,
            limit: limit,
            tierType: tierType
        });
        
        campaignRewardTierIds[campaignId].push(tierId);
        
        emit RewardTierAdded(campaignId, tierId, title, minimumAmount);
        return tierId;
    }

    /**
     * @dev Cria uma contribuição (pledge) para uma campanha
     */
    function pledge(
        uint256 campaignId,
        uint256 amount,
        uint256 rewardTierId,
        string memory name,
        string memory email,
        string memory comment,
        bool isAnonymous
    ) external nonReentrant returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id > 0, "TourCrowdfunding: campaign not found");
        require(campaign.status == CampaignStatus.ACTIVE, "TourCrowdfunding: campaign not active");
        require(block.timestamp < campaign.deadline, "TourCrowdfunding: campaign ended");
        require(amount > 0, "TourCrowdfunding: amount must be > 0");

        // Verifica se a recompensa existe e se a quantidade é suficiente
        if (rewardTierId > 0) {
            RewardTier storage tier = campaignRewardTiers[campaignId][rewardTierId];
            require(tier.id > 0, "TourCrowdfunding: reward tier not found");
            require(amount >= tier.minimumAmount, "TourCrowdfunding: amount below minimum");
            
            if (tier.limit > 0) {
                require(tier.claimed < tier.limit, "TourCrowdfunding: reward limit reached");
                tier.claimed += 1;
            }
        }

        // Cria o pledge
        uint256 pledgeId = ++pledgeCounter;
        pledges[pledgeId] = Pledge({
            id: pledgeId,
            backer: msg.sender,
            name: name,
            email: email,
            amount: amount,
            rewardTierId: rewardTierId,
            comment: comment,
            isAnonymous: isAnonymous,
            status: PledgeStatus.PENDING,
            timestamp: block.timestamp
        });

        // Atualiza os mapeamentos relacionados
        campaignPledges[campaignId].push(pledgeId);
        backerPledges[msg.sender].push(pledgeId);

        // Atualiza o estado da campanha
        campaign.totalFunds += amount;
        campaign.numberOfBackers += 1;

        // Transfere os tokens do pagador para o contrato
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);

        emit PledgeCreated(campaignId, pledgeId, msg.sender, amount, rewardTierId);
        
        // Verifica se atingiu a meta
        if (campaign.totalFunds >= campaign.fundingGoal) {
            campaign.status = CampaignStatus.SUCCESSFUL;
            emit CampaignStatusUpdated(campaignId, CampaignStatus.SUCCESSFUL);
        }

        return pledgeId;
    }

    /**
     * @dev Atualiza o status de um pledge
     * Apenas o administrador do projeto pode alterar o status
     */
    function updatePledgeStatus(uint256 pledgeId, PledgeStatus newStatus) external onlyRole(PROJECT_ADMIN_ROLE) {
        Pledge storage userPledge = pledges[pledgeId];
        require(userPledge.id > 0, "TourCrowdfunding: pledge not found");
        require(userPledge.status != newStatus, "TourCrowdfunding: status already set");

        userPledge.status = newStatus;
        emit PledgeStatusChanged(pledgeId, newStatus);
    }

    /**
     * @dev Permite que o criador da campanha reivindique os fundos coletados
     * Só pode ser chamado se a campanha foi bem-sucedida
     */
    function claimFunds(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id > 0, "TourCrowdfunding: campaign not found");
        require(campaign.creator == msg.sender, "TourCrowdfunding: not campaign creator");
        require(campaign.status == CampaignStatus.SUCCESSFUL, "TourCrowdfunding: campaign not successful");
        require(!campaign.claimedByCreator, "TourCrowdfunding: already claimed");

        campaign.claimedByCreator = true;
        
        // Calcula a taxa da plataforma
        uint256 platformFee = (campaign.totalFunds * platformFeePercent) / 10000;
        uint256 creatorAmount = campaign.totalFunds - platformFee;
        
        // Transfere os tokens para o criador e para o coletor de taxas
        paymentToken.safeTransfer(campaign.creator, creatorAmount);
        paymentToken.safeTransfer(feeCollector, platformFee);
        
        emit CreatorClaimed(campaignId, creatorAmount);
    }

    /**
     * @dev Permite que um contribuidor solicite reembolso
     * Só pode ser chamado se a campanha falhou ou foi cancelada
     */
    function requestRefund(uint256 pledgeId) external nonReentrant {
        Pledge storage userPledge = pledges[pledgeId];
        require(userPledge.id > 0, "TourCrowdfunding: pledge not found");
        require(userPledge.backer == msg.sender, "TourCrowdfunding: not pledge owner");
        require(userPledge.status == PledgeStatus.PENDING, "TourCrowdfunding: cannot refund in current status");
        
        uint256 campaignId = 0;
        for (uint256 i = 0; i < backerPledges[msg.sender].length; i++) {
            if (backerPledges[msg.sender][i] == pledgeId) {
                // Encontra a campanha que contém este pledge
                for (uint256 j = 1; j <= campaignCounter; j++) {
                    for (uint256 k = 0; k < campaignPledges[j].length; k++) {
                        if (campaignPledges[j][k] == pledgeId) {
                            campaignId = j;
                            break;
                        }
                    }
                    if (campaignId > 0) break;
                }
                break;
            }
        }
        
        require(campaignId > 0, "TourCrowdfunding: campaign not found for pledge");
        Campaign storage campaign = campaigns[campaignId];
        
        require(
            campaign.status == CampaignStatus.FAILED || 
            campaign.status == CampaignStatus.CANCELED,
            "TourCrowdfunding: campaign must be failed or canceled for refund"
        );
        
        userPledge.status = PledgeStatus.CANCELLED;
        uint256 refundAmount = userPledge.amount;
        
        paymentToken.safeTransfer(userPledge.backer, refundAmount);
        
        emit PledgeStatusChanged(pledgeId, PledgeStatus.CANCELLED);
        emit RefundIssued(pledgeId, userPledge.backer, refundAmount);
    }

    /**
     * @dev Permite que o administrador cancele uma campanha
     */
    function cancelCampaign(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id > 0, "TourCrowdfunding: campaign not found");
        require(
            campaign.creator == msg.sender || hasRole(PROJECT_ADMIN_ROLE, msg.sender),
            "TourCrowdfunding: not authorized"
        );
        require(campaign.status == CampaignStatus.ACTIVE, "TourCrowdfunding: campaign not active");
        
        campaign.status = CampaignStatus.CANCELED;
        emit CampaignStatusUpdated(campaignId, CampaignStatus.CANCELED);
    }

    /**
     * @dev Atualiza a porcentagem da taxa da plataforma
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeePercent <= 2000, "TourCrowdfunding: fee too high"); // Max 20%
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }

    /**
     * @dev Atualiza o endereço do coletor de taxas
     */
    function updateFeeCollector(address payable newFeeCollector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeCollector != address(0), "TourCrowdfunding: zero address");
        feeCollector = newFeeCollector;
        emit FeeCollectorUpdated(newFeeCollector);
    }

    /**
     * @dev Retorna os IDs de todas as recompensas para uma campanha
     */
    function getCampaignRewardTiers(uint256 campaignId) external view returns (uint256[] memory) {
        return campaignRewardTierIds[campaignId];
    }

    /**
     * @dev Retorna os IDs de todos os pledges para uma campanha
     */
    function getCampaignPledges(uint256 campaignId) external view returns (uint256[] memory) {
        return campaignPledges[campaignId];
    }

    /**
     * @dev Retorna os IDs de todos os pledges de um contribuidor
     */
    function getBackerPledges(address backer) external view returns (uint256[] memory) {
        return backerPledges[backer];
    }
}