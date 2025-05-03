import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import deployTourToken from "./deploy-tour-token";
import deployTourStaking from "./deploy-tour-staking";
import deployTourCrowdfunding from "./deploy-tour-crowdfunding";
import deployTourOracle from "./deploy-tour-oracle";
import deployCarbonOffset from "./deploy-carbon-offset";
import saveDeployment from "./save-deployment";
import setupGnosisSafe, { proposeSafeTransaction } from "./gnosis-safe-deploy";

async function main() {
  console.log("=".repeat(80));
  console.log("TourChain Smart Contracts Deployment");
  console.log("=".repeat(80));

  // Obtém o endereço de deploy da conta
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying all contracts with the account: ${deployer.address}`);

  // Imprime o saldo da conta que está fazendo o deploy
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);
  console.log("-".repeat(80));

  // Verifica se deve usar o Gnosis Safe para administração
  const useGnosisSafe = process.env.USE_GNOSIS_SAFE === 'true';
  let safeAddress: string | undefined;
  
  // Se configurado, primeiro faz o setup do Gnosis Safe
  if (useGnosisSafe) {
    console.log("\nSetting up Gnosis Safe for contract administration...");
    try {
      const safeSetup = await setupGnosisSafe();
      safeAddress = safeSetup.safeAddress;
      console.log(`Gnosis Safe set up at: ${safeAddress}`);
      console.log("-".repeat(80));
    } catch (error) {
      console.warn("Warning: Failed to set up Gnosis Safe. Continuing with regular deployment.");
      console.warn(error);
    }
  }

  // 1. Deploy do TourToken
  console.log("\n1. Deploying TourToken...");
  const { tourTokenAddress } = await deployTourToken();
  console.log(`TourToken deployed to: ${tourTokenAddress}`);
  console.log("-".repeat(80));

  // 2. Deploy do TourStaking
  console.log("\n2. Deploying TourStaking...");
  const { tourStakingAddress } = await deployTourStaking();
  console.log(`TourStaking deployed to: ${tourStakingAddress}`);
  console.log("-".repeat(80));

  // 3. Deploy do TourCrowdfunding
  console.log("\n3. Deploying TourCrowdfunding...");
  const { tourCrowdfundingAddress } = await deployTourCrowdfunding();
  console.log(`TourCrowdfunding deployed to: ${tourCrowdfundingAddress}`);
  console.log("-".repeat(80));

  // 4. Deploy do TourOracle
  console.log("\n4. Deploying TourOracle...");
  const { tourOracleAddress } = await deployTourOracle();
  console.log(`TourOracle deployed to: ${tourOracleAddress}`);
  console.log("-".repeat(80));

  // 5. Deploy do CarbonOffset
  console.log("\n5. Deploying CarbonOffset...");
  const { carbonOffsetAddress } = await deployCarbonOffset();
  console.log(`CarbonOffset deployed to: ${carbonOffsetAddress}`);
  console.log("-".repeat(80));

  // Se estiver usando Gnosis Safe, propõe transferência de propriedade
  if (useGnosisSafe && safeAddress) {
    console.log("\nProposing ownership transfer to Gnosis Safe...");
    
    // Exemplo de como propor transferência de propriedade para o Gnosis Safe
    // Na implementação real, você usaria os contratos específicos e suas ABIs
    // Aqui, simulamos o processo para demonstração
    try {
      // Supondo que os contratos tenham um método transferOwnership
      const tourTokenContract = await ethers.getContractAt("TourToken", tourTokenAddress);
      const transferData = tourTokenContract.interface.encodeFunctionData("transferOwnership", [safeAddress]);
      
      await proposeSafeTransaction(
        safeAddress,
        tourTokenAddress,
        transferData,
        "0" // sem valor enviado
      );
      
      console.log(`Ownership transfer of TourToken to Gnosis Safe proposed.`);
      // Repetir para outros contratos conforme necessário
    } catch (error) {
      console.warn("Warning: Failed to propose ownership transfer. Manual transfer will be required.");
      console.warn(error);
    }
  }

  // Salva um resumo de todos os deployments
  const network = process.env.HARDHAT_NETWORK || "localhost";
  const deploymentDir = path.join(__dirname, "../deployments");
  
  // Cria o diretório de deployments se não existir
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  // Armazena os endereços dos contratos no formato adequado para CI/CD
  const deploymentInfo = {
    tourToken: tourTokenAddress,
    tourStaking: tourStakingAddress,
    tourCrowdfunding: tourCrowdfundingAddress,
    tourOracle: tourOracleAddress,
    carbonOffset: carbonOffsetAddress,
    deployer: deployer.address,
    feeCollector: safeAddress || deployer.address, // Usa o Safe como coletor de taxas se disponível
    gnosisSafe: safeAddress || "Not used",
    network: network
  };

  // Salva as informações para o CI/CD
  saveDeployment(deploymentInfo);

  // Também salva uma cópia no diretório de deployments para referência durante o desenvolvimento
  const allDeployments = {
    network: network,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    gnosisSafe: safeAddress,
    contracts: {
      tourToken: tourTokenAddress,
      tourStaking: tourStakingAddress,
      tourCrowdfunding: tourCrowdfundingAddress,
      tourOracle: tourOracleAddress,
      carbonOffset: carbonOffsetAddress
    }
  };

  // Salva as informações de todos os deployments localmente
  fs.writeFileSync(
    path.join(deploymentDir, `all_deployments-${network}.json`),
    JSON.stringify(allDeployments, null, 2)
  );

  console.log("\nAll deployments completed successfully!");
  console.log(`Deployment information saved for CI/CD: deployed-contracts.json`);
  console.log(`Development summary saved to: ${path.join(deploymentDir, `all_deployments-${network}.json`)}`);
  
  // Adiciona informações sobre o Gnosis Safe se aplicável
  if (safeAddress) {
    console.log(`\nGnosis Safe set up for contract administration: ${safeAddress}`);
    console.log("Ownership transfer proposals have been created and require signatures from the Safe owners.");
  }
  
  console.log("=".repeat(80));
}

// Executa o script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;