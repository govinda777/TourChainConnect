// Import commands.js using ES2015 syntax:
import './commands';

// Import Cypress localStorage commands
import 'cypress-localstorage-commands';

// Prevent TypeScript errors
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<Element>;
    }
  }
}

// Alternatively you can use CommonJS syntax:
// require('./commands')