// ***********************************************************
// Support file for E2E tests
// Automatically loaded before test files
// ***********************************************************

import './commands.ts';
import '@cypress/webpack-preprocessor';
import 'cypress-localstorage-commands';
import { blockchainMock } from './blockchain-mock';

// Define global types for custom Cypress commands
declare global {
  namespace Cypress {
    interface Chainable {
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
}

// Setup test environment before each test
beforeEach(() => {
  // Intercept and monitor API requests
  cy.intercept('GET', '/api/**', (req) => {
    req.continue();
  }).as('apiRequests');

  // Clear browser storage
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });

  // Setup blockchain mock
  blockchainMock.setup().then((defaultAccount) => {
    cy.wrap(defaultAccount).as('userAccount');
  });
});