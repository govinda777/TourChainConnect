import * as fs from 'fs';
import * as path from 'path';

/**
 * Salva as informações de implantação dos contratos para uso no processo de CI/CD e verificação
 * @param deployment Objeto com os endereços dos contratos implantados
 */
export function saveDeployment(deployment: Record<string, string>) {
  const deploymentPath = path.resolve(__dirname, '../../deployed-contracts.json');
  
  // Se o arquivo já existir, combina com as informações anteriores
  let existingDeployment: Record<string, string> = {};
  if (fs.existsSync(deploymentPath)) {
    try {
      const existingContent = fs.readFileSync(deploymentPath, 'utf8');
      existingDeployment = JSON.parse(existingContent);
    } catch (error) {
      console.error("Erro ao ler o arquivo de implantação existente:", error);
    }
  }

  // Combina as informações de implantação antigas com as novas
  const combinedDeployment = { ...existingDeployment, ...deployment };

  // Adiciona timestamp da implantação
  combinedDeployment.deploymentTimestamp = new Date().toISOString();
  combinedDeployment.chainId = process.env.HARDHAT_NETWORK || 'unknown';

  // Salva o arquivo
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(combinedDeployment, null, 2),
    'utf8'
  );

  console.log('Informações de implantação salvas em:', deploymentPath);
  console.log('Contratos implantados:', combinedDeployment);
}

// Exporta a função para uso em outros scripts
export default saveDeployment;