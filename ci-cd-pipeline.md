# Pipeline de CI/CD para Testes E2E

Este documento descreve a configuração e execução da pipeline de CI/CD para testes end-to-end (E2E) no projeto.

## Estrutura de Arquivos

- `cypress/`: Diretório principal dos testes E2E
  - `e2e/features/`: Arquivos de feature (especificações em formato Gherkin)
  - `e2e/step_definitions/`: Implementações dos passos de teste
  - `support/`: Arquivos de suporte, comandos personalizados e configurações
  - `logs/`: Logs de execução dos testes
  - `results/`: Resultados dos testes em formato JSON
  - `reports/`: Relatórios HTML gerados a partir dos resultados
  - `screenshots/`: Capturas de tela em caso de falha
  - `videos/`: Vídeos da execução dos testes

- `scripts/`: Scripts para automação da pipeline
  - `run-e2e-tests.js`: Script para execução dos testes E2E
  - `generate-test-report.js`: Script para geração de relatórios HTML
  - `run-e2e-workflow.sh`: Script shell para coordenar a execução do workflow

## Frameworks e Ferramentas

- **Cypress**: Framework de testes E2E
- **Cucumber**: Framework de BDD para escrita de testes em linguagem natural
- **Cypress Cucumber Preprocessor**: Integração entre Cypress e Cucumber

## Pipeline de Execução

1. **Preparação do Ambiente**
   - Criação/limpeza de diretórios de logs, resultados, relatórios, screenshots e vídeos
   - Configuração do ambiente de teste

2. **Execução dos Testes**
   - Inicialização do servidor de aplicação
   - Execução dos testes Cypress
   - Captura de logs, screenshots e vídeos

3. **Geração de Relatórios**
   - Processamento dos resultados JSON
   - Geração de relatório HTML

4. **Finalização**
   - Encerramento do servidor
   - Exibição do sumário de execução

## Como Executar os Testes

### Execução Manual

Para executar os testes manualmente durante o desenvolvimento:

```bash
# Execução interativa dos testes (com interface gráfica do Cypress)
npm run test:e2e

# Execução em modo headless (sem interface gráfica)
npx cypress run
```

### Execução na Pipeline CI/CD

Para executar os testes na pipeline CI/CD do Replit:

1. Inicie o workflow "E2E Tests" pelo painel de workflows
2. Ou execute o script shell diretamente:

```bash
./scripts/run-e2e-workflow.sh
```

## Relatórios de Teste

Após a execução dos testes, os relatórios são gerados em:

- **Relatórios HTML**: `cypress/reports/report-YYYY-MM-DD.html`
- **Vídeos**: `cypress/videos/`
- **Screenshots de falhas**: `cypress/screenshots/`
- **Logs**: `cypress/logs/workflow.log`

## Troubleshooting

### Problemas Comuns

1. **Servidor não inicializa**
   - Verifique se a porta 5000 está disponível
   - Verifique os logs em `cypress/logs/server.log`

2. **Erros de Tipo no Cypress**
   - Os erros de tipo não impedem a execução dos testes
   - Para corrigir, ajuste os arquivos de definição de tipos em `cypress/support/`

3. **Falha na Conexão com o Servidor**
   - O script aguarda até 60 segundos pela inicialização do servidor
   - Verifique se o servidor está respondendo em `http://localhost:5000`

## Integração Contínua

Este projeto está configurado para executar testes E2E automaticamente em:

1. **Pull Requests**: A cada PR, os testes são executados para validar as alterações
2. **Deploy**: Antes de cada deploy para produção, os testes são executados para validar a build

## Manutenção

Para manter os testes E2E atualizados:

1. Adicione novos arquivos de feature em `cypress/e2e/features/`
2. Implemente os passos em `cypress/e2e/step_definitions/`
3. Adicione comandos personalizados em `cypress/support/commands.ts`
4. Atualize as definições de tipos em `cypress/support/index.d.ts`