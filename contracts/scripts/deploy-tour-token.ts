import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying TourToken contract...");

  // Obtém o endereço de deploy da conta
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Imprime o saldo da conta que está fazendo o deploy
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy do contrato TourToken
  const TourToken = await ethers.getContractFactory("TourToken");
  const tourToken = await TourToken.deploy();
  await tourToken.waitForDeployment();

  const tourTokenAddress = await tourToken.getAddress();
  console.log(`TourToken deployed to: ${tourTokenAddress}`);

  // Armazena o endereço do contrato para uso posterior
  const deploymentInfo = {
    network: process.env.HARDHAT_NETWORK || "localhost",
    address: tourTokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  // Cria o diretório de deployments se não existir
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  // Salva as informações de deployment
  fs.writeFileSync(
    path.join(deploymentDir, `tour_token-${deploymentInfo.network}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment information saved to:", path.join(deploymentDir, `tour_token-${deploymentInfo.network}.json`));
  return { tourTokenAddress };
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