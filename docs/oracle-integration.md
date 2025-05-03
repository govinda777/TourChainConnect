# Integração com Oráculos

Este documento descreve como o sistema TourChain integra-se com oráculos externos para obter dados do mundo real e utilizá-los dentro dos smart contracts.

## Visão Geral

Oráculos são pontes entre blockchains e o mundo real, permitindo que smart contracts acessem dados que não estão disponíveis na própria blockchain. O TourChain utiliza oráculos para:

1. Obter dados de emissões de carbono para viagens
2. Acessar taxas de câmbio para conversão de moedas
3. Receber informações sobre otimização de rotas de viagem

## Arquitetura de Oráculos

O TourChain implementa um sistema de oráculos descentralizado através do contrato `TourOracle.sol`, que:

1. Permite que múltiplos provedores de dados contribuam com informações
2. Exige que os provedores façam stake de tokens/ETH como garantia
3. Permite verificação e contestação de dados inválidos
4. Armazena dados de forma estruturada e acessível para outros contratos

### Diagrama de Fluxo

```
Fonte de Dados Externa -> Provedor de Oracle -> TourOracle.sol -> Contratos Consumidores
```

## Provedores de Oráculos

### Provedores Externos Suportados

O sistema é flexível e pode integrar-se com vários provedores:

- **Chainlink**: Para dados verificáveis e descentralizados
- **API3**: Para dados diretamente de APIs
- **Uma Oracle própria (opcional)**: Implementada para casos de uso específicos

### Requisitos para Provedores

Para se tornar um provedor de oracle no TourChain:

1. Fazer stake de um valor mínimo (configurável) em ETH
2. Receber a role `ORACLE_ROLE` do administrador
3. Implementar a interface de atualização de dados necessária
4. Fornecer uma fonte verificável para os dados

## Tipos de Dados Suportados

### 1. Emissões de Carbono

Dados sobre emissões de carbono de viagens, incluindo:

- Valor das emissões (em gramas de CO2)
- Modo de transporte (avião, trem, carro, etc.)
- Distância percorrida
- Fonte dos dados (ex: ICAO Calculator, GHG Protocol)

**Exemplo de estrutura**:
```solidity
struct CarbonEmissionData {
    uint256 timestamp;       // Timestamp da atualização
    uint256 emissionAmount;  // Emissões em gramas de CO2
    string travelMode;       // Modo de transporte
    uint256 distance;        // Distância em km
    string dataSource;       // Fonte dos dados
}
```

### 2. Taxas de Câmbio

Dados de taxas de câmbio entre moedas:

- Par de moedas (ex: USD/EUR)
- Valor da taxa
- Fonte dos dados (ex: CoinGecko, CryptoCompare)

**Exemplo de estrutura**:
```solidity
struct PriceData {
    uint256 timestamp;       // Timestamp da atualização
    string currencyPair;     // Par de moedas
    uint256 price;           // Preço (multiplicado por 10^6 para precisão)
    string dataSource;       // Fonte dos dados
}
```

### 3. Otimização de Viagens

Dados sobre otimização de rotas de viagem:

- Origem e destino
- Custo otimizado
- Custo original
- Percentual de economia
- Otimizações aplicadas
- Fonte dos dados

**Exemplo de estrutura**:
```solidity
struct TravelOptimizationData {
    uint256 timestamp;        // Timestamp da atualização
    string origin;            // Local de origem
    string destination;       // Local de destino
    uint256 optimizedCost;    // Custo após otimização
    uint256 originalCost;     // Custo original
    uint256 savingsPercent;   // Percentual de economia (x100)
    string[] optimizations;   // Lista de otimizações aplicadas
    string dataSource;        // Fonte dos dados
}
```

## Implementação no Contrato TourOracle

### Principais Funções

