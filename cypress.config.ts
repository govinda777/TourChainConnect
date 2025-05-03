import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import webpack from '@cypress/webpack-preprocessor';
import fs from 'fs';
import path from 'path';

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  // This is required for the preprocessor to be able to generate JSON reports after each run
  await addCucumberPreprocessorPlugin(on, config);

  // Configure o webpack preprocessor
  on(
    'file:preprocessor',
    webpack({
      webpackOptions: {
        resolve: {
          extensions: ['.ts', '.js'],
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env', '@babel/preset-typescript'],
                  },
                },
              ],
            },
            {
              test: /\.feature$/,
              use: [
                {
                  loader: '@badeball/cypress-cucumber-preprocessor/webpack',
                  options: config,
                },
              ],
            },
          ],
        },
      },
    })
  );

  // Evento após a execução do teste para salvar resultados em JSON
  on('after:spec', (spec, results) => {
    // Crie o diretório de resultados se não existir
    const resultsDir = path.join(process.cwd(), 'cypress/results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Salve o resultado do teste como JSON
    const resultPath = path.join(
      resultsDir,
      `result-${path.basename(spec.name, path.extname(spec.name))}.json`
    );
    
    // Filtrar apenas as informações relevantes para o relatório
    const summary = {
      title: spec.name,
      tests: results.stats.tests,
      passes: results.stats.passes,
      failures: results.stats.failures,
      pending: results.stats.pending,
      duration: results.stats.duration,
      screenshots: results.screenshots || [],
      video: results.video,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(resultPath, JSON.stringify(summary, null, 2));
    console.log(`Resultado do teste salvo em: ${resultPath}`);
  });

  // Evento após a execução de todos os testes para fazer um log do sumário
  on('after:run', (results) => {
    if (results && 'totalTests' in results) {
      console.log('======= Sumário de Execução dos Testes =======');
      console.log(`Total de testes: ${results.totalTests || 0}`);
      console.log(`Testes passados: ${results.totalPassed || 0}`);
      console.log(`Testes falhos: ${results.totalFailed || 0}`);
      console.log(`Duração total: ${results.totalDuration || 0}ms`);
      console.log('=============================================');
    } else {
      console.log('======= Sumário de Execução dos Testes =======');
      console.log('Não foi possível obter estatísticas detalhadas');
      console.log('=============================================');
    }
    
    // Salve o sumário geral
    const resultsDir = path.join(process.cwd(), 'cypress/results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const summary = {
      timestamp: new Date().toISOString(),
      success: results && 'totalFailed' in results ? results.totalFailed === 0 : false,
      stats: {
        tests: results && 'totalTests' in results ? results.totalTests : 0,
        passes: results && 'totalPassed' in results ? results.totalPassed : 0,
        failures: results && 'totalFailed' in results ? results.totalFailed : 0,
        duration: results && 'totalDuration' in results ? results.totalDuration : 0
      }
    };
    
    const summaryPath = path.join(resultsDir, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  });

  // Make sure to return the config object as it might have been modified by the plugin.
  return config;
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    specPattern: 'cypress/e2e/features/**/*.feature',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents,
    // Configurações para CI
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    // Diretórios personalizados
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
  },
  // Configurações de viewport
  viewportWidth: 1280,
  viewportHeight: 720,
  // Configurações para execução em ambiente CI
  defaultCommandTimeout: 10000,
  execTimeout: 60000,
  taskTimeout: 60000,
  pageLoadTimeout: 30000,
  requestTimeout: 10000,
  responseTimeout: 30000,
});