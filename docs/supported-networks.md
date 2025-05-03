# Redes Suportadas

O TourChain foi projetado para operar em várias redes blockchain, proporcionando flexibilidade, otimização de custos e máxima acessibilidade para os usuários. Este documento detalha as redes atualmente suportadas pela plataforma TourChain, junto com configurações técnicas específicas para cada rede.

> ⚠️ **IMPORTANTE**: Para obter a lista completa de endereços de contratos em cada rede, consulte o documento [Endereços de Deployment](./deployment-addresses.md).

## Redes Atualmente Suportadas

| Rede | Chain ID | Tipo | Status | RPC URL Recomendada | Explorador |
|------|----------|------|--------|---------------------|------------|
| **Ethereum Mainnet** | 1 | Produção | ✅ Ativo | https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY | [Etherscan](https://etherscan.io) |
| **Polygon** | 137 | Produção | ✅ Ativo | https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY | [Polygonscan](https://polygonscan.com) |
| **Optimism** | 10 | Produção | 🔄 Planejado | https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY | [Optimism Explorer](https://optimistic.etherscan.io) |
| **Arbitrum** | 42161 | Produção | 🔄 Planejado | https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY | [Arbiscan](https://arbiscan.io) |
| **Sepolia** | 11155111 | Testnet | ✅ Ativo | https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY | [Sepolia Etherscan](https://sepolia.etherscan.io) |
| **Polygon Mumbai** | 80001 | Testnet | ✅ Ativo | https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY | [Mumbai Polygonscan](https://mumbai.polygonscan.com) |
| **Localhost** | 31337 | Desenvolvimento | ✅ Ativo | http://localhost:8545 | N/A |

## Considerações Específicas por Rede

### Ethereum Mainnet

A rede principal Ethereum serve como nossa rede primária para transações de alto valor e atividades de governança que exigem máxima segurança.

**Vantagens:**
- Maior segurança e descentralização
- Maior liquidez para o token TOUR
- Infraestrutura estabelecida para integração DeFi

**Considerações:**
- Custos de gás mais elevados
- Finalidade de transação mais lenta
- Recomendado para transações de maior valor e ações administrativas

### Polygon

A rede Polygon serve como nossa rede principal para operações do dia a dia, oferecendo um equilíbrio entre segurança e eficiência de custos.

**Vantagens:**
- Custos de transação mais baixos
- Tempos de confirmação mais rápidos
- Compatibilidade EVM para integração perfeita

**Considerações:**
- Camada secundária de segurança em comparação com a Ethereum mainnet
- Algumas pontes especializadas necessárias para certas integrações

### Soluções de Camada 2 (Optimism & Arbitrum)

As redes de Camada 2 fornecem benefícios de escalabilidade enquanto herdam a segurança da Ethereum.

**Vantagens:**
- Custos de gás significativamente reduzidos
- Processamento de transações mais rápido
- Segurança mantida através da ancoragem na Ethereum

**Considerações:**
- Complexidade adicional de bridging para usuários
- Níveis variados de maturidade do ecossistema
- Otimizações específicas para cada rede

## Arquitetura de Implantação

O TourChain emprega uma estratégia de implantação em múltiplas redes com as seguintes características:

### Padrão de Implantação de Contratos

Para cada rede suportada, implantamos:

1. **Contratos de Protocolo Principais**:
   - TourToken
   - TourStaking
   - TourCrowdfunding
   - TourOracle
   - CarbonOffset

2. **Infraestrutura Específica por Rede**:
   - Carteiras multi-assinatura Gnosis Safe
   - Adaptadores de bridge (quando aplicável)
   - Monitores de rede

### Compatibilidade Entre Redes

Para facilitar operações entre redes:

1. **Bridging de Tokens**: Bridges oficiais para transferir tokens TOUR entre redes
2. **Sincronização de Estado**: Oráculos garantindo dados consistentes entre redes
3. **Frontend Unificado**: Interface única suportando todas as redes através de troca de rede na carteira

## Configurações Técnicas por Rede

### Ethereum Mainnet (ChainID: 1)

**Parâmetros de Rede:**
- **Nome da Rede**: Ethereum Mainnet
- **Símbolo da Moeda**: ETH
- **URLs RPC**:
  - https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
  - https://mainnet.infura.io/v3/YOUR_KEY
  - https://rpc.ankr.com/eth
- **Explorador**: https://etherscan.io
- **Configuração Metamask**: [Adicionar Rede](https://chainlist.org/chain/1)

**Detalhes Específicos:**
- Finality: ~12 confirmações de bloco (~3 minutos)
- Tempo de bloco: ~12 segundos
- Preço de gás: 10-200 Gwei (variável)

### Polygon (ChainID: 137)

**Parâmetros de Rede:**
- **Nome da Rede**: Polygon Mainnet
- **Símbolo da Moeda**: MATIC
- **URLs RPC**:
  - https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
  - https://polygon-rpc.com
  - https://rpc.ankr.com/polygon
- **Explorador**: https://polygonscan.com
- **Configuração Metamask**: [Adicionar Rede](https://chainlist.org/chain/137)

**Detalhes Específicos:**
- Finality: ~256 confirmações de bloco (~7-8 minutos)
- Tempo de bloco: ~2 segundos
- Preço de gás: 30-100 Gwei (mais estável e baixo que Ethereum)

### Sepolia Testnet (ChainID: 11155111)

**Parâmetros de Rede:**
- **Nome da Rede**: Sepolia Testnet
- **Símbolo da Moeda**: SepoliaETH
- **URLs RPC**:
  - https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
  - https://rpc.sepolia.org
  - https://rpc2.sepolia.org
- **Explorador**: https://sepolia.etherscan.io
- **Configuração Metamask**: [Adicionar Rede](https://chainlist.org/chain/11155111)
- **Faucets**: 
  - https://sepoliafaucet.com/
  - https://sepolia-faucet.pk910.de/

**Detalhes Específicos:**
- Testnet oficial da Ethereum Foundation
- Compatível com todas as ferramentas de desenvolvimento Ethereum
- Configuração recomendada para testes antes do mainnet

### Polygon Mumbai (ChainID: 80001)

**Parâmetros de Rede:**
- **Nome da Rede**: Mumbai Testnet
- **Símbolo da Moeda**: MATIC
- **URLs RPC**:
  - https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
  - https://rpc-mumbai.maticvigil.com
  - https://rpc.ankr.com/polygon_mumbai
- **Explorador**: https://mumbai.polygonscan.com
- **Configuração Metamask**: [Adicionar Rede](https://chainlist.org/chain/80001)
- **Faucets**:
  - https://faucet.polygon.technology/
  - https://mumbaifaucet.com/

**Detalhes Específicos:**
- Testnet oficial da Polygon
- Baixos custos de transação, ideal para testes intensivos
- Ambiente de pré-produção recomendado para DApps Polygon

## Estratégia de Seleção de Rede

O TourChain emprega uma estratégia inteligente de seleção de rede para otimizar a experiência do usuário:

### Para Usuários Finais

1. **Rede Padrão**: Polygon é recomendada para a maioria das operações devido às baixas taxas
2. **Troca de Rede**: O aplicativo sugere mudanças de rede com base na operação
3. **Estimativa de Gás**: Estimativas de custo de gás em tempo real ajudam os usuários a tomar decisões informadas

### Para Administradores Corporativos

1. **Operações de Alto Valor**: Ethereum mainnet recomendada para movimentações de fundos grandes
2. **Operações Diárias**: Polygon para tarefas administrativas regulares
3. **Testes**: Ambientes testnet para validar alterações de configuração

## Suporte a Redes Futuras

O TourChain está avaliando redes adicionais para integração futura:

1. **zkSync Era**: Alto throughput com rollups ZK
2. **Avalanche**: Rápida finalidade e baixas taxas
3. **Base**: L2 apoiada pela Coinbase com forte foco no consumidor
4. **BNB Chain**: Alto throughput de transações e ecossistema DeFi extenso

## Requisitos de Integração

Para desenvolvedores integrando com o TourChain, observe os seguintes requisitos:

1. **Suporte a Carteiras**: Deve suportar Ethereum, Polygon e, idealmente, redes L2
2. **Gerenciamento de Gás**: Deve lidar com estimativa de gás específica para cada rede
3. **Detecção de Rede**: Detecção automática da rede atual
4. **Suporte a Bridges**: Integração com bridges oficiais entre redes

## Documentação Técnica

Para informações técnicas detalhadas sobre implantação em redes específicas, consulte:

1. [Configuração Hardhat](../hardhat.config.ts)
2. [Scripts de Implantação](../contracts/scripts/)
3. [Utilitários de Rede](../client/src/lib/blockchain/networks/)