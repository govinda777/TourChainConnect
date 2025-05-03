# Redes Blockchain Suportadas

Este documento lista as redes blockchain suportadas pelo TourChain e como configurar sua aplicação para usá-las.

## Redes Disponíveis

| Nome | Tipo | Chain ID | Moeda | Descrição |
|------|------|----------|-------|-----------|
| **Localhost** | Desenvolvimento | 1337 | ETH | Rede local para desenvolvimento e testes |
| **Sepolia** | Testnet | 11155111 | ETH | Testnet Ethereum recomendada para testes |
| **Polygon Mumbai** | Testnet | 80001 | MATIC | Testnet da rede Polygon para testes de escalabilidade |

## Configuração

Para escolher a rede que sua aplicação deve usar, você pode:

1. Definir a variável de ambiente `VITE_BLOCKCHAIN_NETWORK` no arquivo `.env`:

```
VITE_BLOCKCHAIN_NETWORK=sepolia
```

2. Ou passar a rede diretamente nas funções que interagem com a blockchain:

```typescript
import { getContractAddress } from '@/lib/blockchain/contracts/addresses';

// Obtém o endereço do contrato na rede Sepolia
const tokenAddress = getContractAddress('tourToken', 'sepolia');
```

## Configuração do MetaMask

Para se conectar às redes de teste, você precisará configurar o MetaMask com as seguintes informações:

### Sepolia Testnet

- **Nome da Rede**: Sepolia
- **Nova URL RPC**: https://sepolia.infura.io/v3/YOUR-INFURA-KEY
- **ID da Cadeia**: 11155111
- **Símbolo da Moeda**: ETH
- **URL do Explorador de Blocos**: https://sepolia.etherscan.io

### Polygon Mumbai

- **Nome da Rede**: Mumbai
- **Nova URL RPC**: https://polygon-mumbai.infura.io/v3/YOUR-INFURA-KEY
- **ID da Cadeia**: 80001
- **Símbolo da Moeda**: MATIC
- **URL do Explorador de Blocos**: https://mumbai.polygonscan.com

## Obtenção de Tokens para Teste

Para obter tokens para testes nas redes de teste, você pode usar os seguintes faucets:

### Sepolia ETH Faucet

- https://sepoliafaucet.com/
- https://faucet.sepolia.dev/

### Mumbai MATIC Faucet

- https://faucet.polygon.technology/

## Serviços de RPC

O TourChain utiliza a infraestrutura da Infura para conexão às redes públicas. Para configurar seu acesso, obtenha uma chave API da Infura e defina-a no seu arquivo `.env`:

```
VITE_INFURA_API_KEY=sua_chave_api_infura
```

## Compatibilidade de Contratos

Todos os contratos foram projetados para funcionar em todas as redes suportadas. No entanto, algumas funcionalidades específicas podem variar conforme a rede:

- **Compensação de Carbono**: Disponível em todas as redes
- **Oracle de Preços**: Dados reais disponíveis apenas em redes de produção
- **Otimização de Viagens**: Dados simulados em testnets

## Monitoramento de Transações

Você pode monitorar suas transações nos seguintes exploradores:

- **Sepolia**: https://sepolia.etherscan.io/
- **Mumbai**: https://mumbai.polygonscan.com/

## Redes de Produção

Para ambientes de produção, estão planejadas integrações com:

- Ethereum Mainnet
- Polygon Mainnet
- Optimism
- Arbitrum

*Nota: As redes de produção serão habilitadas após auditorias de segurança completas dos smart contracts.*