# Documentação do Token TOUR

## Visão Geral

O token TOUR é um token utilitário baseado no padrão ERC-20 que serve como a espinha dorsal do ecossistema TourChain. Estes tokens proporcionam utilidade, governança e incentivos para todos os participantes da plataforma de gerenciamento de viagens corporativas.

## Especificações Técnicas

| Característica | Especificação |
|----------------|---------------|
| Nome | TOUR Token |
| Símbolo | TOUR |
| Decimais | 18 |
| Padrão | ERC-20 |
| Suprimento Total | 500.000.000 TOUR |
| Suprimento Circulante Inicial | 100.000.000 TOUR |
| Tecnologia | Smart Contracts EVM |
| Cronograma de Emissão | Degressivo ao longo de 4 anos |
| Blockchain Principal | Ethereum (com bridges para outras redes) |

## Tokenomics

### Distribuição Inicial

A distribuição inicial de tokens TOUR foi cuidadosamente planejada para garantir a sustentabilidade a longo prazo do projeto:

* **30% (150.000.000 TOUR)** - Desenvolvimento da plataforma
  * Período de vesting: 3 anos, com liberação trimestral
  * Uso: Financiamento do desenvolvimento contínuo da plataforma

* **25% (125.000.000 TOUR)** - Incentivos à comunidade
  * Liberação gradual baseada em marcos de adoção
  * Uso: Programas de incentivo para usuários, recompensas de staking

* **20% (100.000.000 TOUR)** - Investidores iniciais e crowdfunding
  * Vesting: 1 ano de cliff, seguido por 2 anos de liberação linear
  * Uso: Financiamento inicial e liquidez de mercado

* **15% (75.000.000 TOUR)** - Equipe e consultores
  * Vesting: 1 ano de cliff, seguido por 3 anos de liberação linear
  * Uso: Compensação da equipe e consultores

* **10% (50.000.000 TOUR)** - Ecossistema e parcerias
  * Liberação estratégica conforme necessidades do ecossistema
  * Uso: Parcerias estratégicas, iniciativas de desenvolvimento do ecossistema

### Mecanismos de Queima

Para criar pressão deflacionária e aumentar o valor no longo prazo, implementamos os seguintes mecanismos de queima:

1. **Queima de Transações**: 0,5% de todas as transações de reserva de viagem na plataforma resulta em queima de tokens
2. **Queima Programática**: Eventos trimestrais de queima baseados em métricas de desempenho da plataforma
3. **Recompra e Queima**: 20% dos lucros da plataforma são utilizados para recompra e queima de tokens no mercado aberto

## Utilidade do Token

### Acesso à Plataforma

* **Níveis de Assinatura**: Diferentes níveis de acesso à plataforma baseados na quantidade de tokens stakados
* **Recursos Premium**: Funcionalidades exclusivas desbloqueadas com saldo mínimo de tokens
* **Descontos em Serviços**: Até 30% de desconto em taxas da plataforma com base na quantidade de tokens em posse

### Governança

* **Propostas de Melhoria**: Holders de tokens podem propor melhorias na plataforma (mínimo: 10.000 TOUR)
* **Votação**: Sistema de votação on-chain ponderado pela quantidade de tokens em posse
* **Decisões de Governança**: Controle sobre atualizações de protocolo, alocação de fundos do tesouro e parâmetros do sistema

### Recompensas e Incentivos

* **Staking**: Prêmios de staking por bloquear tokens (APY variável de 5-15%)
* **Recompensas de Validação**: Tokens para provedores de serviço que mantêm altos padrões de qualidade
* **Programas de Cashback**: Devolução de percentual de gastos na forma de tokens
* **Recompensas de Referral**: Tokens para usuários que indicam novas empresas para a plataforma

### Casos de Uso Específicos no Ecossistema TourChain

1. **Compensação de Carbono**: Compra de créditos de carbono tokenizados dentro da plataforma
2. **Reservas de Viagem**: Desconto adicional quando o pagamento é feito em tokens TOUR
3. **Programa de Bem-Estar**: Desbloqueio de recompensas especiais de bem-estar baseado em saldo de tokens
4. **Upgrade de Classe**: Possibilidade de usar tokens para upgrades de classe em voos parceiros
5. **Votação em Fornecedores**: Influenciar quais fornecedores são integrados à plataforma

## Mecanismos Técnicos

