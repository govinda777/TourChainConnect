# Integração de Oracles no TourChain

## Visão Geral

Os oracles são componentes críticos da plataforma TourChain, fornecendo a ponte essencial entre os dados do mundo real (off-chain) e os smart contracts (on-chain). Esta documentação técnica detalha como os oracles são implementados e utilizados para garantir a integridade, confiabilidade e utilidade da plataforma.

## O Que São Oracles?

No contexto blockchain, oracles são serviços que verificam, processam e transmitem informações do mundo real para smart contracts na blockchain. Como os contratos inteligentes não podem acessar diretamente dados externos, os oracles servem como pontes confiáveis que permitem que informações externas sejam utilizadas dentro de aplicações descentralizadas.

## Tipos de Oracles no TourChain

### 1. Oracles de Viagem

Fornecem dados externos relacionados ao setor de viagens:

* **Oracle de Voos**: Informações sobre preços de passagens, disponibilidade, status do voo e atrasos
* **Oracle de Hospedagem**: Dados sobre tarifas de hotéis, disponibilidade de quartos e políticas de cancelamento
* **Oracle de Transporte Terrestre**: Informações sobre serviços de mobilidade, preços e disponibilidade

### 2. Oracles de Sustentabilidade

Conectam dados ambientais e métricas de sustentabilidade à blockchain:

* **Oracle de Emissões**: Cálculos de emissões de carbono baseados em distância, modo de transporte e outros fatores
* **Oracle de Certificação**: Verificação de projetos de compensação de carbono e validade dos créditos
* **Oracle de Benchmarking**: Comparação de métricas de sustentabilidade com padrões da indústria

### 3. Oracles Financeiros

Facilitam transações financeiras e conversões de valor:

* **Oracle de Preços**: Taxas de câmbio entre moedas fiat, criptomoedas e o token TOUR
* **Oracle de Tarifas**: Monitoramento de taxas da rede para otimização de transações
* **Oracle de Conformidade**: Verificação de requisitos regulatórios por jurisdição

### 4. Oracles de IA

Integram insights de IA à blockchain para otimização de processos:

* **Oracle de Análise Preditiva**: Recomendações baseadas em padrões históricos de viagens
* **Oracle de Detecção de Anomalias**: Identificação de gastos incomuns ou potenciais fraudes
* **Oracle de Otimização**: Sugestões para economia de custos em tempo real

## Arquitetura Técnica dos Oracles

### Diagrama de Arquitetura

```
┌───────────────────┐       ┌───────────────────┐      ┌───────────────────┐
│                   │       │                   │      │                   │
│  Fontes de Dados  │ ───▶  │ Rede de Oracles   │ ───▶ │  Smart Contracts  │
│                   │       │                   │      │                   │
└───────────────────┘       └───────────────────┘      └───────────────────┘
        │                          │                           │
        ▼                          ▼                           ▼
┌───────────────────┐       ┌───────────────────┐      ┌───────────────────┐
│  APIs de Viagens  │       │                   │      │                   │
│  Dados Ambientais │       │  Processamento    │      │  Lógica de        │
│  Feeds Financeiros│       │  Verificação      │      │  Negócios         │
│  Serviços de IA   │       │  Agregação        │      │  On-Chain         │
└───────────────────┘       └───────────────────┘      └───────────────────┘
```

### Implementação Descentralizada

O TourChain utiliza uma rede descentralizada de oracles para evitar pontos únicos de falha:

1. **Múltiplos Provedores**: Diversas fontes de dados para cada tipo de informação
2. **Consenso de Dados**: Agregação e validação de dados de múltiplas fontes antes do uso
3. **Validação On-chain**: Mecanismos para verificar a autenticidade e validade dos dados
4. **Incentivos Econômicos**: Recompensas para nós oracle que fornecem dados precisos e penalidades para dados incorretos

## Contratos de Oracle

### Oracle Agregador

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title OracleAggregator
 * @dev Contrato para agregar e validar dados de múltiplos oracles
 */
