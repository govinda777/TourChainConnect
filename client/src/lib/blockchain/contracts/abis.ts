// Este arquivo contém placeholders para os ABIs (Application Binary Interfaces) dos contratos
// Após o deploy dos contratos, os ABIs completos devem ser copiados para este arquivo

/**
 * Os ABIs reais serão gerados durante o deploy dos contratos
 * e podem ser encontrados em contracts/artifacts/contracts/.../Contract.json
 * 
 * Você precisará extrair o campo "abi" de cada arquivo JSON gerado
 * e substituir os placeholders abaixo.
 */

// Placeholder do ABI do token TOUR
// Após o deploy, substitua com o ABI real do contrato
export const TOUR_TOKEN_ABI = [
  // Funções básicas de um token ERC20
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Funções específicas do TourToken
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function maxSupply() view returns (uint256)",
  
  // Eventos
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Placeholder do ABI do contrato de staking
export const TOUR_STAKING_ABI = [
  // Funções básicas do contrato de staking
  "function tourToken() view returns (address)",
  "function rewardRate() view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function minimumStakingPeriod() view returns (uint256)",
  "function earlyWithdrawalFee() view returns (uint256)",
  
  // Funções de staking
  "function stake(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claimReward()",
  "function earned(address account) view returns (uint256)",
  "function getStakeAmount(address account) view returns (uint256)",
  "function getStakeInfo(address account) view returns (uint256, uint256, uint256, uint256)",
  
  // Funções administrativas
  "function addReward(uint256 rewardAmount, uint256 durationInSeconds)",
  "function updateParameters(uint256 _minimumStakingPeriod, uint256 _earlyWithdrawalFee)",
  
  // Eventos
  "event Staked(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardClaimed(address indexed user, uint256 reward)",
  "event RewardAdded(uint256 reward, uint256 duration)",
  "event ParametersUpdated(uint256 minimumStakingPeriod, uint256 earlyWithdrawalFee)"
];

// Placeholder do ABI do contrato de crowdfunding
export const TOUR_CROWDFUNDING_ABI = [
  // Funções de consulta
  "function campaigns(uint256) view returns (uint256, string, string, address, uint256, uint256, uint256, uint8, uint256, bool)",
  "function campaignRewardTiers(uint256, uint256) view returns (uint256, string, uint256, uint256, string, uint256, uint256, uint8)",
  "function pledges(uint256) view returns (uint256, address, string, string, uint256, uint256, string, bool, uint8, uint256)",
  "function paymentToken() view returns (address)",
  "function platformFeePercent() view returns (uint256)",
  "function feeCollector() view returns (address)",
  
  // Funções de campanha
  "function createCampaign(string title, string description, uint256 fundingGoal, uint256 durationInDays) returns (uint256)",
  "function addRewardTier(uint256 campaignId, string title, uint256 minimumAmount, uint256 tokenAmount, string description, uint256 limit, uint8 tierType) returns (uint256)",
  "function pledge(uint256 campaignId, uint256 amount, uint256 rewardTierId, string name, string email, string comment, bool isAnonymous) returns (uint256)",
  "function updatePledgeStatus(uint256 pledgeId, uint8 newStatus)",
  "function cancelCampaign(uint256 campaignId)",
  "function claimFunds(uint256 campaignId)",
  "function requestRefund(uint256 pledgeId)",
  
  // Funções de consulta adicionais
  "function getCampaignRewardTiers(uint256 campaignId) view returns (uint256[])",
  "function getCampaignPledges(uint256 campaignId) view returns (uint256[])",
  "function getBackerPledges(address backer) view returns (uint256[])",
  
  // Funções administrativas
  "function updatePlatformFee(uint256 newFeePercent)",
  "function updateFeeCollector(address payable newFeeCollector)",
  
  // Eventos
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 goal, uint256 deadline)",
  "event RewardTierAdded(uint256 indexed campaignId, uint256 indexed tierId, string title, uint256 minimumAmount)",
  "event PledgeCreated(uint256 indexed campaignId, uint256 indexed pledgeId, address indexed backer, uint256 amount, uint256 rewardTierId)",
  "event PledgeStatusChanged(uint256 indexed pledgeId, uint8 status)",
  "event CampaignStatusUpdated(uint256 indexed campaignId, uint8 status)",
  "event CreatorClaimed(uint256 indexed campaignId, uint256 amount)",
  "event RefundIssued(uint256 indexed pledgeId, address indexed backer, uint256 amount)"
];

