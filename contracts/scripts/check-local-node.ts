import { ethers } from "hardhat";

async function main() {
  console.log("Checking local Hardhat node connection...");

  try {
    // Obtém as contas disponíveis
    const accounts = await ethers.getSigners();
    console.log(`Connected to local node with ${accounts.length} accounts available`);
    
    // Verifica o saldo da primeira conta
    const balance = await ethers.provider.getBalance(accounts[0].address);
    console.log(`Account ${accounts[0].address} has ${ethers.formatEther(balance)} ETH`);
    
    // Verifica a rede atual
    const network = await ethers.provider.getNetwork();
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
    
    // Verifica o número do bloco atual
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
    
    // Verifica se podemos fazer uma transação simples
    const tx = await accounts[0].sendTransaction({
      to: accounts[1].address,
      value: ethers.parseEther("1.0")
    });
    
    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("Transaction confirmed");
    
    console.log("\nLocal node check completed successfully! ✅");
    console.log("You can now deploy and interact with your contracts.");
    console.log("\nTo deploy all contracts, run:");
    console.log("npx hardhat run contracts/scripts/deploy-all.ts --network localhost");
    
  } catch (error) {
    console.error("Error connecting to local node:", error);
    console.log("\nMake sure you have started the Hardhat node with:");
    console.log("npx hardhat node");
    
    process.exit(1);
  }
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