import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Cenário: Acessar o catálogo de programas de bem-estar
Given('que estou autenticado no sistema', () => {
  cy.visit('/login');
  cy.get('[data-cy="email"]').type('usuario@empresa.com');
  cy.get('[data-cy="password"]').type('senha123');
  cy.get('[data-cy="login-button"]').click();
  
  // Verificar se o login foi bem-sucedido
  cy.url().should('include', '/dashboard');
});

When('eu navego para a seção de Bem-Estar', () => {
  cy.visit('/wellness-programs');
});

Then('devo ver o catálogo de programas disponíveis', () => {
  cy.get('[data-cy="wellness-programs-catalog"]').should('be.visible');
});

Then('devo ver as categorias {string}, {string} e {string}', (cat1, cat2, cat3) => {
  cy.contains(cat1).should('be.visible');
  cy.contains(cat2).should('be.visible');
  cy.contains(cat3).should('be.visible');
});

Then('cada programa deve mostrar uma descrição detalhada', () => {
  cy.get('[data-cy="program-card"]').first().within(() => {
    cy.get('[data-cy="program-title"]').should('be.visible');
    cy.get('[data-cy="program-description"]').should('be.visible');
  });
});

// Cenário: Atribuir um programa de bem-estar a um colaborador
Given('que estou na seção de Bem-Estar', () => {
  cy.visit('/wellness-programs');
  cy.get('[data-cy="wellness-programs-catalog"]').should('be.visible');
});

When('eu seleciono o programa {string}', (programName) => {
  cy.contains(programName).click();
});

When('eu clico em {string}', (buttonText) => {
  cy.contains(buttonText).click();
});

Then('devo ver a lista de colaboradores com viagens agendadas', () => {
  cy.get('[data-cy="employee-list"]').should('be.visible');
  cy.get('[data-cy="employee-item"]').should('have.length.at.least', 1);
});

When('eu seleciono um colaborador da lista', () => {
  cy.get('[data-cy="employee-item"]').first().click();
});

When('eu confirmo a atribuição', () => {
  cy.get('[data-cy="confirm-assignment"]').click();
});

Then('devo ver uma mensagem de confirmação', () => {
  cy.get('[data-cy="success-message"]').should('be.visible');
});

Then('o colaborador deve receber uma notificação sobre o programa', () => {
  // Verificar na API se a notificação foi criada (mock)
  cy.contains('Notificação enviada').should('be.visible');
});

// Cenário: Acompanhar a utilização de programas de bem-estar
Given('que estou na seção de Relatórios de Bem-Estar', () => {
  cy.visit('/wellness-reports');
});

When('eu seleciono o período de análise', () => {
  cy.get('[data-cy="date-range-start"]').type('2023-01-01');
  cy.get('[data-cy="date-range-end"]').type('2023-12-31');
  cy.get('[data-cy="apply-filter"]').click();
});

Then('devo ver estatísticas de utilização dos programas', () => {
  cy.get('[data-cy="usage-statistics"]').should('be.visible');
  cy.get('[data-cy="program-usage-chart"]').should('be.visible');
});

Then('devo ver métricas de satisfação dos colaboradores', () => {
  cy.get('[data-cy="satisfaction-metrics"]').should('be.visible');
  cy.get('[data-cy="satisfaction-score"]').should('be.visible');
});

Then('devo poder exportar o relatório em formato PDF', () => {
  cy.get('[data-cy="export-pdf"]').should('be.visible');
});