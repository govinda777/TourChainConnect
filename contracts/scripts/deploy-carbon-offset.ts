import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import deployTourToken from "./deploy-tour-token";

async function main() {
  console.log("Deploying CarbonOffset contract...");

  // Obtém o endereço de deploy da conta
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Verifica se o token TOUR já está deployado ou precisa ser deployado
  let tourTokenAddress: string;

  // Verifica se existe um deployment do TourToken na rede atual
  const network = process.env.HARDHAT_NETWORK || "localhost";
  const deploymentDir = path.join(__dirname, "../deployments");
  const tourTokenDeploymentPath = path.join(deploymentDir, `tour_token-${network}.json`);

  if (fs.existsSync(tourTokenDeploymentPath)) {
    // Carrega o endereço do token TOUR já deployado
    const tokenDeployment = JSON.parse(fs.readFileSync(tourTokenDeploymentPath, "utf8"));
    tourTokenAddress = tokenDeployment.address;
    console.log(`Using existing TourToken at: ${tourTokenAddress}`);
  } else {
    // Deploy do token TOUR se não existir
    console.log("TourToken not found, deploying new TourToken contract...");
    const { tourTokenAddress: newTokenAddress } = await deployTourToken();
    tourTokenAddress = newTokenAddress;
  }

  // Configurações do contrato
  const offsetAdmin = deployer.address;
  const platformFeePercent = 300; // 3% (em base 10000)

  // Deploy do contrato CarbonOffset
  const CarbonOffset = await ethers.getContractFactory("CarbonOffset");
  const carbonOffset = await CarbonOffset.deploy(
    tourTokenAddress,
    offsetAdmin,
    platformFeePercent
  );
  await carbonOffset.waitForDeployment();

  const carbonOffsetAddress = await carbonOffset.getAddress();
  console.log(`CarbonOffset deployed to: ${carbonOffsetAddress}`);

  // Armazena o endereço do contrato para uso posterior
  const deploymentInfo = {
    network: network,
    address: carbonOffsetAddress,
    deployer: deployer.address,
    tourTokenAddress: tourTokenAddress,
    offsetAdmin: offsetAdmin,
    platformFeePercent: platformFeePercent,
    timestamp: new Date().toISOString(),
  };

  // Cria o diretório de deployments se não existir
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  // Salva as informações de deployment
  fs.writeFileSync(
    path.join(deploymentDir, `carbon_offset-${network}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment information saved to:", path.join(deploymentDir, `carbon_offset-${network}.json`));
  return { carbonOffsetAddress, tourTokenAddress };
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