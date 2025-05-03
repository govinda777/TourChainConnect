import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Cenário: Análise de despesas de viagens
Given('que estou autenticado no sistema', () => {
  cy.visit('/login');
  cy.get('[data-cy="email"]').type('usuario@empresa.com');
  cy.get('[data-cy="password"]').type('senha123');
  cy.get('[data-cy="login-button"]').click();
  
  // Verificar se o login foi bem-sucedido
  cy.url().should('include', '/dashboard');
});

When('eu acesso o dashboard de Otimização de Despesas', () => {
  cy.visit('/ai-expense-optimization');
});

Then('devo ver um resumo das despesas recentes', () => {
  cy.get('[data-cy="expenses-summary"]').should('be.visible');
});

Then('devo ver gráficos comparativos por categoria', () => {
  cy.get('[data-cy="category-charts"]').should('be.visible');
  cy.get('[data-cy="category-charts"] .recharts-wrapper').should('have.length.at.least', 1);
});

Then('devo ver indicadores de tendência de gastos', () => {
  cy.get('[data-cy="spending-trends"]').should('be.visible');
});

// Cenário: Receber recomendações de economia da IA
Given('que estou visualizando o dashboard de Otimização de Despesas', () => {
  cy.visit('/ai-expense-optimization');
  cy.get('[data-cy="expenses-summary"]').should('be.visible');
});

When('eu clico em {string}', (botaoTexto) => {
  cy.contains(botaoTexto).click();
});

Then('o sistema deve processar os dados históricos', () => {
  // Verificando se a animação de processamento está visível
  cy.get('[data-cy="ai-processing"]').should('be.visible');
  // Aguardar o processamento terminar (com timeout de 10 segundos)
  cy.get('[data-cy="ai-processing"]', { timeout: 10000 }).should('not.exist');
});

Then('devo receber uma lista de recomendações personalizadas', () => {
  cy.get('[data-cy="recommendations-list"]').should('be.visible');
  cy.get('[data-cy="recommendation-item"]').should('have.length.at.least', 1);
});

Then('cada recomendação deve mostrar a potencial economia estimada', () => {
  cy.get('[data-cy="recommendation-item"]').first().within(() => {
    cy.get('[data-cy="potential-savings"]').should('be.visible');
    cy.get('[data-cy="potential-savings"]').should('not.be.empty');
  });
});

// Cenário: Utilizar o sistema de gamificação para economia
Given('que estou na seção de Gamificação de Economia', () => {
  cy.visit('/gamification');
});

When('eu visualizo as metas de economia para minha empresa', () => {
  cy.get('[data-cy="savings-goals"]').should('be.visible');
});

Then('devo ver o ranking dos colaboradores mais econômicos', () => {
  cy.get('[data-cy="savings-leaderboard"]').should('be.visible');
  cy.get('[data-cy="leaderboard-item"]').should('have.length.at.least', 1);
});

Then('devo ver as recompensas disponíveis por atingir metas', () => {
  cy.get('[data-cy="available-rewards"]').should('be.visible');
});

Then('devo poder configurar um novo desafio para minha equipe', () => {
  cy.get('[data-cy="challenge-form"]').should('be.visible');
});

Then('devo poder definir as regras e recompensas do desafio', () => {
  cy.get('[data-cy="challenge-rules"]').should('be.visible');
  cy.get('[data-cy="challenge-rewards"]').should('be.visible');
});