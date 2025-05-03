# TourChain - Arquitetura de Contratos Inteligentes

## Visão Geral

A TourChain utiliza uma série de contratos inteligentes para implementar sua infraestrutura blockchain, permitindo gerenciamento transparente de viagens corporativas, programas de fidelidade, financiamento coletivo de projetos turísticos e iniciativas de sustentabilidade.

## Contratos Principais

### TourToken (ERC-20)

O token TOUR é o ativo digital nativo da plataforma, usado para:
- Recompensas de programas de fidelidade e bem-estar
- Governança da plataforma
- Staking para acesso a recursos premium
- Financiamento de projetos de turismo sustentável

```solidity
// IERC20 + Recursos adicionais específicos da plataforma
interface ITourToken is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
}
```

### TourStaking

Permite aos usuários fazer staking de tokens TOUR para ganhar recompensas e acessar recursos premium.

```solidity
interface ITourStaking {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getRewards() external;
    function getStakedBalance(address account) external view returns (uint256);
}
```

### TourCrowdfunding

Facilita o financiamento coletivo de projetos turísticos sustentáveis, com rastreamento transparente de fundos.

```solidity
interface ITourCrowdfunding {
    function createProject(
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint256 deadline
    ) external returns (uint256 projectId);
    
    function contribute(uint256 projectId, uint256 amount) external;
    function withdrawFunds(uint256 projectId) external;
    function refund(uint256 projectId) external;
}
```

### TourOracle

Integra dados externos como preços de hotéis, voos e informações climáticas para uso nos contratos inteligentes.

```solidity
interface ITourOracle {
    function getFlightPrice(string memory from, string memory to, uint256 date) external view returns (uint256);
    function getHotelPrice(string memory hotel, uint256 checkIn, uint256 checkOut) external view returns (uint256);
    function getCarbonOffset(uint256 distance, string memory transportType) external view returns (uint256);
}
```

### CarbonOffset

Rastreia e compensa emissões de carbono de viagens.

```solidity
interface ICarbonOffset {
    function calculateEmissions(uint256 distance, string memory transportType) external view returns (uint256);
    function offsetEmissions(uint256 emissionsAmount) external returns (uint256 certificateId);
    function getCertificate(uint256 certificateId) external view returns (address owner, uint256 amount, uint256 timestamp);
}
```

## Arquitetura de Segurança

### Integração com Gnosis Safe

A TourChain utiliza o Gnosis Safe para administração segura de contratos, oferecendo:

1. **Governança Multi-assinatura**: Exige múltiplas aprovações para ações críticas como:
   - Atualizações de contrato
   - Movimentações de fundos da tesouraria
   - Alterações de parâmetros
   
2. **Transparência e Auditabilidade**:
   - Todas as transações são propostas e registradas no Gnosis Safe
   - Histórico completo de aprovações e execuções
   - Interface acessível para verificar estado e movimentações

3. **Segurança Aumentada**:
   - Prevenção contra comprometimento de chaves individuais
   - Processo de revisão por múltiplas partes
   - Proteção contra ataques direcionados

### Fluxo de Aprovação de Transações

1. Um administrador propõe uma transação (ex: atualização de taxas)
2. A transação fica pendente no Gnosis Safe
3. Outros administradores revisam e assinam a transação
4. Quando o limite de assinaturas é atingido, a transação é executada
5. Todo o histórico fica permanentemente registrado na blockchain

## Pipeline de CI/CD

Nosso pipeline de CI/CD garante a qualidade e segurança dos contratos:

1. **Testes Automatizados**:
   - Testes unitários
   - Testes de integração
   - Cobertura de código (100%)
   
2. **Análise de Segurança**:
   - Verificação com Mythril
   - Análise estática de código
   - Proteção contra vulnerabilidades comuns

3. **Processo de Implantação**:
   - Verificação em múltiplas redes de teste
   - Implantação automatizada
   - Verificação de contratos em exploradores blockchain

## Diagrama de Arquitetura

```
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|    TourToken      |<--->|    TourStaking    |<--->|  TourCrowdfunding |
|    (ERC-20)       |     |                   |     |                   |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
         ^                         ^                         ^
         |                         |                         |
         v                         v                         v
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|   Gnosis Safe     |<--->|    TourOracle     |<--->|   CarbonOffset    |
| (Administração)   |     |  (Dados externos) |     | (Sustentabilidade)|
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
```

## Segurança e Auditoria

Todos os contratos seguem as melhores práticas:

- Uso de bibliotecas OpenZeppelin para implementações padrão seguras
- Padrão Checks-Effects-Interactions para prevenção de reentrância
- Limitações adequadas para prevenção de ataques DoS
- Mecanismos de pausa para emergências
- Auditoria contínua através do Gnosis Safe

## Implantação e Verificação

Contratos são implantados e verificados nas seguintes redes:
- Ethereum Mainnet
- Polygon
- Optimism
- Arbitrum
- Redes de teste (Sepolia, Mumbai)

## Considerações Futuras

1. Implementação de governança descentralizada (DAO) para decisões comunitárias
2. Integração com mais oráculos para dados de viagem em tempo real
3. Mecanismos avançados de recompensa baseados em comportamento sustentável
4. Suporte cross-chain para maior interoperabilidade