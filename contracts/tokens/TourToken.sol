// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title TourToken
 * @dev Token ERC20 para a plataforma TourChain
 * Implementa governança, queima e controle de acesso
 */
contract TourToken is ERC20, ERC20Burnable, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    uint256 private constant _maxSupply = 100_000_000 * 10**18; // 100 milhões de tokens

    /**
     * @dev Inicializa o contrato TourToken com nome e símbolo.
     * O criador do contrato recebe a função de admin e pode designar outras funções.
     */
    constructor() ERC20("TourChain Token", "TOUR") ERC20Permit("TourChain Token") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        
        // Cunha 10 milhões de tokens inicialmente para a distribuição inicial e liquidez
        _mint(msg.sender, 10_000_000 * 10**18);
    }

    /**
     * @dev Permite que endereços com a função MINTER_ROLE criem novos tokens.
     * Não permite criação além do fornecimento máximo.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= _maxSupply, "TourToken: max supply exceeded");
        _mint(to, amount);
    }

    /**
     * @dev Retorna o fornecimento máximo de tokens.
     */
    function maxSupply() public pure returns (uint256) {
        return _maxSupply;
    }

    /**
     * @dev Hook interno que é chamado durante qualquer transferência de tokens.
     * Pode ser usado para implementar lógica adicional como bloqueio de trading.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Hook interno necessário para compatibilidade com ERC20Votes.
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    /**
     * @dev Hook interno necessário para compatibilidade com ERC20Votes.
     */
    function _mint(
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    /**
     * @dev Hook interno necessário para compatibilidade com ERC20Votes.
     */
    function _burn(
        address account,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}