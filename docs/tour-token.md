# TourToken (TOUR) - Documentação

Este documento descreve o token TOUR, sua economia, funcionalidades e utilidade no ecossistema TourChain.

## Visão Geral

O TourToken (TOUR) é um token ERC20 que serve como a moeda nativa do ecossistema TourChain, incentivando comportamentos que beneficiam a sustentabilidade, eficiência e inovação em viagens corporativas.

## Tokenomics

### Fornecimento

- **Fornecimento Inicial**: 10.000.000 TOUR
- **Fornecimento Máximo**: 100.000.000 TOUR
- **Decimais**: 18

### Distribuição Inicial

| Alocação | Porcentagem | Quantidade | Propósito |
|----------|-------------|------------|-----------|
| Reserva do Protocolo | 30% | 3.000.000 | Financiamento de desenvolvimento, operações e crescimento |
| Equipe e Conselheiros | 15% | 1.500.000 | Incentivo à equipe (com vesting de 2 anos) |
| Investidores | 20% | 2.000.000 | Financiamento inicial (com vesting de 1 ano) |
| Vendas Iniciais | 10% | 1.000.000 | Liquidez e adoção inicial |
| Ecossistema e Comunidade | 15% | 1.500.000 | Incentivos, hackathons, grants e atividades comunitárias |
| Recompensas | 10% | 1.000.000 | Programa inicial de staking e recompensas |

### Emissão e Deflação

- **Taxa de Emissão**: Governada pelo contrato de staking, com redução gradual ao longo do tempo
- **Mecanismos Deflacionários**: 
  - 25% das taxas de plataforma são queimadas
  - 10% dos tokens utilizados para compensação de carbono são queimados

## Utilidade

O token TOUR tem múltiplas utilidades que impulsionam o ecossistema:

### 1. Staking e Governança

Os detentores de tokens podem fazer stake para:
- Receber recompensas de participação
- Adquirir direitos de voto em propostas de governança
- Influenciar decisões sobre parâmetros do protocolo, como taxas e incentivos

### 2. Pagamentos e Recompensas

Os tokens TOUR podem ser utilizados para:
- Pagar serviços de viagem na plataforma
- Receber recompensas por comportamentos sustentáveis
- Compensar emissões de carbono de viagens
- Acessar descontos e benefícios exclusivos

### 3. Crowdfunding e Financiamento

O sistema de crowdfunding permite:
- Financiar projetos sustentáveis de turismo e viagens
- Criar campanhas inovadoras para experiências de viagem
- Receber recompensas baseadas em tokens por apoiar projetos

### 4. Compensação de Carbono

Os tokens são essenciais para o sistema de sustentabilidade:
- Pagamento para compensação de emissões de carbono
- Certificados de neutralidade de carbono
- Incentivos para escolhas de viagem mais sustentáveis

## Contrato Inteligente

### Funcionalidades Principais

O contrato TourToken implementa:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TourToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    uint256 public immutable maxSupply;
    
    constructor() ERC20("TourChain Token", "TOUR") {
        _mint(msg.sender, 10_000_000 * 10**decimals());
        maxSupply = 100_000_000 * 10**decimals();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }
    
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= maxSupply, "TourToken: max supply exceeded");
        _mint(to, amount);
    }
}
```

### Roles e Permissões

O contrato usa um sistema de roles para controle de acesso:

- **DEFAULT_ADMIN_ROLE**: Gerenciar roles e permissões
- **MINTER_ROLE**: Criar novos tokens (dentro do limite máximo)
- **GOVERNANCE_ROLE**: Propor e aprovar mudanças ao protocolo

## Fluxos de Token

### Fluxo de Staking

```
Usuário → Stake Tokens → Contrato de Staking
                             ↓
Usuário ← Recompensas ← Distribuição de Recompensas
```

### Fluxo de Crowdfunding

```
Apoiador → Pledge Tokens → Contrato de Crowdfunding → Escrow
                                      ↓
       Criador ← Tokens   ←    Campanha Bem-sucedida
                   ou
       Apoiador ← Reembolso ← Campanha Fracassada
