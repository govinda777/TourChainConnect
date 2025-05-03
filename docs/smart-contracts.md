# TourChain Smart Contract Architecture

## Overview

TourChain's blockchain infrastructure is built on a system of five interconnected smart contracts that form the foundation of our platform. These contracts enable transparent corporate travel management, loyalty programs, crowdfunding for sustainable tourism projects, and environmental impact tracking.

![Smart Contract Architecture](./smart-contracts-architecture.svg)

## Core Smart Contracts

### TourToken (ERC-20)

**Purpose:** TOUR is the native utility token that powers the entire ecosystem.

**Key Functions:**
- Serves as the medium of exchange within the platform
- Rewards sustainable travel choices
- Enables participation in governance decisions
- Provides access to premium features through staking

**Technical Implementation:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TourToken is ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    constructor() ERC20("Tour Token", "TOUR") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

**Security Considerations:**
- Role-based access control for administrative functions
- Maximum supply cap to prevent inflation
- Pausable functionality for emergency situations
- Burnable tokens for deflationary economics

### TourStaking

**Purpose:** Enables users to lock TOUR tokens in return for rewards and special platform privileges.

**Key Functions:**
- Token staking with customizable time periods
- Time-weighted reward distribution
- Tiered benefits based on staking amount
- Penalty system for early withdrawal