contract OracleAggregator is AccessControl, ReentrancyGuard {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    uint256 public minimumOracles = 3;
    uint256 public validityThreshold = 2;  // Número mínimo de oracles que devem concordar
    
    struct DataPoint {
        uint256 timestamp;
        bytes32 dataType;
        bytes data;
        address provider;
        bool validated;
    }
    
    struct OracleData {
        mapping(bytes32 => DataPoint[]) dataPoints; // dataId => array de pontos de dados
        mapping(bytes32 => bytes) validatedData;    // dataId => dados validados
        mapping(bytes32 => uint256) updateTimestamps; // dataId => timestamp da última atualização
    }
    
    OracleData private oracleStorage;
    mapping(address => uint256) public oracleReliability; // Pontuação de confiabilidade do oracle
    
    event DataSubmitted(address indexed oracle, bytes32 indexed dataType, bytes32 dataId);
    event DataValidated(bytes32 indexed dataType, bytes32 dataId, bytes data);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Permite que um oracle registrado envie dados
     * @param dataType Tipo de dado (ex: 'flight_price', 'hotel_availability')
     * @param dataId Identificador único para o conjunto de dados
     * @param data Os dados reais sendo enviados
     */
    function submitData(
        bytes32 dataType,
        bytes32 dataId,
        bytes calldata data
    ) 
        external 
        onlyRole(ORACLE_ROLE) 
        nonReentrant 
    {
        DataPoint memory newPoint = DataPoint({
            timestamp: block.timestamp,
            dataType: dataType,
            data: data,
            provider: msg.sender,
            validated: false
        });
        
        oracleStorage.dataPoints[dataId].push(newPoint);
        
        // Tenta validar dados após nova submissão
        validateData(dataId);
        
        emit DataSubmitted(msg.sender, dataType, dataId);
    }
    
    /**
     * @dev Valida dados comparando submissões de múltiplos oracles
     * @param dataId O identificador do conjunto de dados a ser validado
     */
    function validateData(bytes32 dataId) internal {
        DataPoint[] storage points = oracleStorage.dataPoints[dataId];
        
        // Verifica se temos pontos de dados suficientes
        if (points.length < validityThreshold) {
            return;
        }
        
        // Mapa para contar votos por valor de dados
        mapping(bytes32 => uint256) storage voteCount;
        bytes mostVotedData;
        uint256 highestVotes = 0;
        
        // Conta votos para cada valor de dados distinto
        for (uint256 i = 0; i < points.length; i++) {
            bytes32 dataHash = keccak256(points[i].data);
            voteCount[dataHash]++;
            
            if (voteCount[dataHash] > highestVotes) {
                highestVotes = voteCount[dataHash];
                mostVotedData = points[i].data;
            }
        }
        
        // Verifica se temos consenso suficiente
        if (highestVotes >= validityThreshold) {
            bytes32 dataType = points[0].dataType;
            oracleStorage.validatedData[dataId] = mostVotedData;
            oracleStorage.updateTimestamps[dataId] = block.timestamp;
            
            // Atualiza confiabilidade dos oracles
            updateOracleReliability(dataId, mostVotedData);
            
            emit DataValidated(dataType, dataId, mostVotedData);
        }
    }
    
    /**
     * @dev Atualiza a pontuação de confiabilidade dos oracles
     * @param dataId O identificador do conjunto de dados
     * @param validData Os dados considerados válidos
     */
    function updateOracleReliability(bytes32 dataId, bytes memory validData) internal {
        DataPoint[] storage points = oracleStorage.dataPoints[dataId];
        
        for (uint256 i = 0; i < points.length; i++) {
            if (keccak256(points[i].data) == keccak256(validData)) {
                // Incrementa confiabilidade para oracles corretos
                oracleReliability[points[i].provider] += 1;
                points[i].validated = true;
            } else {
                // Decrementa confiabilidade para oracles incorretos
                if (oracleReliability[points[i].provider] > 0) {
                    oracleReliability[points[i].provider] -= 1;
                }
            }
        }
    }
    
    /**
     * @dev Recupera dados validados
     * @param dataId O identificador do conjunto de dados
     * @return Os dados validados e o timestamp da última atualização
     */
    function getValidatedData(bytes32 dataId) 
        external 
        view 
        returns (bytes memory, uint256) 
    {
        return (
            oracleStorage.validatedData[dataId],
            oracleStorage.updateTimestamps[dataId]
        );
    }
    
    /**
     * @dev Verifica se os dados são frescos o suficiente
     * @param dataId O identificador do conjunto de dados
     * @param maxAge Idade máxima permitida em segundos
     * @return true se os dados forem válidos e atualizados recentemente
     */
    function isDataFresh(bytes32 dataId, uint256 maxAge) 
        external 
        view 
        returns (bool) 
    {
        uint256 lastUpdate = oracleStorage.updateTimestamps[dataId];
        if (lastUpdate == 0) {
            return false;
        }
        
        return (block.timestamp - lastUpdate) <= maxAge;
    }
    
    /**
     * @dev Altera o número mínimo de oracles necessários para validação
     * @param newMinimum O novo valor mínimo
     */
    function setMinimumOracles(uint256 newMinimum) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(newMinimum > 0, "Minimum must be greater than zero");
        minimumOracles = newMinimum;
    }
    
    /**
     * @dev Altera o threshold de validação
     * @param newThreshold O novo threshold de validação
     */
    function setValidityThreshold(uint256 newThreshold) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(newThreshold > 0, "Threshold must be greater than zero");
        require(newThreshold <= minimumOracles, "Threshold cannot exceed minimum oracles");
        validityThreshold = newThreshold;
    }
    
    /**
     * @dev Adiciona um novo oracle à rede
     * @param oracleAddress O endereço do novo oracle
     */
    function addOracle(address oracleAddress) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        grantRole(ORACLE_ROLE, oracleAddress);
        oracleReliability[oracleAddress] = 1; // Pontuação inicial
    }
    
    /**
     * @dev Remove um oracle da rede
     * @param oracleAddress O endereço do oracle a ser removido
     */
    function removeOracle(address oracleAddress) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        revokeRole(ORACLE_ROLE, oracleAddress);
        oracleReliability[oracleAddress] = 0;
    }
}
```

### Contrato de Oracle Específico para Voos

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./OracleAggregator.sol";

/**
 * @title FlightOracle
 * @dev Oracle especializado para dados de voos
 */
contract FlightOracle is AccessControl {
    bytes32 public constant DATA_PROVIDER_ROLE = keccak256("DATA_PROVIDER_ROLE");
    
    OracleAggregator public aggregator;
    
    // Tipos de dados de voo
    bytes32 public constant FLIGHT_PRICE = keccak256("FLIGHT_PRICE");
    bytes32 public constant FLIGHT_STATUS = keccak256("FLIGHT_STATUS");
    bytes32 public constant FLIGHT_DELAY = keccak256("FLIGHT_DELAY");
    bytes32 public constant FLIGHT_EMISSIONS = keccak256("FLIGHT_EMISSIONS");
    
    event FlightDataUpdated(
        bytes32 indexed flightId,
        bytes32 indexed dataType,
        bytes32 dataHash
    );
    
    constructor(address aggregatorAddress) {
        aggregator = OracleAggregator(aggregatorAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Atualiza dados de preço de voo
     * @param flightId ID único do voo (cia aérea + número + data)
     * @param price Preço em centavos da moeda base
     * @param currency Código da moeda (ex: "USD", "EUR")
     * @param validUntil Timestamp de validade do preço
     */
    function updateFlightPrice(
        string calldata flightId,
        uint256 price,
        string calldata currency,
        uint256 validUntil
    )
        external
        onlyRole(DATA_PROVIDER_ROLE)
    {
        bytes32 id = keccak256(abi.encodePacked(flightId, "price"));
        bytes memory data = abi.encode(price, currency, validUntil);
        
        aggregator.submitData(
            FLIGHT_PRICE,
            id,
            data
        );
        
        emit FlightDataUpdated(
            keccak256(abi.encodePacked(flightId)),
            FLIGHT_PRICE,
            keccak256(data)
        );
    }
    
    /**
     * @dev Atualiza status de voo
     * @param flightId ID único do voo
     * @param status Código de status (0=Programado, 1=Embarcando, 2=Decolou, 3=Pousou, 4=Atrasado, 5=Cancelado)
     * @param statusTime Timestamp da atualização de status
     */
    function updateFlightStatus(
        string calldata flightId,
        uint8 status,
        uint256 statusTime
    )
        external
        onlyRole(DATA_PROVIDER_ROLE)
    {
        bytes32 id = keccak256(abi.encodePacked(flightId, "status"));
        bytes memory data = abi.encode(status, statusTime);
        
        aggregator.submitData(
            FLIGHT_STATUS,
            id,
            data
        );
        
        emit FlightDataUpdated(
            keccak256(abi.encodePacked(flightId)),
            FLIGHT_STATUS,
            keccak256(data)
        );
    }
    
    /**
     * @dev Atualiza informações de emissões de carbono para um voo
     * @param flightId ID único do voo
     * @param emissionsGrams Emissões de CO2 em gramas por passageiro
     * @param calculationMethod Método utilizado para cálculo (1=ICAO, 2=IATA, 3=Proprietário)
     */
    function updateFlightEmissions(
        string calldata flightId,
        uint256 emissionsGrams,
        uint8 calculationMethod
    )
        external
        onlyRole(DATA_PROVIDER_ROLE)
    {
        bytes32 id = keccak256(abi.encodePacked(flightId, "emissions"));
        bytes memory data = abi.encode(emissionsGrams, calculationMethod, block.timestamp);
        
        aggregator.submitData(
            FLIGHT_EMISSIONS,
            id,
            data
        );
        
        emit FlightDataUpdated(
            keccak256(abi.encodePacked(flightId)),
            FLIGHT_EMISSIONS,
            keccak256(data)
        );
    }
    
    /**
     * @dev Recupera dados de preço de voo
     * @param flightId ID do voo
     * @return price Preço em centavos
     * @return currency Código da moeda
     * @return validUntil Timestamp de validade
     * @return lastUpdated Último timestamp de atualização
     */
    function getFlightPrice(string calldata flightId)
        external
        view
        returns (uint256 price, string memory currency, uint256 validUntil, uint256 lastUpdated)
    {
        bytes32 id = keccak256(abi.encodePacked(flightId, "price"));
        (bytes memory data, uint256 timestamp) = aggregator.getValidatedData(id);
        
        if (data.length > 0) {
            (price, currency, validUntil) = abi.decode(data, (uint256, string, uint256));
            lastUpdated = timestamp;
        }
    }
    
    /**
     * @dev Recupera dados de emissões de carbono para um voo
     * @param flightId ID do voo
     * @return emissionsGrams Emissões em gramas de CO2 por passageiro
     * @return calculationMethod Método de cálculo utilizado
     * @return lastUpdated Último timestamp de atualização
     */
    function getFlightEmissions(string calldata flightId)
        external
        view
        returns (uint256 emissionsGrams, uint8 calculationMethod, uint256 lastUpdated)
    {
        bytes32 id = keccak256(abi.encodePacked(flightId, "emissions"));
        (bytes memory data, uint256 timestamp) = aggregator.getValidatedData(id);
        
        if (data.length > 0) {
            uint256 calcTime;
            (emissionsGrams, calculationMethod, calcTime) = abi.decode(data, (uint256, uint8, uint256));
            lastUpdated = timestamp;
        }
    }
}
```

