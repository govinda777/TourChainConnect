// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TourOracle
 * @dev Contrato de oracle para fornecer dados externos para a plataforma TourChain
 */
contract TourOracle is AccessControl, ReentrancyGuard {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Estruturas para diferentes tipos de dados
    struct CarbonEmissionData {
        uint256 timestamp;
        uint256 emissionAmount; // em gramas de CO2
        string travelMode;      // "air", "train", "car", etc.
        uint256 distance;       // em quilômetros
        string dataSource;      // fonte de dados
    }
    
    struct PriceData {
        uint256 timestamp;
        string currencyPair;    // ex: "USD/EUR"
        uint256 price;          // preço multiplicado por 10^18
        string dataSource;      // fonte de dados
    }
    
    struct TravelOptimizationData {
        uint256 timestamp;
        string origin;
        string destination;
        uint256 optimizedCost;  // custo otimizado em centavos
        uint256 originalCost;   // custo original em centavos
        uint256 savingsPercent; // porcentagem de economia multiplicada por 100
        string[] optimizations; // lista de otimizações aplicadas
        string dataSource;      // fonte de dados
    }
    
    // Mapeamentos para armazenamento de dados
    mapping(bytes32 => CarbonEmissionData) private carbonEmissionData;
    mapping(bytes32 => PriceData) private priceData;
    mapping(bytes32 => TravelOptimizationData) private travelOptimizationData;
    
    // Lista de oráculos com stake
    mapping(address => uint256) public oracleStakes;
    address[] public oraclesList;
    uint256 public minimumStake;
    
    // Eventos
    event CarbonEmissionUpdated(bytes32 indexed dataId, uint256 timestamp, uint256 emissionAmount, string travelMode);
    event PriceUpdated(bytes32 indexed dataId, uint256 timestamp, string currencyPair, uint256 price);
    event TravelOptimizationUpdated(bytes32 indexed dataId, uint256 timestamp, string origin, string destination, uint256 savingsPercent);
    event OracleAdded(address indexed oracle, uint256 stake);
    event OracleRemoved(address indexed oracle);
    event StakeUpdated(address indexed oracle, uint256 newStake);
    event MinimumStakeUpdated(uint256 newMinimumStake);
    
    /**
     * @dev Inicializa o contrato com um stake mínimo para oráculos
     */
    constructor(uint256 _minimumStake) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        
        minimumStake = _minimumStake;
    }
    
    /**
     * @dev Adiciona um oráculo ao sistema com stake
     */
    function addOracle(address oracle) external payable nonReentrant {
        require(oracle != address(0), "TourOracle: zero address");
        require(msg.value >= minimumStake, "TourOracle: stake too low");
        require(oracleStakes[oracle] == 0, "TourOracle: oracle already exists");
        
        oracleStakes[oracle] = msg.value;
        oraclesList.push(oracle);
        
        _grantRole(ORACLE_ROLE, oracle);
        
        emit OracleAdded(oracle, msg.value);
    }
    
    /**
     * @dev Remove um oráculo do sistema e devolve o stake
     */
    function removeOracle(address oracle) external nonReentrant onlyRole(ADMIN_ROLE) {
        require(oracleStakes[oracle] > 0, "TourOracle: oracle not found");
        
        uint256 stake = oracleStakes[oracle];
        oracleStakes[oracle] = 0;
        
        _revokeRole(ORACLE_ROLE, oracle);
        
        // Remove da lista
        for (uint256 i = 0; i < oraclesList.length; i++) {
            if (oraclesList[i] == oracle) {
                oraclesList[i] = oraclesList[oraclesList.length - 1];
                oraclesList.pop();
                break;
            }
        }
        
        // Devolve o stake
        (bool success, ) = payable(oracle).call{value: stake}("");
        require(success, "TourOracle: transfer failed");
        
        emit OracleRemoved(oracle);
    }
    
    /**
     * @dev Atualiza o stake de um oráculo
     */
    function updateStake() external payable nonReentrant onlyRole(ORACLE_ROLE) {
        require(oracleStakes[msg.sender] > 0, "TourOracle: oracle not found");
        require(oracleStakes[msg.sender] + msg.value >= minimumStake, "TourOracle: stake too low");
        
        oracleStakes[msg.sender] += msg.value;
        
        emit StakeUpdated(msg.sender, oracleStakes[msg.sender]);
    }
    
    /**
     * @dev Atualiza o stake mínimo necessário
     */
    function updateMinimumStake(uint256 _minimumStake) external onlyRole(ADMIN_ROLE) {
        minimumStake = _minimumStake;
        emit MinimumStakeUpdated(_minimumStake);
    }
    
    /**
     * @dev Atualiza dados de emissões de carbono
     */
    function updateCarbonEmission(
        bytes32 dataId,
        uint256 emissionAmount,
        string calldata travelMode,
        uint256 distance,
        string calldata dataSource
    ) external onlyRole(ORACLE_ROLE) {
        carbonEmissionData[dataId] = CarbonEmissionData({
            timestamp: block.timestamp,
            emissionAmount: emissionAmount,
            travelMode: travelMode,
            distance: distance,
            dataSource: dataSource
        });
        
        emit CarbonEmissionUpdated(dataId, block.timestamp, emissionAmount, travelMode);
    }
    
    /**
     * @dev Atualiza dados de preços
     */
    function updatePrice(
        bytes32 dataId,
        string calldata currencyPair,
        uint256 price,
        string calldata dataSource
    ) external onlyRole(ORACLE_ROLE) {
        priceData[dataId] = PriceData({
            timestamp: block.timestamp,
            currencyPair: currencyPair,
            price: price,
            dataSource: dataSource
        });
        
        emit PriceUpdated(dataId, block.timestamp, currencyPair, price);
    }
    
    /**
     * @dev Atualiza dados de otimização de viagens
     */
    function updateTravelOptimization(
        bytes32 dataId,
        string calldata origin,
        string calldata destination,
        uint256 optimizedCost,
        uint256 originalCost,
        uint256 savingsPercent,
        string[] calldata optimizations,
        string calldata dataSource
    ) external onlyRole(ORACLE_ROLE) {
        travelOptimizationData[dataId] = TravelOptimizationData({
            timestamp: block.timestamp,
            origin: origin,
            destination: destination,
            optimizedCost: optimizedCost,
            originalCost: originalCost,
            savingsPercent: savingsPercent,
            optimizations: optimizations,
            dataSource: dataSource
        });
        
        emit TravelOptimizationUpdated(dataId, block.timestamp, origin, destination, savingsPercent);
    }
    
    /**
     * @dev Obtém dados de emissões de carbono
     */
    function getCarbonEmission(bytes32 dataId) external view returns (
        uint256 timestamp,
        uint256 emissionAmount,
        string memory travelMode,
        uint256 distance,
        string memory dataSource
    ) {
        CarbonEmissionData memory data = carbonEmissionData[dataId];
        require(data.timestamp > 0, "TourOracle: data not found");
        
        return (
            data.timestamp,
            data.emissionAmount,
            data.travelMode,
            data.distance,
            data.dataSource
        );
    }
    
    /**
     * @dev Obtém dados de preços
     */
    function getPrice(bytes32 dataId) external view returns (
        uint256 timestamp,
        string memory currencyPair,
        uint256 price,
        string memory dataSource
    ) {
        PriceData memory data = priceData[dataId];
        require(data.timestamp > 0, "TourOracle: data not found");
        
        return (
            data.timestamp,
            data.currencyPair,
            data.price,
            data.dataSource
        );
    }
    
    /**
     * @dev Obtém dados de otimização de viagens
     */
    function getTravelOptimization(bytes32 dataId) external view returns (
        uint256 timestamp,
        string memory origin,
        string memory destination,
        uint256 optimizedCost,
        uint256 originalCost,
        uint256 savingsPercent,
        string[] memory optimizations,
        string memory dataSource
    ) {
        TravelOptimizationData memory data = travelOptimizationData[dataId];
        require(data.timestamp > 0, "TourOracle: data not found");
        
        return (
            data.timestamp,
            data.origin,
            data.destination,
            data.optimizedCost,
            data.originalCost,
            data.savingsPercent,
            data.optimizations,
            data.dataSource
        );
    }
    
    /**
     * @dev Retorna a lista de todos os oráculos
     */
    function getOraclesList() external view returns (address[] memory) {
        return oraclesList;
    }
    
    /**
     * @dev Recebe ETH enviado para o contrato (função fallback)
     */
    receive() external payable {}
}