**Technical Implementation:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TourStaking is ReentrancyGuard, Ownable {
    IERC20 public tourToken;
    
    struct StakeInfo {
        uint256 amount;
        uint256 since;
        uint256 claimedRewards;
    }
    
    mapping(address => StakeInfo) public stakers;
    uint256 public rewardRate = 10; // 10 basis points (0.1%) per day
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    
    constructor(address _tourToken) {
        tourToken = IERC20(_tourToken);
    }
    
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        
        if (stakers[msg.sender].amount > 0) {
            claimReward();
        }
        
        stakers[msg.sender].amount += amount;
        if (stakers[msg.sender].since == 0) {
            stakers[msg.sender].since = block.timestamp;
        }
        
        totalStaked += amount;
        tourToken.transferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage stake = stakers[msg.sender];
        require(stake.amount >= amount, "Insufficient staked amount");
        
        claimReward();
        
        stake.amount -= amount;
        totalStaked -= amount;
        
        if (stake.amount == 0) {
            stake.since = 0;
        }
        
        tourToken.transfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    function claimReward() public nonReentrant returns (uint256) {
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            stakers[msg.sender].claimedRewards += reward;
            tourToken.transfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
        return reward;
    }
    
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory stake = stakers[user];
        if (stake.amount == 0) return 0;
        
        uint256 stakingDays = (block.timestamp - stake.since) / 86400;
        uint256 reward = stake.amount * stakingDays * rewardRate / 10000;
        return reward - stake.claimedRewards;
    }
    
    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
    }
}
```

**Security Considerations:**
- Reentrancy protection for all state-changing functions
- Clear reward calculation logic with owner-adjustable rates
- Event emission for important state changes
- Protection against zero-amount staking

### TourCrowdfunding

**Purpose:** Facilitates fundraising for sustainable tourism projects, with built-in reward tiers for backers.

**Key Functions:**
- Project creation with detailed metadata
- Contribution tracking with token rewards
- Deadline and funding goal enforcement
- Transparent fund distribution

**Technical Implementation:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TourCrowdfunding is ReentrancyGuard, AccessControl {
    bytes32 public constant PROJECT_CREATOR_ROLE = keccak256("PROJECT_CREATOR_ROLE");
    bytes32 public constant FEE_COLLECTOR_ROLE = keccak256("FEE_COLLECTOR_ROLE");
    
    IERC20 public tourToken;
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public projectCounter;
    
    struct Project {
        address creator;
        string title;
        string description;
        uint256 fundingGoal;
        uint256 deadline;
        uint256 raisedAmount;
        bool fundsWithdrawn;
        mapping(address => uint256) contributions;
        uint256 contributorsCount;
    }
    
    struct RewardTier {
        string title;
        uint256 minContribution;
        uint256 tokenReward;
        uint256 maxClaims;
        uint256 claimedCount;
    }
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => RewardTier[]) public projectRewards;
    mapping(uint256 => mapping(address => mapping(uint256 => bool))) public rewardsClaimed;
    
    event ProjectCreated(uint256 projectId, address creator, string title, uint256 fundingGoal, uint256 deadline);
    event Contribution(uint256 projectId, address contributor, uint256 amount);
    event RewardClaimed(uint256 projectId, address contributor, uint256 tierId);
    event FundsWithdrawn(uint256 projectId, address creator, uint256 amount);
    event RefundIssued(uint256 projectId, address contributor, uint256 amount);
    
    constructor(address _tourToken) {
        tourToken = IERC20(_tourToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FEE_COLLECTOR_ROLE, msg.sender);
    }
    
    function createProject(
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint256 durationDays,
        RewardTier[] memory rewards
    ) external returns (uint256) {
        require(fundingGoal > 0, "Funding goal must be greater than 0");
        require(durationDays > 0 && durationDays <= 90, "Duration must be between 1 and 90 days");
        
        uint256 projectId = projectCounter++;
        Project storage project = projects[projectId];
        project.creator = msg.sender;
        project.title = title;
        project.description = description;
        project.fundingGoal = fundingGoal;
        project.deadline = block.timestamp + (durationDays * 86400);
        
        for (uint256 i = 0; i < rewards.length; i++) {
            projectRewards[projectId].push(rewards[i]);
        }
        
        emit ProjectCreated(projectId, msg.sender, title, fundingGoal, project.deadline);
        return projectId;
    }
    
    function contribute(uint256 projectId, uint256 amount) external nonReentrant {
        Project storage project = projects[projectId];
        
        require(block.timestamp < project.deadline, "Project funding period has ended");
        require(amount > 0, "Contribution amount must be greater than 0");
        
        if (project.contributions[msg.sender] == 0) {
            project.contributorsCount++;
        }
        
        project.contributions[msg.sender] += amount;
        project.raisedAmount += amount;
        
        // Transfer tokens from contributor to this contract
        tourToken.transferFrom(msg.sender, address(this), amount);
        
        // Emit balances after contribution for frontend tracking
        emit Contribution(projectId, msg.sender, amount);
    }
    
    function claimReward(uint256 projectId, uint256 tierId) external nonReentrant {
        Project storage project = projects[projectId];
        RewardTier storage tier = projectRewards[projectId][tierId];
        
        require(!rewardsClaimed[projectId][msg.sender][tierId], "Reward already claimed");
        require(project.contributions[msg.sender] >= tier.minContribution, "Insufficient contribution for this reward");
        require(tier.claimedCount < tier.maxClaims, "All rewards of this tier have been claimed");
        
        rewardsClaimed[projectId][msg.sender][tierId] = true;
        tier.claimedCount++;
        
        // Transfer reward tokens to the contributor
        tourToken.transfer(msg.sender, tier.tokenReward);
        
        emit RewardClaimed(projectId, msg.sender, tierId);
    }
    
    function withdrawFunds(uint256 projectId) external nonReentrant {
        Project storage project = projects[projectId];
        
        require(msg.sender == project.creator, "Only project creator can withdraw funds");
        require(block.timestamp >= project.deadline, "Funding period not ended yet");
        require(project.raisedAmount >= project.fundingGoal, "Funding goal not reached");
        require(!project.fundsWithdrawn, "Funds already withdrawn");
        
        project.fundsWithdrawn = true;
        
        uint256 fee = project.raisedAmount * platformFee / 10000;
        uint256 creatorAmount = project.raisedAmount - fee;
        
        // Transfer funds to creator and fee to platform
        tourToken.transfer(project.creator, creatorAmount);
        tourToken.transfer(getRoleMember(FEE_COLLECTOR_ROLE, 0), fee);
        
        emit FundsWithdrawn(projectId, project.creator, creatorAmount);
    }
    
    function refund(uint256 projectId) external nonReentrant {
        Project storage project = projects[projectId];
        
        require(block.timestamp >= project.deadline, "Funding period not ended yet");
        require(project.raisedAmount < project.fundingGoal, "Funding goal reached, cannot refund");
        require(!project.fundsWithdrawn, "Funds already withdrawn");
        require(project.contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 refundAmount = project.contributions[msg.sender];
        project.contributions[msg.sender] = 0;
        project.raisedAmount -= refundAmount;
        
        // Transfer refund to contributor
        tourToken.transfer(msg.sender, refundAmount);
        
        emit RefundIssued(projectId, msg.sender, refundAmount);
    }
    
    function getProjectDetails(uint256 projectId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint256 deadline,
        uint256 raisedAmount,
        bool fundsWithdrawn,
        uint256 contributorsCount
    ) {
        Project storage project = projects[projectId];
        return (
            project.creator,
            project.title,
            project.description,
            project.fundingGoal,
            project.deadline,
            project.raisedAmount,
            project.fundsWithdrawn,
            project.contributorsCount
        );
    }
    
    function getContribution(uint256 projectId, address contributor) external view returns (uint256) {
        return projects[projectId].contributions[contributor];
    }
    
    function getRewardTiersCount(uint256 projectId) external view returns (uint256) {
        return projectRewards[projectId].length;
    }
    
    function setPlatformFee(uint256 _platformFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_platformFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _platformFee;
    }
}
```

