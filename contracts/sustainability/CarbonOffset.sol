// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CarbonOffset
 * @dev Contrato para rastreamento e compensação de emissões de carbono
 */
contract CarbonOffset is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct Offset {
        uint256 id;
        address company;
        uint256 emissionAmount; // em gramas de CO2
        string travelDetails;  // detalhes da viagem (pode ser um JSON stringificado)
        uint256 offsetAmount;   // quantidade compensada
        uint256 cost;          // custo da compensação
        bool verified;         // se já foi verificado
        uint256 timestamp;     // quando foi criado
        string offsetMethod;   // método de compensação usado
    }
    
    struct OffsetProject {
        uint256 id;
        string name;
        string description;
        uint256 pricePerTon;  // preço por tonelada de CO2 em tokens (x 10^18)
        string location;
        string projectType;   // "reforestation", "renewable", etc.
        bool active;
        uint256 totalOffsetCapacity; // capacidade total em toneladas
        uint256 remainingCapacity;   // capacidade restante em toneladas
    }
    
    // Variáveis de estado
    IERC20 public paymentToken;
    address payable public offsetAdmin;
    uint256 public platformFeePercent; // em base 10000 (ex: 500 = 5%)
    
    uint256 private offsetCounter;
    uint256 private projectCounter;
    
    // Mapeamentos
    mapping(uint256 => Offset) public offsets;
    mapping(uint256 => OffsetProject) public offsetProjects;
    mapping(address => uint256[]) public companyOffsets;
    mapping(uint256 => uint256[]) public projectOffsets;
    
    // Estatísticas globais
    uint256 public totalEmissionsTracked;
    uint256 public totalEmissionsOffset;
    
    // Eventos
    event OffsetCreated(uint256 indexed offsetId, address indexed company, uint256 emissionAmount, uint256 offsetAmount, uint256 cost);
    event OffsetVerified(uint256 indexed offsetId, address indexed verifier);
    event ProjectAdded(uint256 indexed projectId, string name, uint256 pricePerTon, uint256 capacity);
    event ProjectUpdated(uint256 indexed projectId, uint256 pricePerTon, uint256 remainingCapacity, bool active);
    event PlatformFeeUpdated(uint256 newFeePercent);
    
    /**
     * @dev Inicializa o contrato com o token de pagamento
     */
    constructor(
        address _paymentToken,
        address payable _offsetAdmin,
        uint256 _platformFeePercent
    ) {
        require(_paymentToken != address(0), "CarbonOffset: zero token address");
        require(_offsetAdmin != address(0), "CarbonOffset: zero admin address");
        require(_platformFeePercent <= 2000, "CarbonOffset: fee too high"); // Max 20%
        
        paymentToken = IERC20(_paymentToken);
        offsetAdmin = _offsetAdmin;
        platformFeePercent = _platformFeePercent;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }
    
    /**
     * @dev Adiciona um novo projeto de compensação de carbono
     */
    function addOffsetProject(
        string memory name,
        string memory description,
        uint256 pricePerTon,
        string memory location,
        string memory projectType,
        uint256 totalCapacity
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(bytes(name).length > 0, "CarbonOffset: empty name");
        require(pricePerTon > 0, "CarbonOffset: invalid price");
        require(totalCapacity > 0, "CarbonOffset: invalid capacity");
        
        uint256 projectId = ++projectCounter;
        
        offsetProjects[projectId] = OffsetProject({
            id: projectId,
            name: name,
            description: description,
            pricePerTon: pricePerTon,
            location: location,
            projectType: projectType,
            active: true,
            totalOffsetCapacity: totalCapacity,
            remainingCapacity: totalCapacity
        });
        
        emit ProjectAdded(projectId, name, pricePerTon, totalCapacity);
        return projectId;
    }
    
    /**
     * @dev Atualiza um projeto de compensação existente
     */
    function updateOffsetProject(
        uint256 projectId,
        uint256 pricePerTon,
        uint256 additionalCapacity,
        bool active
    ) external onlyRole(ADMIN_ROLE) {
        OffsetProject storage project = offsetProjects[projectId];
        require(project.id > 0, "CarbonOffset: project not found");
        
        if (pricePerTon > 0) {
            project.pricePerTon = pricePerTon;
        }
        
        if (additionalCapacity > 0) {
            project.totalOffsetCapacity += additionalCapacity;
            project.remainingCapacity += additionalCapacity;
        }
        
        project.active = active;
        
        emit ProjectUpdated(
            projectId,
            project.pricePerTon,
            project.remainingCapacity,
            project.active
        );
    }
    
    /**
     * @dev Cria um novo offset para compensar emissões de carbono
     */
    function createOffset(
        uint256 projectId,
        uint256 emissionAmount,
        string memory travelDetails,
        string memory offsetMethod
    ) external nonReentrant returns (uint256) {
        OffsetProject storage project = offsetProjects[projectId];
        require(project.id > 0, "CarbonOffset: project not found");
        require(project.active, "CarbonOffset: project not active");
        require(emissionAmount > 0, "CarbonOffset: emission amount must be > 0");
        
        // Converte gramas para toneladas (1 tonelada = 1.000.000 gramas)
        uint256 emissionTons = (emissionAmount + 999999) / 1000000; // arredonda para cima
        require(emissionTons <= project.remainingCapacity, "CarbonOffset: exceeds capacity");
        
        // Calcula o custo
        uint256 cost = emissionTons * project.pricePerTon;
        
        // Calcula a taxa da plataforma
        uint256 platformFee = (cost * platformFeePercent) / 10000;
        uint256 totalCost = cost + platformFee;
        
        // Transfere os tokens
        paymentToken.safeTransferFrom(msg.sender, address(this), totalCost);
        paymentToken.safeTransfer(offsetAdmin, platformFee);
        
        // Atualiza a capacidade do projeto
        project.remainingCapacity -= emissionTons;
        
        // Cria o offset
        uint256 offsetId = ++offsetCounter;
        offsets[offsetId] = Offset({
            id: offsetId,
            company: msg.sender,
            emissionAmount: emissionAmount,
            travelDetails: travelDetails,
            offsetAmount: emissionTons * 1000000, // converte de volta para gramas
            cost: cost,
            verified: false,
            timestamp: block.timestamp,
            offsetMethod: offsetMethod
        });
        
        // Atualiza mapeamentos e estatísticas
        companyOffsets[msg.sender].push(offsetId);
        projectOffsets[projectId].push(offsetId);
        
        totalEmissionsTracked += emissionAmount;
        totalEmissionsOffset += emissionTons * 1000000;
        
        emit OffsetCreated(offsetId, msg.sender, emissionAmount, emissionTons * 1000000, cost);
        return offsetId;
    }
    
    /**
     * @dev Verifica um offset (somente oráculos podem fazer isso)
     */
    function verifyOffset(uint256 offsetId) external onlyRole(ORACLE_ROLE) {
        Offset storage offset = offsets[offsetId];
        require(offset.id > 0, "CarbonOffset: offset not found");
        require(!offset.verified, "CarbonOffset: already verified");
        
        offset.verified = true;
        
        emit OffsetVerified(offsetId, msg.sender);
    }
    
    /**
     * @dev Atualiza a porcentagem da taxa da plataforma
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyRole(ADMIN_ROLE) {
        require(newFeePercent <= 2000, "CarbonOffset: fee too high"); // Max 20%
        platformFeePercent = newFeePercent;
        
        emit PlatformFeeUpdated(newFeePercent);
    }
    
    /**
     * @dev Atualiza o administrador de compensações
     */
    function updateOffsetAdmin(address payable newAdmin) external onlyRole(ADMIN_ROLE) {
        require(newAdmin != address(0), "CarbonOffset: zero address");
        offsetAdmin = newAdmin;
    }
    
    /**
     * @dev Retorna os IDs de offset de uma empresa
     */
    function getCompanyOffsets(address company) external view returns (uint256[] memory) {
        return companyOffsets[company];
    }
    
    /**
     * @dev Retorna os IDs de offset de um projeto
     */
    function getProjectOffsets(uint256 projectId) external view returns (uint256[] memory) {
        return projectOffsets[projectId];
    }
    
    /**
     * @dev Calcula o custo para compensar uma certa quantidade de emissões em um projeto específico
     */
    function calculateOffsetCost(uint256 projectId, uint256 emissionAmount) external view returns (uint256 cost, uint256 platformFee) {
        OffsetProject storage project = offsetProjects[projectId];
        require(project.id > 0, "CarbonOffset: project not found");
        
        // Converte gramas para toneladas
        uint256 emissionTons = (emissionAmount + 999999) / 1000000; // arredonda para cima
        
        cost = emissionTons * project.pricePerTon;
        platformFee = (cost * platformFeePercent) / 10000;
        
        return (cost, platformFee);
    }
}