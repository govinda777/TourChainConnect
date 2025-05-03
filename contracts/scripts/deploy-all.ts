import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import deployTourToken from "./deploy-tour-token";
import deployTourStaking from "./deploy-tour-staking";
import deployTourCrowdfunding from "./deploy-tour-crowdfunding";
import deployTourOracle from "./deploy-tour-oracle";
import deployCarbonOffset from "./deploy-carbon-offset";

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

  // Armazena um resumo de todos os deployments
  const network = process.env.HARDHAT_NETWORK || "localhost";
  const deploymentDir = path.join(__dirname, "../deployments");
  
  // Cria o diretório de deployments se não existir
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const allDeployments = {
    network: network,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      tourToken: tourTokenAddress,
      tourStaking: tourStakingAddress,
      tourCrowdfunding: tourCrowdfundingAddress,
      tourOracle: tourOracleAddress,
      carbonOffset: carbonOffsetAddress
    }
  };

  // Salva as informações de todos os deployments
  fs.writeFileSync(
    path.join(deploymentDir, `all_deployments-${network}.json`),
    JSON.stringify(allDeployments, null, 2)
  );

  console.log("\nAll deployments completed successfully!");
  console.log(`Summary saved to: ${path.join(deploymentDir, `all_deployments-${network}.json`)}`);
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