## Integração com Provedores Externos

### Fontes de Dados

O TourChain integra-se com múltiplas fontes de dados para cada categoria de oracle:

#### Provedores de Dados de Viagem
* GDS (Sistemas de Distribuição Global): Sabre, Amadeus, Travelport
* APIs de companhias aéreas: diretas e via NDC
* Agregadores de hotéis: Booking.com, Expedia, Hotels.com
* Serviços de mobilidade: Uber, Lyft, empresas locais de transporte

#### Provedores de Dados de Sustentabilidade
* ICAO Carbon Emissions Calculator
* Metodologia DEFRA para cálculo de emissões
* Registros de créditos de carbono: Gold Standard, Verra
* APIs de compensação: Pachama, Compensate, Carbon Chain

#### Provedores de Dados Financeiros
* Oracles de preços: Chainlink, API3, Band Protocol
* Provedores de taxas de câmbio: Fixer.io, Open Exchange Rates

### Arquitetura de Nós Off-Chain

```
┌───────────────────────────────────────┐
│              Nó Oracle                │
├───────────────────────────────────────┤
│ ┌─────────────┐    ┌────────────────┐ │
│ │ Adaptadores  │    │  Verificação   │ │
│ │ de API       │─┬─▶│  & Validação   │ │
│ └─────────────┘ │  └────────────────┘ │
│                 │          │          │
│ ┌─────────────┐ │  ┌────────────────┐ │
│ │ Monitoramento│ │  │  Interface    │ │
│ │ & Alertas    │◀┴─▶│  Blockchain    │ │
│ └─────────────┘    └────────────────┘ │
└───────────────────────────────────────┘
           │                 ▲
           ▼                 │
┌────────────────────────────────────────┐
│               Blockchain               │
└────────────────────────────────────────┘
```

