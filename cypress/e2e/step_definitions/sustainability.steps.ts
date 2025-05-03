import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Steps gerais de autenticação
Given('que estou logado como gerente de sustentabilidade', () => {
  // Navegar para a página de login
  cy.visit('/login');
  
  // Preencher o formulário de login como gerente de sustentabilidade
  cy.get('[data-cy=email-input]').type('sustainability@tourchain.example');
  cy.get('[data-cy=password-input]').type('securepassword');
  cy.get('[data-cy=login-button]').click();
  
  // Verificar se o login foi bem-sucedido
  cy.get('[data-cy=user-profile]').should('contain', 'Gerente de Sustentabilidade');
});

// Steps para o cenário "Visualização da pegada de carbono da empresa"
When('eu acesso o dashboard de sustentabilidade', () => {
  cy.get('[data-cy=nav-sustainability]').click();
  cy.url().should('include', '/sustainability');
  cy.get('[data-cy=sustainability-dashboard]').should('be.visible');
});

Then('eu devo ver o total de emissões de carbono da empresa', () => {
  cy.get('[data-cy=carbon-emissions-total]').should('be.visible');
  cy.get('[data-cy=carbon-emissions-total]').should('not.be.empty');
});

Then('eu devo ver um gráfico de tendência das emissões ao longo do tempo', () => {
  cy.get('[data-cy=emissions-trend-chart]').should('be.visible');
  // Verifica se o gráfico foi renderizado verificando a existência de elementos SVG
  cy.get('[data-cy=emissions-trend-chart] svg').should('exist');
});

// Steps para o cenário "Aquisição de compensações de carbono"
Given('existem {string} kg de emissões de CO2 não compensadas', (emissions) => {
  // Verifica se o valor de emissões não compensadas está correto
  cy.get('[data-cy=uncompensated-emissions]').should('contain', emissions);
});

When('eu inicio o processo de compensação de carbono', () => {
  cy.get('[data-cy=offset-carbon-button]').click();
  cy.get('[data-cy=offset-carbon-modal]').should('be.visible');
});

When('eu seleciono um projeto de reflorestamento', () => {
  cy.get('[data-cy=offset-project-list]').should('be.visible');
  cy.get('[data-cy=offset-project-item]:first').click();
  cy.get('[data-cy=offset-project-item]:first').should('have.class', 'selected');
});

When('eu confirmo a compra de créditos de carbono', () => {
  cy.get('[data-cy=confirm-offset-button]').click();
  // Simular conexão com carteira se necessário
  cy.get('[data-cy=connect-wallet-button]').then(($btn) => {
    if ($btn.is(':visible')) {
      cy.wrap($btn).click();
      cy.connectWallet();
    }
  });
  // Confirmar a transação
  cy.get('[data-cy=sign-transaction-button]').click();
});

Then('eu devo ver uma confirmação da transação na blockchain', () => {
  cy.get('[data-cy=transaction-success]', { timeout: 10000 }).should('be.visible');
  cy.get('[data-cy=transaction-hash]').should('be.visible');
});

Then('o balanço de emissões não compensadas deve ser {string} kg', (expectedEmissions) => {
  cy.get('[data-cy=uncompensated-emissions]', { timeout: 10000 })
    .should('contain', expectedEmissions);
});

// Steps para o cenário "Geração de relatório de sustentabilidade"
When('eu solicito um relatório de sustentabilidade para o último trimestre', () => {
  cy.get('[data-cy=reports-section]').click();
  cy.get('[data-cy=report-period-select]').select('last-quarter');
  cy.get('[data-cy=generate-report-button]').click();
});

Then('eu devo receber um documento com o resumo das emissões', () => {
  // Verificar se o relatório foi gerado e está disponível para download
  cy.get('[data-cy=report-download-link]', { timeout: 15000 }).should('be.visible');
  
  // Verificar o conteúdo do relatório (simulado para testes)
  cy.get('[data-cy=report-preview]').should('be.visible');
  cy.get('[data-cy=report-preview]').should('contain', 'Resumo de Emissões');
});

Then('o relatório deve incluir gráficos comparativos com trimestres anteriores', () => {
  cy.get('[data-cy=report-preview]').should('contain', 'Comparação com Trimestres Anteriores');
  cy.get('[data-cy=report-chart-comparison]').should('be.visible');
});