// Placeholder do ABI do contrato de oracle
export const TOUR_ORACLE_ABI = [
  // Funções de dados
  "function getCarbonEmission(bytes32 dataId) view returns (uint256, uint256, string, uint256, string)",
  "function getPrice(bytes32 dataId) view returns (uint256, string, uint256, string)",
  "function getTravelOptimization(bytes32 dataId) view returns (uint256, string, string, uint256, uint256, uint256, string[], string)",
  
  // Funções oracles
  "function updateCarbonEmission(bytes32 dataId, uint256 emissionAmount, string calldata travelMode, uint256 distance, string calldata dataSource)",
  "function updatePrice(bytes32 dataId, string calldata currencyPair, uint256 price, string calldata dataSource)",
  "function updateTravelOptimization(bytes32 dataId, string calldata origin, string calldata destination, uint256 optimizedCost, uint256 originalCost, uint256 savingsPercent, string[] calldata optimizations, string calldata dataSource)",
  
  // Funções de oracles
  "function addOracle(address oracle) payable",
  "function removeOracle(address oracle)",
  "function updateStake() payable",
  "function updateMinimumStake(uint256 _minimumStake)",
  "function getOraclesList() view returns (address[])",
  "function oracleStakes(address) view returns (uint256)",
  "function minimumStake() view returns (uint256)",
  
  // Eventos
  "event CarbonEmissionUpdated(bytes32 indexed dataId, uint256 timestamp, uint256 emissionAmount, string travelMode)",
  "event PriceUpdated(bytes32 indexed dataId, uint256 timestamp, string currencyPair, uint256 price)",
  "event TravelOptimizationUpdated(bytes32 indexed dataId, uint256 timestamp, string origin, string destination, uint256 savingsPercent)",
  "event OracleAdded(address indexed oracle, uint256 stake)",
  "event OracleRemoved(address indexed oracle)",
  "event StakeUpdated(address indexed oracle, uint256 newStake)",
  "event MinimumStakeUpdated(uint256 newMinimumStake)"
];

// Placeholder do ABI do contrato de compensação de carbono
export const CARBON_OFFSET_ABI = [
  // Funções básicas
  "function paymentToken() view returns (address)",
  "function offsetAdmin() view returns (address)",
  "function platformFeePercent() view returns (uint256)",
  "function totalEmissionsTracked() view returns (uint256)",
  "function totalEmissionsOffset() view returns (uint256)",
  
  // Funções de consulta
  "function offsets(uint256) view returns (uint256, address, uint256, string, uint256, uint256, bool, uint256, string)",
  "function offsetProjects(uint256) view returns (uint256, string, string, uint256, string, string, bool, uint256, uint256)",
  
  // Funções operacionais
  "function addOffsetProject(string name, string description, uint256 pricePerTon, string location, string projectType, uint256 totalCapacity) returns (uint256)",
  "function updateOffsetProject(uint256 projectId, uint256 pricePerTon, uint256 additionalCapacity, bool active)",
  "function createOffset(uint256 projectId, uint256 emissionAmount, string travelDetails, string offsetMethod) returns (uint256)",
  "function verifyOffset(uint256 offsetId)",
  
  // Funções administrativas
  "function updatePlatformFee(uint256 newFeePercent)",
  "function updateOffsetAdmin(address payable newAdmin)",
  
  // Funções de consulta adicionais
  "function getCompanyOffsets(address company) view returns (uint256[])",
  "function getProjectOffsets(uint256 projectId) view returns (uint256[])",
  "function calculateOffsetCost(uint256 projectId, uint256 emissionAmount) view returns (uint256, uint256)",
  
  // Eventos
  "event OffsetCreated(uint256 indexed offsetId, address indexed company, uint256 emissionAmount, uint256 offsetAmount, uint256 cost)",
  "event OffsetVerified(uint256 indexed offsetId, address indexed verifier)",
  "event ProjectAdded(uint256 indexed projectId, string name, uint256 pricePerTon, uint256 capacity)",
  "event ProjectUpdated(uint256 indexed projectId, uint256 pricePerTon, uint256 remainingCapacity, bool active)",
  "event PlatformFeeUpdated(uint256 newFeePercent)"
];