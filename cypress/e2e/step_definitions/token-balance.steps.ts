import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Steps para o cenário "Visualizar saldo de tokens"
Given('que estou conectado com minha carteira', () => {
  // Usar o comando personalizado para conectar a carteira
  cy.connectWallet();
});

When('eu acesso a página principal', () => {
  cy.visit('/');
  // Garante que a página foi carregada completamente
  cy.get('[data-cy=header]').should('be.visible');
});

Then('eu devo ver meu saldo atual de tokens TOUR', () => {
  // Verifica se o componente de exibição do saldo está visível
  cy.get('[data-cy=token-balance]').should('be.visible');
  // Verifica se o saldo não está vazio
  cy.get('[data-cy=token-balance-amount]').should('not.be.empty');
});

// Steps para o cenário "Atualização do saldo após uma transação"
Given('eu tenho um saldo inicial de {string} tokens', (amount) => {
  // Simula um saldo inicial usando o comando personalizado
  cy.mockTokenBalance(amount);
  // Verifica se o saldo foi definido corretamente
  cy.get('[data-cy=token-balance-amount]').should('contain', amount);
});

When('eu faço uma contribuição de {string} tokens', (amount) => {
  // Simula o preenchimento do valor da contribuição
  cy.get('[data-cy=contribution-input]').type(amount);
  // Clica no botão de contribuir
  cy.get('[data-cy=contribute-button]').click();
  // Aguarda a confirmação da transação
  cy.get('[data-cy=transaction-confirmation]', { timeout: 10000 }).should('be.visible');
});

Then('meu saldo deve ser atualizado para {string} tokens', (expectedAmount) => {
  // Verifica se o saldo foi atualizado para o valor esperado
  cy.get('[data-cy=token-balance-amount]', { timeout: 5000 })
    .should('contain', expectedAmount);
});

Then('devo ver uma confirmação da transação', () => {
  // Verifica se a mensagem de confirmação está visível
  cy.get('[data-cy=transaction-confirmation]').should('be.visible');
  // Verifica se a mensagem contém texto de sucesso
  cy.get('[data-cy=transaction-confirmation]').should('contain', 'Transação concluída com sucesso');
});