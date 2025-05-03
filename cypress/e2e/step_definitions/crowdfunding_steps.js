import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Passos para testes da página de financiamento coletivo

Given('que estou na página de financiamento coletivo', () => {
  cy.visit('/crowdfunding');
});

Then('devo ver as informações da campanha', () => {
  cy.contains('TourChain').should('be.visible');
  cy.get('[data-cy=campaign-description]').should('be.visible');
});

Then('devo ver a porcentagem de financiamento atual', () => {
  cy.get('[data-cy=campaign-percentage]').should('be.visible');
});

Then('devo ver o número de apoiadores', () => {
  cy.get('[data-cy=campaign-backers]').should('be.visible');
});

Then('devo ver os dias restantes para o término da campanha', () => {
  cy.get('[data-cy=campaign-days-left]').should('be.visible');
});

When('eu rolo até a seção {string}', (sectionName) => {
  cy.contains('h2', sectionName).scrollIntoView();
});

Then('devo ver os diferentes níveis de recompensa disponíveis', () => {
  cy.get('[data-cy^=reward-tier]').should('have.length.at.least', 1);
});

Then('cada nível deve mostrar o valor da contribuição', () => {
  cy.get('[data-cy^=reward-tier]').each(($tier) => {
    cy.wrap($tier).find('[data-cy=reward-amount]').should('be.visible');
  });
});

Then('cada nível deve mostrar detalhes do smart contract associado', () => {
  cy.get('[data-cy^=reward-tier]').each(($tier) => {
    cy.wrap($tier).find('[data-cy=reward-contract]').should('be.visible');
  });
});

When('eu clico no botão {string}', (buttonText) => {
  cy.contains('button', buttonText).click();
});

Then('devo ver a janela de contribuição', () => {
  cy.get('[data-cy=contribution-modal]').should('be.visible');
});

When('eu preencho os detalhes da contribuição', () => {
  cy.get('[data-cy=pledge-amount-input]').type('100');
  cy.get('[data-cy=pledge-email-input]').type('test@example.com');
});

When('seleciono um nível de recompensa', () => {
  cy.get('[data-cy=reward-tier-1]').click();
});

When('confirmo minha transação na carteira conectada', () => {
  // Simulando confirmação da carteira (que seria uma interação externa)
  cy.window().then((win) => {
    win.localStorage.setItem('wallet_connected', 'true');
    win.localStorage.setItem('transaction_confirmed', 'true');
  });
  cy.get('[data-cy=confirm-transaction]').click();
});

Then('devo ver uma confirmação de contribuição bem-sucedida', () => {
  cy.contains('Contribuição realizada com sucesso').should('be.visible');
});

Then('devo ver minha transação registrada na blockchain', () => {
  cy.get('[data-cy=transaction-hash]').should('be.visible');
});