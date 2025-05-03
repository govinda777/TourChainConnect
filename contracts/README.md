# TourChain Smart Contracts

Este diretório contém os smart contracts e ferramentas para o projeto TourChain, uma plataforma de gerenciamento de viagens corporativas que utiliza blockchain.

## Estrutura de Arquivos

```
contracts/
├── tokens/           # Contratos de tokens e staking
├── crowdfunding/     # Contratos para financiamento coletivo
├── oracles/          # Contratos para oráculos
├── sustainability/   # Contratos para sustentabilidade e compensação de carbono
├── scripts/          # Scripts para deploy dos contratos
├── test/             # Testes dos contratos
└── deployments/      # Informações sobre deployments (gerado automaticamente)
```

## Contratos Implementados

- **TourToken**: Token ERC20 para a plataforma TourChain
- **TourStaking**: Sistema de staking para tokens TOUR
- **TourCrowdfunding**: Sistema de financiamento coletivo para projetos
- **TourOracle**: Oracle para integração de dados externos
- **CarbonOffset**: Sistema para compensação de emissões de carbono

## Comandos

Execute os seguintes comandos a partir da raiz do projeto:

### Compilação e Testes

```bash
# Compilar os contratos
npx hardhat compile

# Executar os testes
npx hardhat test

# Iniciar um node local Hardhat para testes
npx hardhat node
```

### Deploy

```bash
# Deploy de todos os contratos em ambiente local
npx hardhat run contracts/scripts/deploy-all.ts --network localhost

# Deploy na testnet Sepolia
npx hardhat run contracts/scripts/deploy-all.ts --network sepolia

# Deploy de contratos específicos
npx hardhat run contracts/scripts/deploy-tour-token.ts
npx hardhat run contracts/scripts/deploy-tour-staking.ts
npx hardhat run contracts/scripts/deploy-tour-crowdfunding.ts
npx hardhat run contracts/scripts/deploy-tour-oracle.ts
npx hardhat run contracts/scripts/deploy-carbon-offset.ts
```

## Configuração

Antes de fazer deploy em redes públicas como testnets ou mainnets, configure as seguintes variáveis no arquivo `.env`:

```
PRIVATE_KEY=sua_chave_privada_aqui
INFURA_API_KEY=sua_chave_api_infura
ETHERSCAN_API_KEY=sua_chave_api_etherscan
```

## Redes Suportadas

O projeto está configurado para as seguintes redes:

- **localhost**: Para testes locais
- **sepolia**: Testnet Ethereum Sepolia
- **polygon_mumbai**: Testnet Polygon Mumbai

## Interação com os Contratos

Para interagir com contratos já deployados, você pode usar o console Hardhat:

```bash
npx hardhat console --network localhost
```

Exemplo de interação:

```javascript
// Carrega o contrato TourToken
const TourToken = await ethers.getContractFactory("TourToken");
const tourToken = await TourToken.attach("endereço_do_contrato");

// Consulta o saldo de tokens
const balance = await tourToken.balanceOf("endereço_da_carteira");
console.log("Saldo:", ethers.formatEther(balance));
```

## Verificação de Contratos

Para verificar contratos no Etherscan (ou exploradores equivalentes):

```bash
npx hardhat verify --network sepolia ENDEREÇO_DO_CONTRATO
```