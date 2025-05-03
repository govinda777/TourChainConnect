// Type definitions for Cypress commands
/// <reference types="cypress" />

// Esta é a forma correta de estender tipos globais do Cypress
declare namespace Cypress {
  // Estenda a interface AUTWindow para incluir ethereum
  interface AUTWindow {
    ethereum?: any;
  }

  interface Chainable<Subject = any> {
    /**
     * Custom command to select DOM element by data-cy attribute
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<Element>;
    
    /**
     * Mock connecting a wallet for blockchain tests
     * @example cy.connectWallet()
     */
    connectWallet(): Chainable<Element>;
    
    /**
     * Mock token balance for the currently connected wallet
     * @example cy.mockTokenBalance('100')
     */
    mockTokenBalance(balance: string): Chainable<Element>;
  }
}