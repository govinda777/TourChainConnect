import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Cenário: Iniciar uma jornada de bem-estar
Given('que estou na página inicial', () => {
  cy.visit('/');
});

When('eu clico no cartão de jornada {string}', (jornada) => {
  cy.contains(jornada).click();
});

Then('devo ser redirecionado para a página de jornada de bem-estar', () => {
  cy.url().should('include', '/journey/wellness');
  cy.contains('Jornada de Bem-Estar').should('be.visible');
});

Then('devo ver os estágios da jornada', () => {
  cy.contains('Progresso').should('be.visible');
  cy.get('[data-cy="journey-stages"]').should('be.visible');
});

// Cenário: Progredir através de uma jornada
Given('que estou em uma jornada de bem-estar', () => {
  cy.visit('/journey/wellness');
  cy.contains('Jornada de Bem-Estar').should('be.visible');
});

When('eu completo o estágio atual', () => {
  cy.get('[data-cy="current-stage-button"]').click();
});

Then('meu progresso deve ser atualizado', () => {
  cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuenow').and('not.equal', '0');
});

Then('devo ver o próximo estágio da jornada', () => {
  cy.get('[data-cy="journey-stages"]').contains('Estágio').should('be.visible');
});

// Cenário: Completar uma jornada e ser direcionado para o financiamento coletivo
Given('que estou no último estágio de uma jornada', () => {
  // Simulamos estar no último estágio ajustando o localStorage
  cy.visit('/journey/wellness');
  cy.window().then((win) => {
    // Usar sessionId do localStorage para continuar com a mesma sessão
    const journeyData = {
      id: 'test-session-id',
      type: 'wellness',
      progress: 67,
      stages: ['Estágio 1', 'Estágio 2', 'Estágio 3'],
      currentStage: 2, // último estágio (índice 2 de 3 estágios)
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      completed: false
    };
    
    win.localStorage.setItem('currentJourney', JSON.stringify(journeyData));
  });
  cy.reload();
});

When('eu completo o último estágio', () => {
  cy.get('[data-cy="current-stage-button"]').click();
});

Then('devo ver uma mensagem de parabéns', () => {
  cy.contains('Parabéns!').should('be.visible');
});

Then('devo ver um botão para apoiar o projeto', () => {
  cy.contains('Apoiar este projeto').should('be.visible');
});

When('eu clico no botão para apoiar', () => {
  cy.contains('Apoiar este projeto').click();
});

Then('devo ser redirecionado para a página de financiamento coletivo', () => {
  cy.url().should('include', '/crowdfunding');
});