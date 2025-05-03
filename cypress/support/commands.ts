// ***********************************************
// Custom Cypress commands for our application tests
// ***********************************************
import 'cypress-localstorage-commands';
import { blockchainMock } from './blockchain-mock';

// Command to select elements by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy="${value}"]`) as unknown as Cypress.Chainable<Element>;
});

// Command to mock connecting a wallet
Cypress.Commands.add('connectWallet', () => {
  cy.window().then((win) => {
    win.ethereum = {
      isMetaMask: true,
      request: ({ method }: { method: string }) => {
        if (method === 'eth_requestAccounts') {
          return Promise.resolve(['0x0000000000000000000000000000000000000001']);
        }
        return Promise.resolve(null);
      }
    };
  });
  
  // Click the connect wallet button if it exists
  cy.get('[data-testid=connect-wallet-button]').then(($btn) => {
    if ($btn.length > 0) {
      cy.wrap($btn).click();
    }
  });
});

// Command to mock token balance
Cypress.Commands.add('mockTokenBalance', (balance: string) => {
  cy.window().then((win) => {
    // Mock the contract call that returns the token balance
    blockchainMock.mockContractCall(
      '0xTourTokenAddress', // Use the actual address in your environment
      'balanceOf',
      balance
    );
    
    // Trigger an event that your app listens to for balance updates
    win.dispatchEvent(new CustomEvent('blockchain:balance-update'));
  });
});