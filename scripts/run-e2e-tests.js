#!/usr/bin/env node

/**
 * Script para execução dos testes e2e no ambiente de CI/CD
 * Este script inicia o servidor, executa os testes e encerra o servidor
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Função para garantir que o diretório de logs exista
function ensureLogDir() {
  const logDir = path.join(process.cwd(), 'cypress/logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`Diretório de logs criado em: ${logDir}`);
  }
  return logDir;
}

// Função para iniciar o servidor de aplicação
function startServer() {
  console.log('Iniciando servidor de aplicação para testes...');
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, CI: 'true' }
  });

  // Capturar logs do servidor
  const logDir = ensureLogDir();
  const serverLogPath = path.join(logDir, 'server.log');
  const serverLogStream = fs.createWriteStream(serverLogPath);
  
  server.stdout.pipe(serverLogStream);
  server.stderr.pipe(serverLogStream);

  server.stdout.on('data', (data) => {
    console.log(`[Servidor]: ${data.toString().trim()}`);
  });

  server.stderr.on('data', (data) => {
    console.error(`[Erro Servidor]: ${data.toString().trim()}`);
  });

  // Retornar o processo do servidor para poder encerrá-lo depois
  return server;
}

// Função para aguardar o servidor estar pronto
function waitForServer(url, timeout = 60000) {
  console.log(`Aguardando servidor em ${url}...`);
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkServer = () => {
      const http = require('http');
      const req = http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`Servidor está pronto em ${url}`);
          resolve();
        } else {
          retry();
        }
      });
      
      req.on('error', (error) => {
        retry();
      });
      
      req.end();
    };
    
    const retry = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout esperando pelo servidor em ${url}`));
      } else {
        setTimeout(checkServer, 1000);
      }
    };
    
    checkServer();
  });
}

// Função para executar os testes e2e
function runE2ETests() {
  console.log('Executando testes e2e...');
  
  return new Promise((resolve, reject) => {
    const tests = spawn('npx', ['cypress', 'run', '--config', 'video=true'], {
      stdio: 'inherit',
      shell: true
    });

    tests.on('close', (code) => {
      if (code === 0) {
        console.log('Testes e2e executados com sucesso!');
        resolve(code);
      } else {
        console.error(`Falha na execução dos testes e2e. Código de saída: ${code}`);
        reject(code);
      }
    });
  });
}

// Função principal
async function main() {
  let server;
  
  try {
    // Garantir que o diretório de logs exista
    ensureLogDir();
    
    // Iniciar o servidor
    server = startServer();
    
    // Aguardar o servidor estar pronto
    await waitForServer('http://localhost:5000', 60000);
    
    console.log('Servidor iniciado e respondendo. Iniciando testes...');
    
    // Executar os testes
    await runE2ETests();
    console.log('Processo de testes concluído com sucesso');
    process.exitCode = 0;
  } catch (error) {
    console.error(`Erro durante o processo de teste: ${error}`);
    process.exitCode = 1;
  } finally {
    // Encerrar o servidor em todos os casos
    if (server) {
      console.log('Encerrando servidor...');
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${server.pid} /F /T`);
      } else {
        server.kill('SIGTERM');
      }
    }
  }
}

// Executar função principal
main();