## Casos de Uso de Oracles no TourChain

### 1. Reserva de Viagem Automatizada

```
Fluxo de Processo:
1. Usuário solicita reserva de voo na plataforma
2. Smart contract consulta Oracle de Voos para preços e disponibilidade
3. Oracle retorna dados verificados de múltiplas fontes
4. Smart contract executa reserva se condições (preço, políticas) forem atendidas
5. Oracle atualiza status de confirmação da reserva
```

### 2. Compensação de Carbono Verificável

```
Fluxo de Processo:
1. Viagem é registrada na blockchain
2. Oracle de Emissões calcula pegada de carbono com base na rota, veículo, etc.
3. Smart contract aloca fundos para compensação
4. Oracle de Certificação verifica projetos de compensação legítimos
5. Smart contract adquire e registra créditos de carbono tokenizados
6. Oracle valida a conclusão da compensação
```

### 3. Reembolso Automático por Atrasos

```
Fluxo de Processo:
1. Oracle de Status de Voo monitora status de voos reservados
2. Atraso ou cancelamento detectado e verificado por múltiplos provedores
3. Smart contract recebe dados validados via oracle
4. Políticas de reembolso são aplicadas automaticamente
5. Pagamento de compensação executado conforme termos contratuais
```

## Mecanismos de Segurança

