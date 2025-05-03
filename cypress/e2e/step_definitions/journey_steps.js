import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Passos genéricos para todas as jornadas

Given('que estou na página inicial', () => {
  cy.visit('/');
});

When('eu clico no botão {string}', (buttonText) => {
  cy.contains('button', buttonText).click();
});

Then('devo ser redirecionado para a página de jornada', () => {
  cy.url().should('include', '/journey/');
});

Then('devo ver o título {string}', (title) => {
  cy.contains('h1', title).should('be.visible');
});

Then('devo ver a barra de progresso iniciar em {int}%', (percentage) => {
  cy.get('[data-cy=journey-progress]').should('have.attr', 'value', percentage.toString());
});

// Passos específicos para cada tipo de jornada

Given('que estou na página de jornada de bem-estar', () => {
  cy.visit('/journey/wellness');
});

Given('que estou na página de jornada de sustentabilidade', () => {
  cy.visit('/journey/sustainability');
});

Given('que estou na página de jornada de otimização de custos', () => {
  cy.visit('/journey/optimization');
});

Given('que estou na página de jornada tecnológica', () => {
  cy.visit('/journey/blockchain');
});

When('a barra de progresso atinge {int}%', (percentage) => {
  // Este passo pode precisar de um mock ou espera, pois o progresso é automático na aplicação
  cy.wait(10000); // Esperar tempo suficiente para o progresso atingir 100%
  cy.get('[data-cy=journey-progress]').should('have.attr', 'value', percentage.toString());
});

Then('devo ver a mensagem {string}', (message) => {
  cy.contains(message).should('be.visible');
});

Then('devo ver o botão {string}', (buttonText) => {
  cy.contains('button', buttonText).should('be.visible');
});

Then('devo ser redirecionado para a página de financiamento coletivo', () => {
  cy.url().should('include', '/crowdfunding');
});

// Passos para verificação de elementos específicos das jornadas

When('a jornada mostra informações sobre compensação de carbono', () => {
  cy.contains('compensação de carbono').should('be.visible');
});

Then('devo ver dados sobre tokenização de certificados de carbono', () => {
  cy.contains('certificados de carbono tokenizados').should('be.visible');
});

Then('devo ver como smart contracts validam a compensação de emissões', () => {
  cy.contains('smart contracts').should('be.visible');
  cy.contains('compensação de emissões').should('be.visible');
});

When('a jornada mostra informações sobre análise de despesas', () => {
  cy.contains('análise de despesas').should('be.visible');
});

Then('devo ver dados sobre como oracles de IA otimizam gastos', () => {
  cy.contains('oracles de IA').should('be.visible');
  cy.contains('otimização de gastos').should('be.visible');
});

Then('devo ver exemplos de economia através de smart contracts', () => {
  cy.contains('economia').should('be.visible');
  cy.contains('smart contracts').should('be.visible');
});

When('a jornada mostra informações sobre a tecnologia EVM', () => {
  cy.contains('tecnologia EVM').should('be.visible');
});

Then('devo ver informações sobre smart contracts', () => {
  cy.contains('smart contracts').should('be.visible');
});

Then('devo ver explicações sobre implementação ERC-4337', () => {
  cy.contains('ERC-4337').should('be.visible');
});

Then('devo ver como oracles conectam dados off-chain com a blockchain', () => {
  cy.contains('oracles').should('be.visible');
  cy.contains('dados off-chain').should('be.visible');
});