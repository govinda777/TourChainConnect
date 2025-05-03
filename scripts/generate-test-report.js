#!/usr/bin/env node

/**
 * Script para gerar relatórios dos testes e2e
 * Este script processa os resultados dos testes e gera um relatório HTML
 */

const fs = require('fs');
const path = require('path');

function generateReport() {
  const reportsDir = path.join(process.cwd(), 'cypress/reports');
  const resultsDir = path.join(process.cwd(), 'cypress/results');
  
  // Garantir que o diretório de relatórios exista
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  console.log('Gerando relatório HTML dos testes...');
  
  try {
    // Verificar se existem resultados de testes
    if (!fs.existsSync(resultsDir)) {
      console.error('Nenhum resultado de teste encontrado!');
      return;
    }
    
    // Ler os arquivos de resultados JSON
    const resultFiles = fs.readdirSync(resultsDir).filter(file => file.endsWith('.json'));
    
    if (resultFiles.length === 0) {
      console.error('Nenhum arquivo de resultado encontrado!');
      return;
    }
    
    // Processar resultados
    const results = [];
    let totalTests = 0;
    let passedTests = 0;
    
    resultFiles.forEach(file => {
      const filePath = path.join(resultsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      results.push({
        name: data.title || file.replace('.json', ''),
        total: data.tests || 0,
        passed: data.passes || 0,
        failed: data.failures || 0,
        duration: data.duration || 0
      });
      
      totalTests += data.tests || 0;
      passedTests += data.passes || 0;
    });
    
    // Gerar HTML
    const percentagePassed = totalTests > 0 ? Math.floor((passedTests / totalTests) * 100) : 0;
    const reportDate = new Date().toISOString().split('T')[0];
    
    let html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Testes E2E - ${reportDate}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; color: #333; }
        h1, h2 { color: #2c3e50; }
        .summary { background-color: #f8f9fa; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        .summary-item { display: inline-block; margin-right: 30px; }
        .summary-label { font-weight: bold; margin-right: 5px; }
        .progress-bar { height: 20px; background-color: #e9ecef; border-radius: 4px; margin-bottom: 20px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background-color: #4CAF50; transition: width 0.3s ease; }
        .progress-bar-text { text-align: center; margin-top: 5px; font-weight: bold; }
        .features { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .feature-card { border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; background-color: white; }
        .feature-header { display: flex; justify-content: space-between; align-items: center; }
        .feature-title { margin: 0; font-size: 18px; }
        .feature-result { padding: 3px 8px; border-radius: 3px; font-size: 14px; font-weight: bold; }
        .passed { background-color: #d4edda; color: #155724; }
        .failed { background-color: #f8d7da; color: #721c24; }
        .mixed { background-color: #fff3cd; color: #856404; }
        .feature-stats { margin-top: 10px; font-size: 14px; color: #6c757d; }
      </style>
    </head>
    <body>
      <h1>Relatório de Testes E2E</h1>
      <p>Data do relatório: ${reportDate}</p>
      
      <div class="summary">
        <div class="summary-item"><span class="summary-label">Total de Testes:</span> ${totalTests}</div>
        <div class="summary-item"><span class="summary-label">Testes Passados:</span> ${passedTests}</div>
        <div class="summary-item"><span class="summary-label">Testes Falhos:</span> ${totalTests - passedTests}</div>
        <div class="summary-item"><span class="summary-label">Taxa de Sucesso:</span> ${percentagePassed}%</div>
      </div>
      
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${percentagePassed}%"></div>
      </div>
      <div class="progress-bar-text">${percentagePassed}% dos testes passaram</div>
      
      <h2>Resultados por Feature</h2>
      <div class="features">
    `;
    
    results.forEach(result => {
      const isAllPassed = result.failed === 0 && result.total > 0;
      const isFailed = result.failed > 0;
      const status = isAllPassed ? 'passed' : (isFailed ? 'failed' : 'mixed');
      const statusText = isAllPassed ? 'PASSOU' : (isFailed ? 'FALHOU' : 'MISTO');
      
      html += `
        <div class="feature-card">
          <div class="feature-header">
            <h3 class="feature-title">${result.name}</h3>
            <span class="feature-result ${status}">${statusText}</span>
          </div>
          <div class="feature-stats">
            <div>Total: ${result.total} testes</div>
            <div>Passados: ${result.passed} testes</div>
            <div>Falhos: ${result.failed} testes</div>
            <div>Duração: ${Math.round(result.duration / 1000)} segundos</div>
          </div>
        </div>
      `;
    });
    
    html += `
      </div>
    </body>
    </html>
    `;
    
    // Salvar o relatório
    const reportPath = path.join(reportsDir, `report-${reportDate}.html`);
    fs.writeFileSync(reportPath, html);
    
    console.log(`Relatório gerado com sucesso: ${reportPath}`);
  } catch (error) {
    console.error(`Erro ao gerar relatório: ${error.message}`);
  }
}

// Executar a função principal
generateReport();