import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=".repeat(80));
  console.log("TourChain Network Configuration Check");
  console.log("=".repeat(80));

  // Verifica a rede atual
  console.log(`Current network: ${network.name} (${network.config.chainId})`);
  
  // Verifica configurações de ambiente
  const privateKey = process.env.PRIVATE_KEY;
  console.log(`Private key configured: ${privateKey ? "Yes ✅" : "No ❌"}`);
  
  const infuraKey = process.env.INFURA_API_KEY;
  console.log(`Infura API key configured: ${infuraKey ? "Yes ✅" : "No ❌"}`);
  
  const etherscanKey = process.env.ETHERSCAN_API_KEY;
  console.log(`Etherscan API key configured: ${etherscanKey ? "Yes ✅" : "No ❌"}`);
  
  // Verifica o provider
  try {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`Successfully connected to network: ${network.name}`);
    console.log(`Current block number: ${blockNumber}`);
  } catch (error) {
    console.error(`Error connecting to network ${network.name}:`, error);
    if (network.name !== "localhost" && !infuraKey) {
      console.log("\nTIP: Make sure to configure INFURA_API_KEY in your .env file for testnets and mainnet.");
    }
  }
  
  // Lista as redes configuradas
  console.log("\nConfigured networks:");
  
  const hardhatConfigPath = path.join(__dirname, "../", "hardhat.config.ts");
  try {
    const configContent = fs.readFileSync(hardhatConfigPath, 'utf-8');
    
    // Extrai as redes do arquivo de configuração (solução simples)
    const networksSection = configContent.split("networks:")[1]?.split("}")[0];
    if (networksSection) {
      const networkNames = networksSection.match(/\w+\s*:/g);
      if (networkNames && networkNames.length > 0) {
        networkNames.forEach(networkName => {
          const name = networkName.trim().replace(':', '');
          console.log(`- ${name}`);
        });
      }
    }
  } catch (error) {
    console.log("Could not parse hardhat.config.ts to list networks");
  }
  
  // Verifica as contas disponíveis
  if (network.name === "localhost" || network.name === "hardhat") {
    try {
      const accounts = await ethers.getSigners();
      console.log(`\nAvailable accounts for testing (${accounts.length}):`);
      for (let i = 0; i < Math.min(accounts.length, 3); i++) {
        const balance = await ethers.provider.getBalance(accounts[i].address);
        console.log(`${i+1}. ${accounts[i].address} (${ethers.formatEther(balance)} ETH)`);
      }
      if (accounts.length > 3) {
        console.log(`... and ${accounts.length - 3} more accounts`);
      }
    } catch (error) {
      console.log("\nCould not retrieve test accounts:", error);
    }
  } else {
    // Em redes públicas, tenta usar a chave privada configurada
    if (privateKey) {
      try {
        // Cria um signer a partir da chave privada
        const provider = ethers.provider;
        const wallet = new ethers.Wallet(privateKey, provider);
        
        const balance = await provider.getBalance(wallet.address);
        console.log(`\nConfigured account: ${wallet.address}`);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH/Native Token`);
        
        // Verifica se há fundos suficientes para deploy
        const estimatedGasCost = ethers.parseEther("0.05"); // Estimativa conservadora
        if (balance < estimatedGasCost) {
          console.log(`\n⚠️ WARNING: Account may not have enough funds for contract deployment.`);
          console.log(`Consider adding more funds before deploying contracts.`);
        }
      } catch (error) {
        console.log("\nError checking account balance:", error);
      }
    } else {
      console.log("\n⚠️ WARNING: No private key configured for non-local network.");
      console.log("Add PRIVATE_KEY to your .env file to deploy to public networks.");
    }
  }
  
  console.log("\nNetwork check completed!");
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