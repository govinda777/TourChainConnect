// ***********************************************
// Custom commands for Cypress
// ***********************************************

// Command to select elements by data-cy attribute
Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`);
});

// Command to navigate to a journey page
Cypress.Commands.add('navigateToJourney', (journeyType) => {
  cy.visit('/');
  cy.contains('button', journeyType).click();
});

// Command to complete a journey stage
Cypress.Commands.add('completeStage', () => {
  cy.get('[data-cy=next-stage-button]').click();
});

// Command to verify journey progress
Cypress.Commands.add('verifyProgress', (percentage) => {
  cy.get('[data-cy=journey-progress]').should('have.attr', 'value', percentage);
});

// Command to support blockchain wallet connection mock
Cypress.Commands.add('connectWallet', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('wallet_connected', 'true');
    win.localStorage.setItem('wallet_address', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  });
  cy.get('[data-cy=connect-wallet-button]').click();
});

// Command to pledge to crowdfunding
Cypress.Commands.add('makePledge', (amount, rewardId = null) => {
  cy.get('[data-cy=pledge-amount-input]').type(amount);
  if (rewardId) {
    cy.get(`[data-cy=reward-tier-${rewardId}]`).click();
  }
  cy.get('[data-cy=submit-pledge-button]').click();
});

// Add more custom commands as needed...