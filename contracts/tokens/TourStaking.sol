// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title TourStaking
 * @dev Contrato para staking de tokens TOUR com recompensas
 */
contract TourStaking is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Estrutura para armazenar informações de staking de um usuário
    struct StakeInfo {
        uint256 amount;        // Quantidade de tokens em stake
        uint256 rewardDebt;    // Recompensa a ser subtraída durante coleta
        uint256 startTime;     // Quando o stake começou
        uint256 lastClaimTime; // Última vez que as recompensas foram reivindicadas
    }

    // Constantes e variáveis de estado
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REWARDS_DISTRIBUTOR_ROLE = keccak256("REWARDS_DISTRIBUTOR_ROLE");
    
    IERC20 public immutable tourToken;
    uint256 public rewardRate;           // Recompensa por segundo por token
    uint256 public totalStaked;          // Total de tokens em stake
    uint256 public rewardsEndTime;       // Quando as recompensas terminam
    uint256 public lastUpdateTime;       // Última atualização do estado de recompensas
    uint256 public rewardPerTokenStored; // Recompensa acumulada por token
    uint256 public minimumStakingPeriod; // Período mínimo de staking em segundos
    uint256 public earlyWithdrawalFee;   // Taxa para saques antecipados (em base 10000, ex: 500 = 5%)

    // Mapeamentos de staking
    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    // Eventos
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardAdded(uint256 reward, uint256 duration);
    event ParametersUpdated(uint256 minimumStakingPeriod, uint256 earlyWithdrawalFee);

    /**
     * @dev Inicializa o contrato com o endereço do token TOUR
     */
    constructor(
        address _tourToken,
        uint256 _minimumStakingPeriod,
        uint256 _earlyWithdrawalFee
    ) {
        require(_tourToken != address(0), "TourStaking: zero address");
        require(_earlyWithdrawalFee <= 1000, "TourStaking: fee too high");
        
        tourToken = IERC20(_tourToken);
        minimumStakingPeriod = _minimumStakingPeriod;
        earlyWithdrawalFee = _earlyWithdrawalFee;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(REWARDS_DISTRIBUTOR_ROLE, msg.sender);
    }

    /**
     * @dev Atualiza o estado de recompensas
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /**
     * @dev Retorna o último timestamp em que as recompensas são aplicáveis
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, rewardsEndTime);
    }

    /**
     * @dev Calcula a recompensa por token baseada no tempo decorrido
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        
        return rewardPerTokenStored + (
            (lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18 / totalStaked
        );
    }

    /**
     * @dev Calcula quanto um usuário ganhou até agora
     */
    function earned(address account) public view returns (uint256) {
        return (
            stakes[account].amount * (rewardPerToken() - userRewardPerTokenPaid[account]) / 1e18
        ) + rewards[account];
    }

    /**
     * @dev Permite que um usuário faça stake de tokens TOUR
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "TourStaking: Cannot stake 0");
        
        totalStaked += amount;
        
        if (stakes[msg.sender].amount > 0) {
            // Já tem stake, apenas adiciona mais
            stakes[msg.sender].amount += amount;
        } else {
            // Novo stake
            stakes[msg.sender] = StakeInfo({
                amount: amount,
                rewardDebt: 0,
                startTime: block.timestamp,
                lastClaimTime: block.timestamp
            });
        }
        
        tourToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Permite que um usuário retire seus tokens em stake
     */
    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "TourStaking: Cannot withdraw 0");
        require(stakes[msg.sender].amount >= amount, "TourStaking: Not enough staked");
        
        uint256 fee = 0;
        if (block.timestamp < stakes[msg.sender].startTime + minimumStakingPeriod) {
            fee = amount * earlyWithdrawalFee / 10000;
        }
        
        totalStaked -= amount;
        stakes[msg.sender].amount -= amount;
        
        // Transfere o valor menos a taxa, se houver
        tourToken.safeTransfer(msg.sender, amount - fee);
        
        // Se tiver taxa, ela fica no contrato como recompensa adicional
        
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Permite que um usuário reivindique suas recompensas
     */
    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            tourToken.safeTransfer(msg.sender, reward);
            stakes[msg.sender].lastClaimTime = block.timestamp;
            emit RewardClaimed(msg.sender, reward);
        }
    }

    /**
     * @dev Adiciona novas recompensas ao pool de staking
     */
    function addReward(uint256 rewardAmount, uint256 durationInSeconds) 
        external 
        onlyRole(REWARDS_DISTRIBUTOR_ROLE)
        updateReward(address(0))
    {
        require(rewardAmount > 0, "TourStaking: Reward must be > 0");
        require(durationInSeconds > 0, "TourStaking: Duration must be > 0");
        
        if (block.timestamp >= rewardsEndTime) {
            rewardRate = rewardAmount / durationInSeconds;
        } else {
            uint256 remainingSeconds = rewardsEndTime - block.timestamp;
            uint256 leftoverReward = remainingSeconds * rewardRate;
            rewardRate = (leftoverReward + rewardAmount) / durationInSeconds;
        }
        
        require(rewardRate > 0, "TourStaking: Reward rate = 0");
        
        uint256 balance = tourToken.balanceOf(address(this)) - totalStaked;
        require(
            rewardRate * durationInSeconds <= balance,
            "TourStaking: Provided reward too high"
        );
        
        lastUpdateTime = block.timestamp;
        rewardsEndTime = block.timestamp + durationInSeconds;
        
        emit RewardAdded(rewardAmount, durationInSeconds);
    }

    /**
     * @dev Atualiza os parâmetros de staking
     */
    function updateParameters(uint256 _minimumStakingPeriod, uint256 _earlyWithdrawalFee) 
        external 
        onlyRole(ADMIN_ROLE)
    {
        require(_earlyWithdrawalFee <= 1000, "TourStaking: fee too high");
        
        minimumStakingPeriod = _minimumStakingPeriod;
        earlyWithdrawalFee = _earlyWithdrawalFee;
        
        emit ParametersUpdated(_minimumStakingPeriod, _earlyWithdrawalFee);
    }

    /**
     * @dev Retorna a quantidade de tokens em stake de um usuário
     */
    function getStakeAmount(address account) external view returns (uint256) {
        return stakes[account].amount;
    }

    /**
     * @dev Retorna informações completas sobre o stake de um usuário
     */
    function getStakeInfo(address account) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 lastClaimTime,
        uint256 pendingRewards
    ) {
        StakeInfo memory userStake = stakes[account];
        return (
            userStake.amount,
            userStake.startTime,
            userStake.lastClaimTime,
            earned(account)
        );
    }
}