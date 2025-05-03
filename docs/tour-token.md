# TOUR Token Documentation

## Overview

The TOUR token is the native utility token of the TourChain ecosystem, designed to facilitate transactions, reward sustainable travel choices, enable governance participation, and provide access to premium platform features. This ERC-20 compliant token forms the economic backbone of our decentralized corporate travel management platform.

## Token Specifications

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Name** | Tour Token | Full name of the token |
| **Symbol** | TOUR | Trading symbol used on exchanges |
| **Decimals** | 18 | Number of decimal places (standard ERC-20) |
| **Total Supply** | 1,000,000,000 | Maximum number of tokens that will ever exist |
| **Contract** | [0x7C4A46E751F538A50210f97935A5E89984fcDA3B](https://etherscan.io/address/0x7C4A46E751F538A50210f97935A5E89984fcDA3B) | Ethereum Mainnet contract address |
| **Token Standard** | ERC-20 | Ethereum token standard |
| **Token Type** | Utility | Primary token purpose classification |

## Token Allocation

The initial distribution of TOUR tokens is designed to ensure broad participation, adequate liquidity, and sustainable platform development:

| Allocation | Percentage | Amount | Vesting |
|------------|------------|--------|---------|
| **Ecosystem Development** | 30% | 300,000,000 | 4-year linear vesting with 1-year cliff |
| **Team & Advisors** | 15% | 150,000,000 | 4-year linear vesting with 1-year cliff |
| **Community Rewards** | 25% | 250,000,000 | Released continuously based on platform activity |
| **Strategic Partners** | 10% | 100,000,000 | 2-year linear vesting |
| **Private Sale** | 10% | 100,000,000 | 1-year linear vesting |
| **Public Sale** | 5% | 50,000,000 | No vesting, immediately liquid |
| **Treasury** | 5% | 50,000,000 | Strategic reserve for future development |

## Tokenomics

### Value Accrual Mechanisms

TOUR tokens derive value through several complementary mechanisms:

1. **Utility Value**
   - Required for platform transaction fees
   - Used for carbon offset purchases
   - Needed for premium feature access

2. **Staking Rewards**
   - Time-weighted rewards for staked tokens
   - Tiered benefits based on stake amount
   - Governance voting weight

3. **Supply Constraints**
   - Fixed maximum supply (1 billion tokens)
   - Token burning from transaction fees
   - Staking lockups reducing circulating supply

4. **Demand Drivers**
   - Corporate adoption increasing token usage
   - Reward mechanisms incentivizing acquisition
   - Governance participation requirements

### Supply and Emission Schedule

The release of TOUR tokens follows a carefully designed schedule to prevent market flooding while ensuring adequate liquidity:

```
Year 1: 250,000,000 tokens (25% of total supply)
Year 2: 200,000,000 tokens (20% of total supply)
Year 3: 200,000,000 tokens (20% of total supply)
Year 4: 200,000,000 tokens (20% of total supply)
Year 5+: 150,000,000 tokens (15% of total supply) - Reserved for ongoing rewards
```

### Token Burning Mechanism

To create deflationary pressure as platform usage increases:

1. 10% of all platform fees are automatically burned
2. 5% of all carbon offset purchases result in token burning
3. Quarterly token buybacks and burns from treasury based on platform revenue
4. Optional burning mechanism for corporate users seeking carbon-negative status

## Token Utility

TOUR tokens serve multiple functions within the ecosystem:

### 1. Platform Currency

- **Transaction Fees**: Pay for services within the TourChain platform
- **Service Payments**: Corporate clients use TOUR to pay travel providers
- **Reward Distributions**: Distributed to users for sustainable travel choices

### 2. Staking Mechanism

- **Reward Generation**: Earn additional TOUR by staking existing tokens
- **Loyalty Tiers**: Unlock premium features based on stake amount
- **Fee Discounts**: Receive reduced transaction fees proportional to stake

### 3. Governance Tool

- **Proposal Voting**: Vote on platform development proposals
- **Parameter Setting**: Participate in determining key economic parameters
- **Funding Allocation**: Vote on ecosystem funding grant recipients

### 4. Crowdfunding

- **Project Backing**: Support sustainable tourism projects
- **Reward Tiers**: Receive exclusive rewards based on contribution amount
- **Verifiable Impact**: Track your environmental and social impact

## Governance Functions

TOUR token holders participate in platform governance through:

### Voting Rights

- 1 TOUR = 1 vote (when staked)
- Quadratic voting for certain proposals to prevent wealth concentration
- Delegation capability for token holders who wish to appoint representatives

### Proposal Types

1. **Economic Proposals**
   - Fee structure adjustments
   - Reward rate modifications
   - Treasury fund allocations

2. **Technical Proposals**
   - Smart contract upgrades
   - Feature prioritization
   - Oracle data source selection

3. **Environmental Proposals**
   - Carbon offset project approvals
   - Sustainability metric adjustments
   - Environmental incentive structures

### Governance Process

1. **Proposal Submission**: Requires 100,000 TOUR to submit formal proposals
2. **Discussion Period**: 7-day community discussion window
3. **Voting Period**: 5-day voting window
4. **Execution**: Automatic execution for approved proposals
5. **Emergency Pause**: Multi-sig guardian capability for security issues

## Technical Implementation

The TOUR token is implemented as an ERC-20 contract with additional functionality:

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

### Key Contract Features

1. **Role-Based Access Control**
   - MINTER_ROLE: Authorized to mint new tokens (within max supply)
   - PAUSER_ROLE: Can pause token transfers in emergency
   - DEFAULT_ADMIN_ROLE: Can grant/revoke other roles

2. **Maximum Supply Enforcement**
   - Hard cap of 1 billion tokens
   - Check implemented at the contract level

3. **Emergency Circuit Breaker**
   - Pause functionality for all transfers
   - Protected by multi-signature control

4. **Burn Capability**
   - Anyone can burn their own tokens
   - Authorized burners can burn from approved addresses

### Gnosis Safe Integration

All administrative roles for the TOUR token contract are assigned to a Gnosis Safe multi-signature wallet, requiring multiple signatures for:

- Minting new tokens
- Pausing/unpausing transfers
- Granting/revoking roles
- Executing governance decisions

## Acquiring TOUR Tokens

TOUR tokens can be acquired through several methods:

1. **Platform Rewards**
   - Choosing sustainable travel options
   - Participating in wellness programs
   - Contributing environmental data

2. **Token Exchanges**
   - Listed on major centralized exchanges
   - Available on decentralized exchanges
   - Direct purchase through platform for corporate clients

3. **Staking Rewards**
   - Passive earning through token staking
   - Bonus rewards for longer lock-up periods
   - Special promotional staking events

4. **Crowdfunding Rewards**
   - Backing sustainable tourism projects
   - Contributing to environmental initiatives
   - Supporting community development programs

## Security Considerations

The TOUR token implementation incorporates several security best practices:

1. **Audited Codebase**
   - Full security audit by [Security Firm]
   - Regular code reviews and updates
   - Comprehensive test coverage

2. **Multi-Signature Administration**
   - 3-of-5 signature requirement for administrative functions
   - Geographically distributed signers
   - Hardware wallet enforcement for all signers

3. **Gradual Minting**
   - Tokens minted according to predefined schedule
   - No single large minting events
   - Regular community reporting on supply changes

4. **Transparent Operations**
   - All parameter changes announced in advance
   - Real-time supply and distribution dashboard
   - Public governance proposals and voting

## Token Integration

### For Developers

Integrating TOUR token into applications involves:

1. **Standard ERC-20 Integration**
   ```javascript
   const tourToken = new ethers.Contract(
     TOUR_TOKEN_ADDRESS,
     TOUR_TOKEN_ABI,
     provider
   );
   
   // Check balance
   const balance = await tourToken.balanceOf(userAddress);
   
   // Transfer tokens
   const tx = await tourToken.transfer(recipientAddress, amount);
   await tx.wait();
   ```

2. **Staking Integration**
   ```javascript
   const tourStaking = new ethers.Contract(
     TOUR_STAKING_ADDRESS,
     TOUR_STAKING_ABI,
     provider
   );
   
   // Approve token spending
   await tourToken.approve(TOUR_STAKING_ADDRESS, amount);
   
   // Stake tokens
   await tourStaking.stake(amount);
   ```

3. **Governance Integration**
   ```javascript
   const tourGovernance = new ethers.Contract(
     TOUR_GOVERNANCE_ADDRESS,
     TOUR_GOVERNANCE_ABI,
     provider
   );
   
   // Submit proposal
   await tourGovernance.propose(targets, values, signatures, calldatas, description);
   
   // Cast vote
   await tourGovernance.castVote(proposalId, support);
   ```

### For Corporate Users

Corporate integration of TOUR token involves:

1. **Bulk Acquisition**: Corporate purchase program for volume buyers
2. **Treasury Management**: Tools for managing token holdings
3. **Employee Distribution**: Systems for allocating tokens to employees
4. **Reporting Tools**: Analytics on token usage and impact

## Future Development

The TOUR token roadmap includes:

1. **Governance Evolution**
   - Transition to full DAO structure
   - Weighted voting based on staking duration
   - Specialized committees for different focus areas

2. **Technical Enhancements**
   - ERC-1155 NFT integration for achievement badges
   - Layer 2 scaling solutions for reduced transaction costs
   - Cross-chain bridges for multi-blockchain support

3. **Economic Model Refinements**
   - Dynamic fee structure based on network activity
   - Advanced yield strategies for staked tokens
   - Reputation-based rewards amplification

## Additional Resources

- [Token Contract Address](https://etherscan.io/address/0x7C4A46E751F538A50210f97935A5E89984fcDA3B)
- [GitHub Repository](https://github.com/tourchain/contracts)
- [Economic Whitepaper](https://tourchain.io/whitepaper.pdf)
- [Governance Forum](https://governance.tourchain.io)