### Prevenção de Manipulação

1. **Consenso Multi-Fonte**: Dados validados apenas quando múltiplas fontes concordam
2. **Staking Econômico**: Nós oracle devem fazer stake de tokens TOUR como garantia
3. **Reputação On-Chain**: Histórico de precisão de cada provedor de oracle rastreado na blockchain
4. **Atraso de Deliberação**: Período de tempo para contestação antes da finalização de dados críticos

### Auditoria e Transparência

1. **Logs Imutáveis**: Todas as atualizações de dados são registradas na blockchain
2. **Monitoramento de Desvios**: Alertas para variações significativas entre provedores
3. **Verificabilidade Pública**: Qualquer parte pode verificar a fonte e o processamento dos dados

## Roadmap de Desenvolvimento de Oracles

### Fase 1: Q4 2025
- Implementação do contrato base do OracleAggregator
- Integração com 3-5 provedores de dados por categoria
- Testes em ambiente de testnet com dados reais

### Fase 2: Q1 2026
- Lançamento de oracles especializados (voos, hospedagem, emissões)
- Implementação do sistema de reputação e staking
- Auditoria de segurança dos contratos oracle

### Fase 3: Q2 2026
- Descentralização completa da rede oracle
- Expansão para 10+ provedores de dados
- Implementação de oracles de IA avançados