```solidity
// Atualiza dados de emissão de carbono
function updateCarbonEmission(
    bytes32 dataId,
    uint256 emissionAmount,
    string calldata travelMode,
    uint256 distance,
    string calldata dataSource
) external onlyRole(ORACLE_ROLE);

// Atualiza dados de preços
function updatePrice(
    bytes32 dataId,
    string calldata currencyPair,
    uint256 price,
    string calldata dataSource
) external onlyRole(ORACLE_ROLE);

// Atualiza dados de otimização de viagens
function updateTravelOptimization(
    bytes32 dataId,
    string calldata origin,
    string calldata destination,
    uint256 optimizedCost,
    uint256 originalCost,
    uint256 savingsPercent,
    string[] calldata optimizations,
    string calldata dataSource
) external onlyRole(ORACLE_ROLE);

// Funções getter para acessar os dados
function getCarbonEmission(bytes32 dataId) external view returns (CarbonEmissionData memory);
function getPrice(bytes32 dataId) external view returns (PriceData memory);
function getTravelOptimization(bytes32 dataId) external view returns (TravelOptimizationData memory);
```

### Gerenciamento de Oráculos

```solidity
// Adiciona um novo oracle com stake
function addOracle(address oracle) external payable;

// Remove um oracle
function removeOracle(address oracle) external;

// Atualiza o stake de um oracle
function updateStake() external payable;

// Atualiza o stake mínimo requerido
function updateMinimumStake(uint256 _minimumStake) external onlyRole(DEFAULT_ADMIN_ROLE);

// Obtém a lista de oracles registrados
function getOraclesList() external view returns (address[] memory);
```

## Consumindo Dados de Oráculos

### Em Contratos

Os contratos podem consumir dados do oracle da seguinte forma:

```solidity
// Exemplo em CarbonOffset.sol
function calculateOffsetFromTravel(
    bytes32 travelDataId
) external view returns (uint256 emissionAmount) {
    // Obtém dados de emissão do oracle
    TourOracle.CarbonEmissionData memory emissionData = 
        tourOracle.getCarbonEmission(travelDataId);
    
    // Usa os dados para cálculos
    return emissionData.emissionAmount;
}
```

### No Frontend

No frontend, os dados podem ser acessados através de chamadas aos contratos:

```typescript
// Exemplo em um hook React
const useCarbonEmission = (dataId: string) => {
  const { provider } = useBlockchain();
  
  return useQuery({
    queryKey: ['carbonEmission', dataId],
    queryFn: async () => {
      if (!provider || !dataId) return null;
      
      const tourOracle = new ethers.Contract(
        getContractAddress('tourOracle'),
        TOUR_ORACLE_ABI,
        provider
      );
      
      const emission = await tourOracle.getCarbonEmission(
        ethers.utils.id(dataId)
      );
      
      return {
        timestamp: emission.timestamp.toString(),
        emissionAmount: emission.emissionAmount.toString(),
        travelMode: emission.travelMode,
        distance: emission.distance.toString(),
        dataSource: emission.dataSource
      };
    },
    enabled: !!provider && !!dataId
  });
};
```

## Segurança e Verificação

### Mecanismos de Segurança

1. **Stake como Garantia**: Oráculos precisam fazer stake de ETH, que pode ser perdido em caso de dados fraudulentos.

2. **Sistema Multi-Oracle**: Múltiplos oráculos podem fornecer o mesmo dado, permitindo consenso.

3. **Verificabilidade**: Todas as atualizações de dados incluem a fonte, permitindo verificação off-chain.

4. **Controle de Acesso**: Apenas endereços com `ORACLE_ROLE` podem atualizar dados.

### Contestação de Dados

Um sistema de contestação permite que stakeholders desafiem dados incorretos:

1. Um stakeholder contesta um dado, fazendo stake de ETH
2. O oracle responsável precisa defender seus dados
3. Um comitê de arbitragem (outros oracles) decide o resultado
4. O perdedor perde seu stake como penalidade

## Integrações Futuras

Planos futuros para o sistema de oráculos:

1. **Integração com Agregadores**: Usar Chainlink ou API3 para agregar múltiplas fontes.

2. **Sistema de Reputação**: Implementar pontuação de reputação para oráculos baseada em precisão.

3. **Dados em Tempo Real**: Adicionar feeds de dados em tempo real para informações críticas.

4. **Validação Criptográfica**: Implementar provas de autenticidade para garantir a origem dos dados.

## Conclusão

O sistema de oráculos do TourChain é projetado para ser flexível, seguro e extensível, permitindo que a plataforma acesse dados do mundo real necessários para suas funcionalidades de sustentabilidade e otimização de viagens.