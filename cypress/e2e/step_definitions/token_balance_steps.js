
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the homepage', () => {
  cy.visit('/');
});

When('I connect my wallet', () => {
  cy.connectWallet();
});

Then('I should see my token balance', () => {
  cy.mockTokenBalance('100');
  cy.get('[data-testid=token-balance]').should('contain', '100');
});

Then('the balance should update when I receive tokens', () => {
  cy.mockTokenBalance('150');
  cy.get('[data-testid=token-balance]').should('contain', '150');
});
