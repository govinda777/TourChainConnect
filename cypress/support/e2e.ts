// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands.ts';
import '@cypress/webpack-preprocessor';
import 'cypress-localstorage-commands';
import { blockchainMock } from './blockchain-mock';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<Element>;
    }
  }
}

beforeEach(() => {
  cy.intercept('GET', '/api/**', (req) => {
    req.continue();
  }).as('apiRequests');

  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });

  blockchainMock.setup().then((defaultAccount) => {
    cy.wrap(defaultAccount).as('userAccount');
  });
});

// Custom commands for blockchain interactions
Cypress.Commands.add('connectWallet', () => {
  cy.get('[data-testid=connect-wallet]').click();
  cy.get('@userAccount').then((account) => {
    cy.window().then((win) => {
      win.ethereum.selectedAddress = account;
    });
  });
});

Cypress.Commands.add('mockTokenBalance', (balance: string) => {
  cy.get('@userAccount').then((account) => {
    blockchainMock.mockContractCall(
      'TOKEN_CONTRACT_ADDRESS',
      'balanceOf',
      ethers.parseEther(balance)
    );
  });
});