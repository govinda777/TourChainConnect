import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying TourOracle contract...");

  // Obtém o endereço de deploy da conta
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Imprime o saldo da conta que está fazendo o deploy
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  // Configurações do oracle
  const minimumStake = ethers.parseEther("0.1"); // 0.1 ETH de stake mínimo

  // Deploy do contrato TourOracle
  const TourOracle = await ethers.getContractFactory("TourOracle");
  const tourOracle = await TourOracle.deploy(minimumStake);
  await tourOracle.waitForDeployment();

  const tourOracleAddress = await tourOracle.getAddress();
  console.log(`TourOracle deployed to: ${tourOracleAddress}`);

  // Armazena o endereço do contrato para uso posterior
  const deploymentInfo = {
    network: process.env.HARDHAT_NETWORK || "localhost",
    address: tourOracleAddress,
    deployer: deployer.address,
    minimumStake: minimumStake.toString(),
    timestamp: new Date().toISOString(),
  };

  // Cria o diretório de deployments se não existir
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  // Salva as informações de deployment
  fs.writeFileSync(
    path.join(deploymentDir, `tour_oracle-${deploymentInfo.network}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment information saved to:", path.join(deploymentDir, `tour_oracle-${deploymentInfo.network}.json`));
  return { tourOracleAddress };
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