import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Cenário: Visualizar detalhes da campanha de financiamento
Given('que estou na página de financiamento coletivo', () => {
  cy.visit('/crowdfunding');
});

Then('devo ver o título da campanha', () => {
  cy.contains('O futuro das viagens corporativas').should('be.visible');
});

Then('devo ver o progresso da arrecadação', () => {
  cy.get('[data-cy="campaign-percentage"]').should('be.visible');
});

Then('devo ver o número de apoiadores', () => {
  cy.get('[data-cy="campaign-backers"]').should('be.visible');
});

Then('devo ver as recompensas disponíveis', () => {
  cy.contains('Recompensas').should('be.visible');
  cy.get('[data-cy="reward-cards"]').should('be.visible');
});

// Cenário: Fazer uma contribuição anônima
When('eu clico no botão {string}', (buttonText) => {
  cy.contains(buttonText).click();
});

Then('devo ver o diálogo de apoio', () => {
  cy.get('[data-cy="support-dialog"]').should('be.visible');
});

When('eu preencho o valor da contribuição', () => {
  cy.get('[data-cy="pledge-amount"]').type('100');
});

When('eu marco a opção de contribuição anônima', () => {
  cy.get('[data-cy="anonymous-checkbox"]').click();
});

When('eu preencho o email {string}', (email) => {
  cy.get('[data-cy="pledge-email"]').type(email);
});

When('eu submeto o formulário', () => {
  cy.get('[data-cy="submit-pledge"]').click();
});

Then('devo ver uma mensagem de agradecimento', () => {
  cy.contains('Obrigado pelo seu apoio!').should('be.visible');
});

Then('a contribuição deve aparecer como anônima na lista de apoiadores', () => {
  cy.contains('Apoiador Anônimo').should('be.visible');
});

// Cenário: Escolher uma recompensa específica
When('eu clico no botão {string} de uma recompensa', (buttonText) => {
  cy.get('[data-cy="reward-cards"]').contains(buttonText).first().click();
});

Then('devo ver o diálogo de apoio com o valor pré-preenchido', () => {
  cy.get('[data-cy="support-dialog"]').should('be.visible');
  cy.get('[data-cy="pledge-amount"]').should('have.value');
});

When('eu preencho meu nome como {string}', (name) => {
  cy.get('[data-cy="pledge-name"]').type(name);
});

When('eu adiciono um comentário {string}', (comment) => {
  cy.get('[data-cy="pledge-comment"]').type(comment);
});

Then('devo ver uma mensagem de sucesso', () => {
  cy.contains('Pagamento processado com sucesso!').should('be.visible');
});

Then('minha contribuição deve aparecer na lista de apoiadores', () => {
  cy.contains('João Silva').should('be.visible');
});