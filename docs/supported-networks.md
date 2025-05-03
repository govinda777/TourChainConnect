# Redes Blockchain Suportadas pelo TourChain

Este documento detalha as redes blockchain suportadas pela plataforma TourChain, incluindo informações técnicas e prazos de implementação.

## Visão Geral

A plataforma TourChain é desenvolvida com foco em compatibilidade EVM (Ethereum Virtual Machine), permitindo implantação e operação em múltiplas redes blockchain. Esta abordagem multi-chain maximiza a flexibilidade, eficiência de custos e acessibilidade para nossos usuários corporativos.

## Redes Principais (Mainnet)

As seguintes redes mainnet serão suportadas a partir do lançamento oficial em Q1 2026:

### Ethereum

* **Status**: Planejado para Q1 2026
* **Benefícios**: Alta segurança, ampla adoção, forte ecossistema DeFi
* **Casos de uso**: Governança principal, staking de longo prazo, certificados de carbono de alto valor
* **Considerações técnicas**: Taxas de gás mais altas, melhor para transações de alto valor e governança
* **Endereço do contrato**: TBD

### Polygon

* **Status**: Planejado para Q1 2026
* **Benefícios**: Baixo custo de transação, alta velocidade, forte ecossistema de jogos e NFTs
* **Casos de uso**: Operações diárias de reserva, micro-transações, tokens de fidelidade
* **Considerações técnicas**: Finalidade rápida, excelente para operações frequentes
* **Endereço do contrato**: TBD

### Arbitrum

* **Status**: Planejado para Q1 2026
* **Benefícios**: Baixas taxas de transação, alta capacidade de throughput, segurança derivada do Ethereum
* **Casos de uso**: Processamento de reembolsos, gerenciamento de despesas, ofertas dinâmicas de tokens
* **Considerações técnicas**: Rollup L2 com excelente compromisso entre segurança e eficiência
* **Endereço do contrato**: TBD

### Optimism

* **Status**: Planejado para Q1 2026
* **Benefícios**: Taxas reduzidas, compatibilidade com ferramentas Ethereum, bom para dados on-chain
* **Casos de uso**: Armazenamento de dados de viagem, relatórios de sustentabilidade, histórico de compensação
* **Considerações técnicas**: Rollup L2 otimizado para disponibilidade de dados
* **Endereço do contrato**: TBD

### BNB Chain

* **Status**: Planejado para Q1 2026
* **Benefícios**: Baixo custo de transação, alto throughput, grande base de usuários
* **Casos de uso**: Mercado de serviços complementares, integração com parceiros do ecossistema
* **Considerações técnicas**: Forte suporte institucional, integração com serviços Binance
* **Endereço do contrato**: TBD

## Redes de Teste (Testnet)

As seguintes testnets serão utilizadas durante o desenvolvimento (Q4 2025):

### Ethereum Sepolia

* **Status**: Implementação planejada para Q4 2025
* **Propósito**: Testes de smart contracts e validação de governança
* **Faucet disponível**: Sim
* **Endereço do contrato de teste**: TBD

### Polygon Mumbai

* **Status**: Implementação planejada para Q4 2025
* **Propósito**: Testes de volume de transações e experiência do usuário
* **Faucet disponível**: Sim
* **Endereço do contrato de teste**: TBD

### Arbitrum Goerli

* **Status**: Implementação planejada para Q4 2025
* **Propósito**: Testes de integração com oracles e sistemas externos
* **Faucet disponível**: Sim
* **Endereço do contrato de teste**: TBD

## Interoperabilidade Cross-Chain

Para Q2-Q3 2026, planejamos implementar as seguintes soluções de interoperabilidade:

### Tecnologias de Ponte (Bridge)

* **Axelar Network**: Comunicação segura entre cadeias para transferência de dados e valor
* **LayerZero**: Para mensageria omnichain e aplicações cross-chain
* **Chainlink CCIP**: Para transmissão segura de dados entre redes

### Casos de Uso Cross-Chain

1. **Transferência de Tokens TOUR**: Movimentação de tokens entre diferentes redes blockchain
2. **Unificação de Identidade**: Sistema de identidade corporativa que funciona em todas as redes suportadas
3. **Agregação de Dados**: Consolidação de métricas de sustentabilidade e economia de custos em todas as redes

## Requisitos Técnicos para Desenvolvedores

### Interação Multi-Chain

```typescript
// Exemplo de código para interagir com contratos em diferentes redes
import { ethers } from 'ethers';
import { TourChainABI } from './abis/TourChain';

// Configuração de provedores para diferentes redes
const providers = {
  ethereum: new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'),
  polygon: new ethers.providers.JsonRpcProvider('https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY'),
  arbitrum: new ethers.providers.JsonRpcProvider('https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY')
};

// Endereços do contrato em diferentes redes
const contractAddresses = {
  ethereum: '0xEthereumContractAddress',
  polygon: '0xPolygonContractAddress',
  arbitrum: '0xArbitrumContractAddress'
};

// Função para obter instância do contrato na rede especificada
function getContract(network) {
  return new ethers.Contract(
    contractAddresses[network],
    TourChainABI,
    providers[network]
  );
}

// Uso: verificar status de uma reserva em diferentes redes
async function checkBookingStatus(bookingId, networks = ['ethereum', 'polygon', 'arbitrum']) {
  for (const network of networks) {
    const contract = getContract(network);
    try {
      const status = await contract.getBookingStatus(bookingId);
      console.log(`Booking status on ${network}: ${status}`);
      if (status !== 'NOT_FOUND') {
        return { network, status };
      }
    } catch (error) {
      console.error(`Error checking ${network}:`, error);
    }
  }
  return { network: null, status: 'NOT_FOUND' };
}
```

### Requisitos de RPC

Para interagir com a plataforma TourChain, desenvolvedores precisarão de:

* Acesso a endpoints RPC para as redes suportadas
* Criptografia de chave privada para assinatura de transações
* Integração com provedores de carteira como MetaMask, WalletConnect ou APIs EIP-1193

## Custos e Eficiência

### Estratégias de Otimização de Gás

1. **Seleção Dinâmica de Rede**: Roteamento automático de transações para as redes mais econômicas
2. **Batching de Transações**: Agrupamento de múltiplas operações em uma única transação
3. **Compactação de Dados**: Minimização de dados armazenados on-chain
4. **Meta-Transações**: Implementação de transações sem gás para usuários finais corporativos

## Roadmap de Expansão para Novas Redes

* **Q3 2026**: Avaliação de suporte para redes zkEVM como zkSync Era e Polygon zkEVM
* **Q4 2026**: Implementação de suporte para cadeias modulares (Celestia, NEAR)
* **Q1 2027**: Exploração de interoperabilidade com redes não-EVM (Solana, Cosmos)

## Considerações de Segurança Multi-Chain

* Auditorias de segurança específicas para cada implementação de rede
* Monitoramento em tempo real de atividades em todas as redes
* Implementação de limites de transação e mecanismos de pausa de emergência
* Protocolos de segurança de chave para gerenciamento multi-chain

---

Esta documentação será atualizada conforme novas redes são adicionadas e a tecnologia evolui.