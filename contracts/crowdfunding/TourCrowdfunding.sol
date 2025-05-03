// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TourCrowdfunding
 * @dev Contrato para financiamento coletivo de projetos de turismo sustentável
 */
contract TourCrowdfunding is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant PROJECT_ADMIN_ROLE = keccak256("PROJECT_ADMIN_ROLE");

    // Enums
    enum CampaignStatus { ACTIVE, SUCCESSFUL, FAILED, CANCELED }
    enum PledgeStatus { PENDING, COMPLETED, CANCELED }
    enum RewardTierType { FIXED, DYNAMIC }

    // Structs
    struct Campaign {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 fundingGoal;
        uint256 totalFunds;
        uint256 numberOfBackers;
        CampaignStatus status;
        uint256 deadline;
        bool claimedByCreator;
    }

    struct RewardTier {
        uint256 id;
        string title;
        uint256 minimumAmount;
        uint256 tokenAmount;
        string description;
        uint256 limit;
        uint256 claimed;
        RewardTierType tierType;
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

    // Estado
    IERC20 public paymentToken;
    uint256 public platformFeePercent;
    address public feeCollector;
    
    uint256 private campaignCounter;
    uint256 private pledgeCounter;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(uint256 => RewardTier)) public campaignRewardTiers;
    mapping(uint256 => uint256[]) private campaignRewardTierIds;
    mapping(uint256 => Pledge) public pledges;
    mapping(uint256 => uint256[]) private campaignPledges;
    mapping(address => uint256[]) private backerPledges;

    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 goal, uint256 deadline);
    event RewardTierAdded(uint256 indexed campaignId, uint256 indexed tierId, string title, uint256 minimumAmount);
    event PledgeCreated(uint256 indexed campaignId, uint256 indexed pledgeId, address indexed backer, uint256 amount, uint256 rewardTierId);
    event PledgeStatusChanged(uint256 indexed pledgeId, PledgeStatus status);
    event CampaignStatusUpdated(uint256 indexed campaignId, CampaignStatus status);
    event CreatorClaimed(uint256 indexed campaignId, uint256 amount);
    event RefundIssued(uint256 indexed pledgeId, address indexed backer, uint256 amount);
    
    // Evento para informar o saldo de tokens após contribuições
    event TokenBalanceUpdated(address indexed backer, uint256 newBalance, uint256 contributionAmount);

    /**
     * @dev Construtor do contrato
     * @param _paymentToken Endereço do token ERC20 usado para pagamentos
     * @param _platformFeePercent Taxa de plataforma em base 10000 (ex: 250 = 2.5%)
     * @param _feeCollector Endereço que receberá as taxas da plataforma
     */
    constructor(
        address _paymentToken,
        uint256 _platformFeePercent,
        address _feeCollector
    ) {
        require(_platformFeePercent <= 2000, "TourCrowdfunding: fee too high"); // Máximo 20%
        
        paymentToken = IERC20(_paymentToken);
        platformFeePercent = _platformFeePercent;
        feeCollector = _feeCollector;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROJECT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Cria uma nova campanha de financiamento
     * @param title Título da campanha
     * @param description Descrição da campanha
     * @param fundingGoal Meta de financiamento em tokens
     * @param durationInDays Duração da campanha em dias
     * @return id ID da campanha criada
     */
    function createCampaign(
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint256 durationInDays
    ) external whenNotPaused returns (uint256) {
        require(fundingGoal > 0, "TourCrowdfunding: goal must be > 0");
        require(durationInDays > 0 && durationInDays <= 90, "TourCrowdfunding: invalid duration");
        
        campaignCounter++;
        uint256 campaignId = campaignCounter;
        
        uint256 deadline = block.timestamp + (durationInDays * 1 days);
        
        campaigns[campaignId] = Campaign({
            id: campaignId,
            title: title,
            description: description,
            creator: msg.sender,
            fundingGoal: fundingGoal,
            totalFunds: 0,
            numberOfBackers: 0,
            status: CampaignStatus.ACTIVE,
            deadline: deadline,
            claimedByCreator: false
        });
        
        emit CampaignCreated(campaignId, msg.sender, title, fundingGoal, deadline);
        
        return campaignId;
    }

    /**
     * @dev Adiciona um nível de recompensa a uma campanha
     * @param campaignId ID da campanha
     * @param title Título da recompensa
     * @param minimumAmount Valor mínimo para receber esta recompensa
     * @param tokenAmount Quantidade de tokens TOUR como recompensa (pode ser 0)
     * @param description Descrição da recompensa
     * @param limit Limite de quantas pessoas podem reivindicar (0 para ilimitado)
     * @param tierType Tipo do nível (0 para FIXED, 1 para DYNAMIC)
     * @return tierId ID do nível de recompensa criado
     */
    function addRewardTier(
        uint256 campaignId,
        string memory title,
        uint256 minimumAmount,
        uint256 tokenAmount,
        string memory description,
        uint256 limit,
        RewardTierType tierType
    ) external whenNotPaused returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id == campaignId, "TourCrowdfunding: campaign not found");
        require(
            campaign.creator == msg.sender || hasRole(PROJECT_ADMIN_ROLE, msg.sender),
            "TourCrowdfunding: not authorized"
        );
        require(campaign.status == CampaignStatus.ACTIVE, "TourCrowdfunding: campaign not active");
        require(minimumAmount > 0, "TourCrowdfunding: minimum amount must be > 0");
        
        uint256 tierId = campaignRewardTierIds[campaignId].length + 1;
        
        campaignRewardTiers[campaignId][tierId] = RewardTier({
            id: tierId,
            title: title,
            minimumAmount: minimumAmount,
            tokenAmount: tokenAmount,
            description: description,
            limit: limit,
            claimed: 0,
            tierType: tierType
        });
        
        campaignRewardTierIds[campaignId].push(tierId);
        
        emit RewardTierAdded(campaignId, tierId, title, minimumAmount);
        
        return tierId;
    }

    /**
     * @dev Realiza um pledge para uma campanha
     * @param campaignId ID da campanha
     * @param amount Quantidade de tokens a serem doados
     * @param rewardTierId ID do nível de recompensa (0 para nenhum)
     * @param name Nome do apoiador
     * @param email Email do apoiador
     * @param comment Comentário opcional
     * @param isAnonymous Se a contribuição deve ser anônima
     * @return pledgeId ID do pledge criado
     */
    function pledge(
        uint256 campaignId,
        uint256 amount,
        uint256 rewardTierId,
        string memory name,
        string memory email,
        string memory comment,
        bool isAnonymous
    ) external whenNotPaused returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id == campaignId, "TourCrowdfunding: campaign not found");
        require(campaign.status == CampaignStatus.ACTIVE, "TourCrowdfunding: campaign not active");
        require(block.timestamp < campaign.deadline, "TourCrowdfunding: campaign ended");
        require(amount > 0, "TourCrowdfunding: amount must be > 0");

        // Se houver recompensa, verifica requisitos
        if (rewardTierId > 0) {
            RewardTier storage reward = campaignRewardTiers[campaignId][rewardTierId];
            require(reward.id == rewardTierId, "TourCrowdfunding: reward not found");
            require(amount >= reward.minimumAmount, "TourCrowdfunding: amount below minimum");
            
            // Verifica se há limites
            if (reward.limit > 0) {
                require(reward.claimed < reward.limit, "TourCrowdfunding: reward limit reached");
                reward.claimed++;
            }
        }
        
        // Transfere tokens para o contrato
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Registra o pledge
        pledgeCounter++;
        uint256 pledgeId = pledgeCounter;
        
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
        
        // Atualiza a campanha
        campaign.totalFunds += amount;
        
        // Verifica se o backer é novo
        bool isNewBacker = true;
        for (uint i = 0; i < campaignPledges[campaignId].length; i++) {
            uint256 existingPledgeId = campaignPledges[campaignId][i];
            if (pledges[existingPledgeId].backer == msg.sender) {
                isNewBacker = false;
                break;
            }
        }
        
        if (isNewBacker) {
            campaign.numberOfBackers++;
        }
        
        // Verifica se a meta foi atingida
        if (campaign.totalFunds >= campaign.fundingGoal && campaign.status == CampaignStatus.ACTIVE) {
            campaign.status = CampaignStatus.SUCCESSFUL;
            emit CampaignStatusUpdated(campaignId, CampaignStatus.SUCCESSFUL);
        }
        
        // Registra o pledge nos mapeamentos
        campaignPledges[campaignId].push(pledgeId);
        backerPledges[msg.sender].push(pledgeId);
        
        emit PledgeCreated(campaignId, pledgeId, msg.sender, amount, rewardTierId);
        
        // Emite evento com o saldo de tokens atualizado após a contribuição
        uint256 newBalance = paymentToken.balanceOf(msg.sender);
        emit TokenBalanceUpdated(msg.sender, newBalance, amount);
        
        return pledgeId;
    }

    /**
     * @dev Cancela uma campanha (apenas o criador ou administrador)
     * @param campaignId ID da campanha
     */
    function cancelCampaign(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id == campaignId, "TourCrowdfunding: campaign not found");
        require(
            campaign.creator == msg.sender || hasRole(PROJECT_ADMIN_ROLE, msg.sender),
            "TourCrowdfunding: not authorized"
        );
        require(
            campaign.status == CampaignStatus.ACTIVE,
            "TourCrowdfunding: can only cancel active campaigns"
        );
        
        campaign.status = CampaignStatus.CANCELED;
        
        emit CampaignStatusUpdated(campaignId, CampaignStatus.CANCELED);
    }

    /**
     * @dev Atualiza o status de um pledge (apenas admin)
     * @param pledgeId ID do pledge
     * @param newStatus Novo status
     */
    function updatePledgeStatus(uint256 pledgeId, PledgeStatus newStatus) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Pledge storage pledge = pledges[pledgeId];
        require(pledge.id == pledgeId, "TourCrowdfunding: pledge not found");
        require(pledge.status != newStatus, "TourCrowdfunding: status already set");
        
        pledge.status = newStatus;
        
        emit PledgeStatusChanged(pledgeId, newStatus);
    }

    /**
     * @dev Reivindica os fundos de uma campanha bem-sucedida (apenas o criador)
     * @param campaignId ID da campanha
     */
    function claimFunds(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id == campaignId, "TourCrowdfunding: campaign not found");
        require(campaign.creator == msg.sender, "TourCrowdfunding: not the creator");
        require(campaign.status == CampaignStatus.SUCCESSFUL, "TourCrowdfunding: campaign not successful");
        require(!campaign.claimedByCreator, "TourCrowdfunding: funds already claimed");
        
        campaign.claimedByCreator = true;
        
        // Calcula a taxa da plataforma
        uint256 fee = (campaign.totalFunds * platformFeePercent) / 10000;
        uint256 creatorAmount = campaign.totalFunds - fee;
        
        // Transfere os tokens
        paymentToken.safeTransfer(campaign.creator, creatorAmount);
        paymentToken.safeTransfer(feeCollector, fee);
        
        emit CreatorClaimed(campaignId, creatorAmount);
    }

    /**
     * @dev Solicita reembolso de um pledge (apenas para campanhas canceladas ou fracassadas)
     * @param pledgeId ID do pledge
     */
    function requestRefund(uint256 pledgeId) external {
        Pledge storage pledge = pledges[pledgeId];
        require(pledge.id == pledgeId, "TourCrowdfunding: pledge not found");
        require(pledge.backer == msg.sender, "TourCrowdfunding: not the backer");
        require(pledge.status == PledgeStatus.PENDING, "TourCrowdfunding: pledge not refundable");
        
        // Encontra a campanha
        uint256 campaignId = 0;
        for (uint i = 0; i < backerPledges[msg.sender].length; i++) {
            if (backerPledges[msg.sender][i] == pledgeId) {
                for (uint j = 0; j < campaignCounter; j++) {
                    for (uint k = 0; k < campaignPledges[j+1].length; k++) {
                        if (campaignPledges[j+1][k] == pledgeId) {
                            campaignId = j+1;
                            break;
                        }
                    }
                    if (campaignId > 0) break;
                }
                break;
            }
        }
        
        require(campaignId > 0, "TourCrowdfunding: campaign not found");
        
        Campaign storage campaign = campaigns[campaignId];
        require(
            campaign.status == CampaignStatus.CANCELED || campaign.status == CampaignStatus.FAILED,
            "TourCrowdfunding: campaign must be failed or canceled for refund"
        );
        
        // Atualiza o status do pledge
        pledge.status = PledgeStatus.CANCELED;
        
        // Transfere os tokens de volta
        paymentToken.safeTransfer(msg.sender, pledge.amount);
        
        emit RefundIssued(pledgeId, msg.sender, pledge.amount);
        
        // Emite evento com o saldo de tokens atualizado após o reembolso
        uint256 newBalance = paymentToken.balanceOf(msg.sender);
        emit TokenBalanceUpdated(msg.sender, newBalance, pledge.amount);
    }

    /**
     * @dev Atualiza a taxa da plataforma (apenas admin)
     * @param newFeePercent Nova taxa em base 10000
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeePercent <= 2000, "TourCrowdfunding: fee too high"); // Máximo 20%
        platformFeePercent = newFeePercent;
    }

    /**
     * @dev Atualiza o endereço que coleta as taxas (apenas admin)
     * @param newFeeCollector Novo endereço coletor de taxas
     */
    function updateFeeCollector(address payable newFeeCollector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeCollector != address(0), "TourCrowdfunding: invalid address");
        feeCollector = newFeeCollector;
    }

    /**
     * @dev Pausa o contrato (apenas admin)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Despausa o contrato (apenas admin)
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Obtém os IDs das recompensas de uma campanha
     * @param campaignId ID da campanha
     * @return Array com os IDs das recompensas
     */
    function getCampaignRewardTiers(uint256 campaignId) external view returns (uint256[] memory) {
        return campaignRewardTierIds[campaignId];
    }

    /**
     * @dev Obtém os IDs dos pledges de uma campanha
     * @param campaignId ID da campanha
     * @return Array com os IDs dos pledges
     */
    function getCampaignPledges(uint256 campaignId) external view returns (uint256[] memory) {
        return campaignPledges[campaignId];
    }

    /**
     * @dev Obtém os IDs dos pledges de um apoiador
     * @param backer Endereço do apoiador
     * @return Array com os IDs dos pledges
     */
    function getBackerPledges(address backer) external view returns (uint256[] memory) {
        return backerPledges[backer];
    }
    
    /**
     * @dev Obtém o saldo de tokens de um usuário
     * @param user Endereço do usuário
     * @return Saldo atual de tokens
     */
    function getTokenBalance(address user) external view returns (uint256) {
        return paymentToken.balanceOf(user);
    }
}