```

### Fluxo de Compensação de Carbono

```
Empresa → Tokens → Contrato CarbonOffset → Pagamento para Projetos de Compensação
                          ↓
                   25% → Queima
                   75% → Projetos de Compensação
```

## Queima de Tokens

A queima de tokens ocorre em várias situações:

1. **Taxas de Plataforma**: 25% das taxas coletadas são queimadas
2. **Compensação de Carbono**: 10% dos tokens usados são queimados
3. **Queima Voluntária**: Usuários podem queimar tokens voluntariamente
4. **Governança**: Propostas podem incluir mecanismos de queima

## Liquidez e Mercados

Para garantir liquidez adequada:

1. **Pools de Liquidez**: Inicialmente 15% do fornecimento será destinado a pools de liquidez em DEXs
2. **Market Making**: Programa de market makers para manter spreads saudáveis
3. **Incentivos de Liquidez**: Recompensas para provedores de liquidez

## Incentivos e Recompensas

### Programa de Staking

- **Recompensas Base**: Taxa anual de 5-10%
- **Recompensas Variáveis**: Baseadas na utilização da plataforma
- **Níveis de Staking**: Benefícios adicionais para stakes maiores e de longo prazo

### Programa de Sustentabilidade

- **Recompensas por Viagens Sustentáveis**: Tokens dados por escolhas ecológicas
- **Multiplicadores de Compensação**: Mais tokens para quem compensa além do necessário
- **Desafios Coletivos**: Recompensas para metas de sustentabilidade comunitárias

## Segurança e Auditoria

Os contratos de token terão:

1. **Auditorias Externas**: Por múltiplas empresas de segurança
2. **Bug Bounty**: Programa para encontrar vulnerabilidades
3. **Testes Extensivos**: Cobertura de testes de 100%
4. **Atualizações Graduais**: Qualquer mudança passará por fases de teste

## Integração com Frontend

### Componentes para Trabalhar com Tokens

O frontend oferece widgets para facilitar interações com tokens:

- **TokenBalance**: Exibe saldo de TOUR
- **TokenSend**: Interface para enviar tokens
- **StakingInterface**: Painel para stake e unstake
- **RewardsClaim**: Widget para reivindicar recompensas

### Exemplos de Hooks

```typescript
// Hook para obter saldo de tokens
const { data: balance, isLoading } = useTourBalance(walletAddress);

// Hook para fazer stake de tokens
const { mutate: stakeTokens, isPending } = useStakeTokens();

// Hook para enviar tokens
const { mutate: sendTokens } = useSendTokens();
```

## Governança e Evolução Futura

O token TOUR evoluirá para uma governança cada vez mais descentralizada:

1. **Fase Inicial (1-6 meses)**: Controle centralizado pela equipe
2. **Fase de Transição (6-18 meses)**: Votação comunitária com veto da equipe
3. **Fase Descentralizada (18+ meses)**: Governança totalmente descentralizada via DAO

## Roteiro Tokenomics

| Fase | Período | Marcos |
|------|---------|--------|
| Lançamento | Q2 2023 | - Distribuição inicial<br>- Listagem em DEXs<br>- Programa de staking básico |
| Crescimento | Q3-Q4 2023 | - Integração com crowdfunding<br>- Integração com compensação de carbono<br>- Expansão de incentivos |
| Expansão | Q1-Q2 2024 | - Governança comunitária<br>- Integração cross-chain<br>- Expansão para novos mercados |
| Maturidade | Q3 2024+ | - DAO completa<br>- Emissões geridas pela comunidade<br>- Aumento de casos de uso |

## Conclusão

O token TOUR foi projetado como uma base sólida para o ecossistema TourChain, fornecendo incentivos alinhados para todos os participantes enquanto promove os objetivos de sustentabilidade, inovação e eficiência no setor de viagens corporativas.