### Smart Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract TourToken is ERC20, ERC20Burnable, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    uint256 public constant MAX_SUPPLY = 500_000_000 * 10**18; // 500 milhões de tokens
    uint256 public tokensBurned;
    
    event TokensBurned(address indexed burner, uint256 amount);
    event RewardDistributed(address indexed recipient, uint256 amount, string reason);
    
    constructor() 
        ERC20("Tour Token", "TOUR") 
        ERC20Permit("Tour Token") 
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }
    
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Excede o suprimento maximo");
        _mint(to, amount);
    }
    
    function burnTokens(uint256 amount) public {
        _burn(_msgSender(), amount);
        tokensBurned += amount;
        emit TokensBurned(_msgSender(), amount);
    }
    
    function distributeReward(address recipient, uint256 amount, string memory reason) 
        public 
        onlyRole(MINTER_ROLE) 
    {
        require(totalSupply() + amount <= MAX_SUPPLY, "Excede o suprimento maximo");
        _mint(recipient, amount);
        emit RewardDistributed(recipient, amount, reason);
    }
    
    // Funções obrigatórias para sobrescrita devido às herança múltipla
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
```

### Staking e Recompensas

O contrato de staking permite que os usuários bloqueiem seus tokens TOUR em troca de recompensas e benefícios adicionais:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TourStaking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public tourToken;
    
    struct StakeInfo {
        uint256 amount;
        uint256 since;
        uint256 claimedRewards;
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    uint256 public rewardRate = 10; // 10 = 10% APY base
    uint256 public constant SECONDS_IN_YEAR = 365 days;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    
    constructor(address _tourToken) {
        tourToken = IERC20(_tourToken);
    }
    
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Quantidade deve ser maior que zero");
        
        // Calculate pending rewards before updating stake
        uint256 pending = calculateReward(msg.sender);
        
        // Update stake info
        if (stakes[msg.sender].amount > 0) {
            stakes[msg.sender].amount += amount;
        } else {
            stakes[msg.sender] = StakeInfo({
                amount: amount,
                since: block.timestamp,
                claimedRewards: 0
            });
        }
        
        totalStaked += amount;
        
        // Pay pending rewards
        if (pending > 0) {
            payReward(msg.sender, pending);
        }
        
        // Transfer tokens to contract
        tourToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Saldo insuficiente");
        
        // Calculate rewards
        uint256 reward = calculateReward(msg.sender);
        
        // Update stake
        userStake.amount -= amount;
        totalStaked -= amount;
        
        // Pay rewards + unstaked amount
        if (reward > 0) {
            payReward(msg.sender, reward);
        }
        
        // Return staked tokens
        tourToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    function claimReward() external nonReentrant {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "Sem recompensas para reivindicar");
        
        stakes[msg.sender].claimedRewards += reward;
        
        payReward(msg.sender, reward);
    }
    
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 stakedTime = block.timestamp - userStake.since;
        uint256 reward = (userStake.amount * rewardRate * stakedTime) / (SECONDS_IN_YEAR * 100);
        
        return reward - userStake.claimedRewards;
    }
    
    function payReward(address user, uint256 amount) internal {
        tourToken.safeTransfer(user, amount);
        emit RewardPaid(user, amount);
    }
    
    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
    }
    
    // Função para níveis de acesso baseados em tokens stakados
    function getUserTier(address user) external view returns (uint8) {
        uint256 stakedAmount = stakes[user].amount;
        
        if (stakedAmount >= 100000 * 10**18) { // 100,000 TOUR
            return 4; // Platinum
        } else if (stakedAmount >= 50000 * 10**18) { // 50,000 TOUR
            return 3; // Gold
        } else if (stakedAmount >= 10000 * 10**18) { // 10,000 TOUR
            return 2; // Silver
        } else if (stakedAmount >= 1000 * 10**18) { // 1,000 TOUR
            return 1; // Bronze
        } else {
            return 0; // Basic
        }
    }
}
```

## Auditoria e Segurança

* **Escrow Multisig**: Fundos de desenvolvimento e marketing protegidos por wallet multisig 4-de-7
* **Contratos Auditados**: Todos os contratos passarão por auditoria profissional pelas principais empresas do setor
* **Bug Bounty Program**: Recompensas de até $100,000 para descoberta de vulnerabilidades críticas nos contratos
* **Limitação de Transações**: Limites implementados para grandes movimentações para prevenir manipulação de mercado

## Roadmap do Token

### Fase 1: Pré-lançamento (Q4 2025)
* Finalização do smart contract
* Auditoria de segurança
* Distribuição privada para investidores iniciais
* Campanha de crowdfunding com alocação de tokens

### Fase 2: Lançamento (Q1 2026)
* Listagem em DEXs (Uniswap, SushiSwap)
* Início do programa de staking
* Implementação do portal de governança
* Parcerias estratégicas iniciais com provedores de viagens

### Fase 3: Expansão (Q2-Q3 2026)
* Listagem em exchanges centralizadas de médio porte
* Implementação de pontes cross-chain
* Lançamento do programa de embaixadores
* Expansão para mercados internacionais

### Fase 4: Maturidade (Q4 2026+)
* Integração com grandes provedores de pagamento
* Transferência gradual de governança para a DAO
* Implementação de Layer-2 para redução de custos de transação
* Expansão para casos de uso adicionais no ecossistema de viagens

## Recursos Adicionais

* [GitHub do Projeto](https://github.com/tourchain) (em breve)
* [Documentação Técnica Completa](https://docs.tourchain.io) (em breve)
* [Whitepaper Econômico](https://tourchain.io/whitepaper) (em breve)

---

Este documento será atualizado conforme o desenvolvimento do projeto avança e novas funcionalidades são implementadas.