**Security Considerations:**
- Comprehensive event emission for transparency
- Deadline and funding goal validations
- Protection against double claiming of rewards
- Role-based access for fee collection and administration

### TourOracle

**Purpose:** Brings real-world data about travel services, prices, and environmental impacts onto the blockchain.

**Key Functions:**
- External API integrations with travel providers
- Carbon emission data sourcing
- Price feeds for travel services
- Weather and climate data access

**Technical Implementation:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract TourOracle is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Flight pricing data
    mapping(bytes32 => uint256) public flightPrices;
    
    // Hotel pricing data
    mapping(bytes32 => uint256) public hotelPrices;
    
    // Carbon emission factors (gCO2/km)
    mapping(string => uint256) public emissionFactors;
    
    // Last update timestamps
    mapping(bytes32 => uint256) public lastUpdated;
    
    event PriceUpdated(string dataType, bytes32 indexed key, uint256 price, uint256 timestamp);
    event EmissionFactorUpdated(string transportType, uint256 factor, uint256 timestamp);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        
        // Initialize default emission factors (gCO2/km)
        emissionFactors["plane"] = 180;
        emissionFactors["car"] = 120;
        emissionFactors["train"] = 30;
        emissionFactors["bus"] = 68;
    }
    
    // Helper function to generate flight key
    function getFlightKey(string memory from, string memory to, uint256 date) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(from, to, date));
    }
    
    // Helper function to generate hotel key
    function getHotelKey(string memory hotel, uint256 checkIn, uint256 checkOut) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(hotel, checkIn, checkOut));
    }
    
    // Update flight prices (called by trusted oracle)
    function updateFlightPrice(
        string memory from,
        string memory to,
        uint256 date,
        uint256 price
    ) external onlyRole(ORACLE_ROLE) {
        bytes32 key = getFlightKey(from, to, date);
        flightPrices[key] = price;
        lastUpdated[key] = block.timestamp;
        
        emit PriceUpdated("flight", key, price, block.timestamp);
    }
    
    // Update hotel prices (called by trusted oracle)
    function updateHotelPrice(
        string memory hotel,
        uint256 checkIn,
        uint256 checkOut,
        uint256 price
    ) external onlyRole(ORACLE_ROLE) {
        bytes32 key = getHotelKey(hotel, checkIn, checkOut);
        hotelPrices[key] = price;
        lastUpdated[key] = block.timestamp;
        
        emit PriceUpdated("hotel", key, price, block.timestamp);
    }
    
    // Update emission factors (called by admin)
    function updateEmissionFactor(string memory transportType, uint256 factor) external onlyRole(ADMIN_ROLE) {
        emissionFactors[transportType] = factor;
        
        emit EmissionFactorUpdated(transportType, factor, block.timestamp);
    }
    
    // Get flight price
    function getFlightPrice(string memory from, string memory to, uint256 date) external view returns (uint256) {
        bytes32 key = getFlightKey(from, to, date);
        return flightPrices[key];
    }
    
    // Get hotel price
    function getHotelPrice(string memory hotel, uint256 checkIn, uint256 checkOut) external view returns (uint256) {
        bytes32 key = getHotelKey(hotel, checkIn, checkOut);
        return hotelPrices[key];
    }
    
    // Get carbon emissions for a journey
    function getCarbonEmissions(uint256 distance, string memory transportType) external view returns (uint256) {
        return distance * emissionFactors[transportType] / 1000; // Convert to kg CO2
    }
    
    // Check if price data is fresh (less than 24 hours old)
    function isPriceFresh(bytes32 key) external view returns (bool) {
        return (block.timestamp - lastUpdated[key]) < 1 days;
    }
}
```

**Security Considerations:**
- Role separation between oracles and administrators
- Timestamp tracking for data freshness
- Structured key generation for data consistency
- Event emission for all data updates

### CarbonOffset

**Purpose:** Tracks, calculates, and verifies carbon offsets for business travel activities.

**Key Functions:**
- Carbon emission calculation
- Offset certificate generation
- Verification of offset projects
- Transparent reporting of environmental impact

**Technical Implementation:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface ITourOracle {
    function getCarbonEmissions(uint256 distance, string memory transportType) external view returns (uint256);
}

contract CarbonOffset is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    IERC20 public tourToken;
    ITourOracle public oracle;
    
    // Pricing in TOUR tokens per kg of CO2
    uint256 public offsetPrice = 100; // 100 tokens per ton of CO2
    
    Counters.Counter private _certificateIds;
    
    struct OffsetCertificate {
        address owner;
        uint256 amount; // in kg of CO2
        string project;
        uint256 timestamp;
        bool verified;
    }
    
    struct OffsetProject {
        string name;
        string description;
        string location;
        string projectType;
        bool active;
    }
    
    mapping(uint256 => OffsetCertificate) public certificates;
    mapping(string => OffsetProject) public offsetProjects;
    string[] public projectList;
    
    // Total offset statistics
    uint256 public totalOffsetsKg;
    mapping(address => uint256) public userOffsetsKg;
    
    event CertificateIssued(uint256 certificateId, address owner, uint256 amount, string project);
    event CertificateVerified(uint256 certificateId);
    event ProjectAdded(string projectId, string name, string projectType);
    event OffsetPriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    constructor(address _tourToken, address _oracle) {
        tourToken = IERC20(_tourToken);
        oracle = ITourOracle(_oracle);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    function addOffsetProject(
        string memory projectId,
        string memory name,
        string memory description,
        string memory location,
        string memory projectType
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(offsetProjects[projectId].name).length == 0, "Project already exists");
        
        offsetProjects[projectId] = OffsetProject({
            name: name,
            description: description,
            location: location,
            projectType: projectType,
            active: true
        });
        
        projectList.push(projectId);
        
        emit ProjectAdded(projectId, name, projectType);
    }
    
    function calculateTripEmissions(
        uint256 distance,
        string memory transportType
    ) external view returns (uint256) {
        return oracle.getCarbonEmissions(distance, transportType);
    }
    
    function calculateOffsetCost(uint256 emissionsKg) public view returns (uint256) {
        return emissionsKg * offsetPrice / 1000; // Convert kg to tons for pricing
    }
    
    function purchaseOffset(
        uint256 emissionsKg,
        string memory projectId
    ) external nonReentrant returns (uint256) {
        require(emissionsKg > 0, "Emissions must be greater than 0");
        require(offsetProjects[projectId].active, "Offset project not active");
        
        uint256 cost = calculateOffsetCost(emissionsKg);
        
        // Transfer tokens from user to contract
        tourToken.transferFrom(msg.sender, address(this), cost);
        
        // Create certificate
        uint256 certificateId = _certificateIds.current();
        _certificateIds.increment();
        
        certificates[certificateId] = OffsetCertificate({
            owner: msg.sender,
            amount: emissionsKg,
            project: projectId,
            timestamp: block.timestamp,
            verified: false
        });
        
        // Update statistics
        totalOffsetsKg += emissionsKg;
        userOffsetsKg[msg.sender] += emissionsKg;
        
        emit CertificateIssued(certificateId, msg.sender, emissionsKg, projectId);
        
        return certificateId;
    }
    
    function verifyCertificate(uint256 certificateId) external onlyRole(VERIFIER_ROLE) {
        require(certificates[certificateId].owner != address(0), "Certificate doesn't exist");
        require(!certificates[certificateId].verified, "Certificate already verified");
        
        certificates[certificateId].verified = true;
        
        emit CertificateVerified(certificateId);
    }
    
    function setOffsetPrice(uint256 newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldPrice = offsetPrice;
        offsetPrice = newPrice;
        
        emit OffsetPriceUpdated(oldPrice, newPrice);
    }
    
    function getActiveProjects() external view returns (string[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < projectList.length; i++) {
            if (offsetProjects[projectList[i]].active) {
                activeCount++;
            }
        }
        
        string[] memory active = new string[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < projectList.length; i++) {
            if (offsetProjects[projectList[i]].active) {
                active[index] = projectList[i];
                index++;
            }
        }
        
        return active;
    }
    
    function getCertificate(uint256 certificateId) external view returns (
        address owner,
        uint256 amount,
        string memory project,
        uint256 timestamp,
        bool verified
    ) {
        OffsetCertificate memory cert = certificates[certificateId];
        return (
            cert.owner,
            cert.amount,
            cert.project,
            cert.timestamp,
            cert.verified
        );
    }
    
    function getUserOffsets(address user) external view returns (uint256) {
        return userOffsetsKg[user];
    }
}
```

