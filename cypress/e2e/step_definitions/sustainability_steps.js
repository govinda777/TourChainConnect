import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Cenário: Calcular pegada de carbono de viagens aéreas
Given('que estou na página da calculadora de sustentabilidade', () => {
  cy.visit('/sustainability-calculator');
});

When('eu preencho o número de voos como {string}', (numeroVoos) => {
  cy.get('[data-cy="num-flights"]').clear().type(numeroVoos);
});

When('eu preencho a distância média como {string}', (distancia) => {
  cy.get('[data-cy="avg-distance"]').clear().type(distancia);
});

When('eu seleciono a distribuição de classes como {string}', (distribuicao) => {
  // Distribuição exemplo: "70% Econômica, 20% Executiva, 10% Primeira Classe"
  // Extrair os valores usando regex
  const economyMatch = distribuicao.match(/(\d+)%\s+Econômica/);
  const businessMatch = distribuicao.match(/(\d+)%\s+Executiva/);
  const firstMatch = distribuicao.match(/(\d+)%\s+Primeira\s+Classe/);
  
  if (economyMatch) {
    cy.get('[data-cy="economy-percent"]').clear().type(economyMatch[1]);
  }
  
  if (businessMatch) {
    cy.get('[data-cy="business-percent"]').clear().type(businessMatch[1]);
  }
  
  if (firstMatch) {
    cy.get('[data-cy="first-percent"]').clear().type(firstMatch[1]);
  }
});

When('eu clico em calcular', () => {
  cy.get('[data-cy="calculate-button"]').click();
});

Then('devo ver o resultado da pegada de carbono', () => {
  cy.get('[data-cy="carbon-result"]').should('be.visible');
  cy.get('[data-cy="carbon-result"]').should('not.be.empty');
});

Then('devo ver a equivalência em carros por ano', () => {
  cy.get('[data-cy="car-equivalent"]').should('be.visible');
  cy.get('[data-cy="car-equivalent"]').should('not.be.empty');
});

Then('devo ver o custo estimado de compensação', () => {
  cy.get('[data-cy="offset-cost"]').should('be.visible');
  cy.get('[data-cy="offset-cost"]').should('not.be.empty');
});

// Cenário: Obter certificação de sustentabilidade
When('eu calculo a pegada de carbono da minha empresa', () => {
  cy.get('[data-cy="num-flights"]').clear().type('50');
  cy.get('[data-cy="avg-distance"]').clear().type('3000');
  cy.get('[data-cy="economy-percent"]').clear().type('80');
  cy.get('[data-cy="business-percent"]').clear().type('15');
  cy.get('[data-cy="first-percent"]').clear().type('5');
  cy.get('[data-cy="calculate-button"]').click();
});

When('eu clico em {string}', (botaoTexto) => {
  cy.contains(botaoTexto).click();
});

Then('devo ver o formulário de compensação', () => {
  cy.get('[data-cy="offset-form"]').should('be.visible');
});

When('eu preencho os dados da empresa', () => {
  cy.get('[data-cy="company-name"]').type('Empresa Teste');
  cy.get('[data-cy="company-email"]').type('teste@empresa.com');
  cy.get('[data-cy="company-phone"]').type('11999998888');
});

When('eu seleciono o projeto de compensação', () => {
  cy.get('[data-cy="offset-project"]').select('Reflorestamento da Amazônia');
});

When('eu confirmo o pagamento', () => {
  cy.get('[data-cy="payment-method"]').select('Cartão de Crédito');
  cy.get('[data-cy="card-number"]').type('4111111111111111');
  cy.get('[data-cy="card-expiry"]').type('12/30');
  cy.get('[data-cy="card-cvv"]').type('123');
  cy.get('[data-cy="confirm-payment"]').click();
});

Then('devo ver a confirmação da certificação {string}', (certificacao) => {
  cy.contains(certificacao).should('be.visible');
  cy.get('[data-cy="certification-confirmation"]').should('be.visible');
});

Then('devo poder baixar o certificado em PDF', () => {
  cy.get('[data-cy="download-certificate"]').should('be.visible');
  cy.get('[data-cy="download-certificate"]').should('not.be.disabled');
});