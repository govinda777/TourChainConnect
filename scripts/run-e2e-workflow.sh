#!/bin/bash

# Script para executar o workflow de testes E2E

# Definir diretórios
CYPRESS_DIR="cypress"
LOGS_DIR="${CYPRESS_DIR}/logs"
RESULTS_DIR="${CYPRESS_DIR}/results"
REPORTS_DIR="${CYPRESS_DIR}/reports"
SCREENSHOTS_DIR="${CYPRESS_DIR}/screenshots"
VIDEOS_DIR="${CYPRESS_DIR}/videos"

# Limpar diretórios de resultados anteriores
echo "Limpando resultados anteriores..."
rm -rf ${RESULTS_DIR}/* ${REPORTS_DIR}/* ${SCREENSHOTS_DIR}/* ${VIDEOS_DIR}/*

# Criar diretórios necessários
mkdir -p ${LOGS_DIR} ${RESULTS_DIR} ${REPORTS_DIR} ${SCREENSHOTS_DIR} ${VIDEOS_DIR}

# Configurar execução dos testes
echo "Preparando ambiente para testes E2E..."
echo "Iniciando em: $(date)"
echo "Logs serão salvos em ${LOGS_DIR}/workflow.log"

# Executar os testes usando os scripts ES Modules
echo "Executando testes E2E..."
node scripts/run-e2e-tests.js 2>&1 | tee ${LOGS_DIR}/workflow.log

# Resultado da execução
TEST_RESULT=$?

# Gerar relatório dos testes
echo "Gerando relatório dos testes..."
node scripts/generate-test-report.js 2>&1 | tee -a ${LOGS_DIR}/workflow.log

# Resumo da execução
echo "============================================="
echo "Sumário da execução de testes E2E"
echo "Data/Hora: $(date)"
echo "Resultado: $([ $TEST_RESULT -eq 0 ] && echo 'SUCESSO' || echo 'FALHA')"
echo "Relatório disponível em: ${REPORTS_DIR}"
echo "Vídeos disponíveis em: ${VIDEOS_DIR}"
echo "Screenshots disponíveis em: ${SCREENSHOTS_DIR}"
echo "============================================="

echo "Processo de testes E2E concluído!"

# Retornar o código de saída dos testes
exit $TEST_RESULT