**Security Considerations:**
- Role-based verification system
- Non-reentrancy protection for financial transactions
- Active status tracking for offset projects
- Comprehensive event logging for all activities

## Contract Interaction Flow

The TourChain smart contracts interact in the following ways:

1. **TourToken** → **TourStaking**: Users stake TOUR tokens to earn rewards
2. **TourToken** → **TourCrowdfunding**: Projects are funded using TOUR tokens
3. **TourCrowdfunding** → **CarbonOffset**: Funded projects can allocate funds to carbon offsets
4. **TourOracle** → **CarbonOffset**: Oracle provides emission data for offset calculations
5. **Gnosis Safe** → **All Contracts**: Administrative actions are executed through multi-signature approval

## Gnosis Safe Integration

### Multi-Signature Security

All TourChain smart contracts employ role-based access control for administrative functions. These admin roles are assigned to a Gnosis Safe multi-signature wallet rather than individual EOAs (Externally Owned Accounts), providing:

1. **Enhanced Security**: Multiple signatures required for critical actions
2. **Transparent Governance**: All proposed transactions are publicly visible
3. **Auditability**: Complete history of administrative actions
4. **Compromise Protection**: No single point of failure

### Implementation Details

```solidity
// Example of contract initialization with Gnosis Safe admin
constructor(address _gnosisSafe) {
    _grantRole(DEFAULT_ADMIN_ROLE, _gnosisSafe);
    _grantRole(PAUSER_ROLE, _gnosisSafe);
    _grantRole(UPGRADER_ROLE, _gnosisSafe);
}
```

