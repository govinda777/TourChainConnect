#!/bin/bash

# Script para executar o workflow de testes E2E

# Criar diretórios necessários
mkdir -p cypress/logs cypress/results cypress/reports

# Executar o workflow "E2E Tests"
echo "Executando workflow de testes E2E..."
echo "Logs serão salvos em cypress/logs/workflow.log"

# Usar o workflow atual mas com nosso script personalizado
node scripts/run-e2e-tests.js 2>&1 | tee cypress/logs/workflow.log

# Gerar relatório
echo "Gerando relatório dos testes..."
node scripts/generate-test-report.js

echo "Processo de testes E2E concluído!"