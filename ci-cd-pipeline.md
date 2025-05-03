# Pipeline CI/CD para Testes E2E

Este documento descreve a configuração da pipeline de integração contínua (CI) e entrega contínua (CD) para execução de testes end-to-end (E2E) no projeto TourChain.

## Visão Geral

A pipeline de CI/CD é responsável por:

1. Executar testes E2E automaticamente
2. Gerar relatórios de resultados
3. Validar a qualidade do código a cada commit ou pull request

## Tecnologias Utilizadas

- **Cypress**: Framework de testes E2E
- **Cucumber/Gherkin**: Sintaxe para escrita de testes BDD (Behavior-Driven Development)
- **GitHub Actions**: Ambiente de execução da pipeline CI/CD

## Estrutura dos Testes

```
cypress/
├── e2e/
│   ├── features/          # Arquivos .feature com cenários de teste em Gherkin
│   └── step_definitions/  # Implementação dos passos em TypeScript
├── fixtures/              # Dados fixos para mock em testes
├── plugins/               # Plugins do Cypress
├── results/               # Resultados dos testes (JSON)
├── reports/               # Relatórios gerados dos testes (HTML)
└── support/               # Comandos e utilitários personalizados
```

## Scripts de Automação

### Execução de Todos os Testes

Para executar todos os testes E2E:

```bash
./scripts/run-e2e-workflow.sh
```

Este script:
1. Prepara o ambiente para os testes
2. Inicia o servidor da aplicação
3. Executa os testes Cypress
4. Gera relatórios HTML dos resultados
5. Encerra o servidor da aplicação

### Execução Seletiva de Testes

Para executar apenas testes com tags específicas:

```bash
node scripts/run-tests-by-tag.js --tags @blockchain,@sustainability
```

As tags disponíveis incluem:
- `@blockchain`: Testes relacionados à integração com blockchain
- `@tokens`: Testes relacionados ao token TOUR
- `@sustainability`: Testes de funcionalidades de sustentabilidade
- `@metrics`: Testes de métricas e estatísticas
- `@offsets`: Testes de compensação de carbono
- `@reporting`: Testes de geração de relatórios

## Configuração da Pipeline CI/CD no GitHub Actions

O arquivo `.github/workflows/smart-contracts.yml` configura a execução automatizada de testes na pipeline CI/CD.

```yaml
name: Smart Contracts CI

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run E2E tests
        run: ./scripts/run-e2e-workflow.sh
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            cypress/reports
            cypress/videos
            cypress/screenshots
        if: always()
```

## Análise de Resultados

Após a execução dos testes na pipeline CI/CD:

1. Acesse os artefatos gerados na interface do GitHub Actions
2. Consulte os relatórios HTML para visualizar os resultados detalhados
3. Analise vídeos e screenshots em caso de falhas para identificar problemas

## Práticas Recomendadas

1. **Manutenção dos Testes**: Mantenha os testes atualizados conforme a aplicação evolui
2. **Evite Testes Flaky**: Implemente esperas explícitas e corretamente configuradas
3. **Mantenha Independência**: Cada teste deve ser independente e não depender de outros
4. **Use Tags Estrategicamente**: Organize seus testes com tags para facilitar execuções seletivas
5. **Investigação de Falhas**: Utilize vídeos e screenshots para identificar problemas

## Resolução de Problemas

### Falhas Comuns na Pipeline

1. **Timeouts**: Verifique se os tempos de espera estão adequados e se a aplicação está funcionando corretamente
2. **Elementos Não Encontrados**: Atualize os seletores ou use estratégias mais robustas de seleção
3. **Erros de Conexão**: Verifique se a aplicação está sendo iniciada corretamente

### Depuração Local

Para depurar localmente antes de enviar para a pipeline:

```bash
npx cypress open
```

Isso abrirá a interface gráfica do Cypress, permitindo executar e depurar testes interativamente.

## Próximos Passos

- Implementar testes de acessibilidade
- Adicionar análise de cobertura de código aos testes E2E
- Integrar com ferramentas de análise de performance