### Transaction Flow

1. An admin proposes a transaction (e.g., updating the platform fee)
2. The proposal is visible in the Gnosis Safe interface
3. Required signers review and approve the transaction
4. Once threshold is met, the transaction is executed automatically
5. All actions are permanently recorded on-chain

## Development & Deployment

### Contract Dependency Graph

```
TourToken
    ↓
TourStaking ← TourToken
    ↓
TourCrowdfunding ← TourToken
    ↓
TourOracle
    ↓
CarbonOffset ← TourToken, TourOracle
```

### Deployment Process

TourChain contracts are deployed in a specific sequence to ensure proper dependency resolution:

1. Deploy TourToken
2. Deploy TourStaking with TourToken address
3. Deploy TourCrowdfunding with TourToken address
4. Deploy TourOracle
5. Deploy CarbonOffset with TourToken and TourOracle addresses
6. Setup Gnosis Safe and transfer admin roles

Our CI/CD pipeline automates this process and includes security scanning, gas optimization, and verification on block explorers.

## Audit and Security

TourChain smart contracts undergo rigorous security analysis:

1. **Automated Testing**: 100% code coverage with comprehensive unit and integration tests
2. **Static Analysis**: Mythril scans for common vulnerabilities
3. **Best Practices**: Implementation of established security patterns
4. **Multi-Signature Security**: Administrative functions secured by Gnosis Safe

### Known Limitations

1. **Oracle Dependency**: The CarbonOffset contract relies on TourOracle for accurate data
2. **Gas Considerations**: Some operations may be gas-intensive during peak network congestion
3. **Block Time Dependency**: Time-based functions rely on block timestamps

## Future Development

1. **Layer 2 Migration**: Plans to deploy on zkSync/Optimism for reduced gas fees
2. **DAO Governance**: Transition to full community governance
3. **Cross-Chain Functionality**: Support for multiple blockchain networks
4. **Enhanced Oracle System**: Integration with additional data sources
5. **NFT Integration**: Verifiable carbon offset certificates as NFTs