## Considerações para Desenvolvedores

### Melhores Práticas

1. **Nunca confie em um único oracle** para dados críticos
2. **Implemente timeout para dados** para evitar uso de informações obsoletas
3. **Adicione lógica de fallback** para casos de indisponibilidade de oracles
4. **Verifique selos temporais** para garantir a atualidade dos dados
5. **Considere custos de gas** ao consultar oracles frequentemente

### Exemplo de Integração

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FlightOracle.sol";

contract TravelBooking {
    FlightOracle public flightOracle;
    uint256 public constant MAX_DATA_AGE = 15 minutes;
    
    event BookingCreated(bytes32 bookingId, string flightId, address traveler);
    event CompensationIssued(bytes32 bookingId, uint256 amount);
    
    struct Booking {
        string flightId;
        address traveler;
        uint256 bookingTime;
        uint256 price;
        bool compensationIssued;
        uint256 carbonEmissionsGrams;
    }
    
    mapping(bytes32 => Booking) public bookings;
    
    constructor(address _flightOracleAddress) {
        flightOracle = FlightOracle(_flightOracleAddress);
    }
    
    function createBooking(string calldata flightId) 
        external 
        payable 
        returns (bytes32) 
    {
        // Verifica preço atual do voo
        (uint256 price, , uint256 validUntil, uint256 lastUpdated) = flightOracle.getFlightPrice(flightId);
        
        // Verifica se os dados do oracle estão atualizados
        require(block.timestamp - lastUpdated <= MAX_DATA_AGE, "Flight price data too old");
        require(block.timestamp <= validUntil, "Flight price no longer valid");
        require(msg.value >= price, "Insufficient payment for flight");
        
        // Cria ID único para a reserva
        bytes32 bookingId = keccak256(abi.encodePacked(flightId, msg.sender, block.timestamp));
        
        // Obter dados de emissões
        (uint256 emissionsGrams, , ) = flightOracle.getFlightEmissions(flightId);
        
        // Armazena reserva
        bookings[bookingId] = Booking({
            flightId: flightId,
            traveler: msg.sender,
            bookingTime: block.timestamp,
            price: price,
            compensationIssued: false,
            carbonEmissionsGrams: emissionsGrams
        });
        
        emit BookingCreated(bookingId, flightId, msg.sender);
        
        return bookingId;
    }
    
    function issueDelayCompensation(bytes32 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.bookingTime > 0, "Booking does not exist");
        require(!booking.compensationIssued, "Compensation already issued");
        
        // Consulta oracle para verificar status do voo
        (bytes memory statusData, uint256 lastUpdated) = flightOracle.aggregator().getValidatedData(
            keccak256(abi.encodePacked(booking.flightId, "status"))
        );
        
        require(block.timestamp - lastUpdated <= MAX_DATA_AGE, "Flight status data too old");
        
        (uint8 status, uint256 statusTime) = abi.decode(statusData, (uint8, uint256));
        
        // Verifica se o voo está atrasado (status 4)
        require(status == 4, "Flight not delayed");
        
        // Calcula compensação (exemplo: 20% do preço)
        uint256 compensationAmount = (booking.price * 20) / 100;
        
        // Marca compensação como emitida
        booking.compensationIssued = true;
        
        // Envia compensação ao viajante
        payable(booking.traveler).transfer(compensationAmount);
        
        emit CompensationIssued(bookingId, compensationAmount);
    }
}
```

---

Esta documentação será atualizada à medida que novos recursos oracle são desenvolvidos e implementados no ecossistema TourChain.