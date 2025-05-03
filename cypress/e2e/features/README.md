# Testes E2E com Cucumber e Cypress

Este diretório contém os testes end-to-end (E2E) do projeto, escritos usando a sintaxe Gherkin (Cucumber) e executados com o Cypress.

## Estrutura

- `features/`: Arquivos `.feature` contendo as especificações dos testes em linguagem Gherkin
- `step_definitions/`: Implementação dos passos descritos nos arquivos `.feature`

## Como Criar um Novo Teste

### 1. Crie um arquivo .feature

Os arquivos `.feature` descrevem os cenários de teste em linguagem natural. Eles devem ser criados no diretório `cypress/e2e/features/`.

Exemplo (`token-balance.feature`):

```gherkin
Feature: Token Balance
  Como um usuário do TourChain
  Eu quero visualizar meu saldo de tokens TOUR
  Para que eu possa acompanhar minhas finanças

  Scenario: Visualizar saldo de tokens
    Given que estou conectado com minha carteira
    When eu acesso a página do meu perfil
    Then eu devo ver meu saldo atual de tokens TOUR

  Scenario: Atualização do saldo após uma transação
    Given que estou conectado com minha carteira
    And eu tenho um saldo inicial de "100" tokens
    When eu recebo "50" tokens adicionais
    Then meu saldo deve ser atualizado para "150" tokens
```

### 2. Implemente os Steps

Os steps são implementados em arquivos JavaScript/TypeScript no diretório `cypress/e2e/step_definitions/`.

Exemplo (`token-balance.steps.ts`):

```typescript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Passos para o cenário "Visualizar saldo de tokens"
Given('que estou conectado com minha carteira', () => {
  cy.connectWallet();
});

When('eu acesso a página do meu perfil', () => {
  cy.visit('/profile');
});

Then('eu devo ver meu saldo atual de tokens TOUR', () => {
  cy.get('[data-cy=token-balance]').should('be.visible');
});

// Passos para o cenário "Atualização do saldo após uma transação"
Given('eu tenho um saldo inicial de {string} tokens', (amount) => {
  cy.mockTokenBalance(amount);
});

When('eu recebo {string} tokens adicionais', (amount) => {
  // Simula o recebimento de tokens
  cy.window().then((win) => {
    win.dispatchEvent(
      new CustomEvent('tokenReceived', { detail: { amount } })
    );
  });
});

Then('meu saldo deve ser atualizado para {string} tokens', (expectedAmount) => {
  cy.get('[data-cy=token-balance]')
    .should('contain', expectedAmount);
});
```

### 3. Use os Comandos Personalizados

Foram criados comandos personalizados para ajudar na escrita dos testes:

- `cy.dataCy()`: Seleciona elementos pelo atributo `data-cy`
- `cy.connectWallet()`: Simula a conexão de uma carteira
- `cy.mockTokenBalance()`: Simula um saldo de tokens

### 4. Execute os Testes

Durante o desenvolvimento, você pode executar os testes interativamente:

```bash
npx cypress open
```

## Boas Práticas

1. **Use Tags**: Adicione tags aos seus cenários para permitir a execução seletiva

   ```gherkin
   @blockchain @tokens
   Scenario: Visualizar saldo de tokens
   ```

2. **Isole os Testes**: Cada cenário deve ser independente e não depender de outros

3. **Use Hooks**: Para configuração e limpeza antes/depois dos testes

   ```typescript
   // Em um arquivo como cypress/support/e2e.ts
   beforeEach(() => {
     // Configuração antes de cada teste
     cy.clearLocalStorage();
   });
   ```

4. **Prepare Dados de Teste**: Use os hooks ou os comandos `Given` para preparar os dados necessários para o teste

5. **Teste Visual e Funcional**: Verifique tanto a aparência quanto o comportamento funcional da aplicação