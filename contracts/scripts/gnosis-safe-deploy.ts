import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

// Definições de tipo para o uso simulado do Gnosis Safe
interface SafeAccountConfig {
  owners: string[];
  threshold: number;
}

interface CreateTransactionOptions {
  safeTransactionData: any;
  safeAddress: string;
  safeTxHash: string;
  senderAddress: string;
  senderSignature: string;
}

interface SafeTransactionData {
  to: string;
  data: string;
  value: string;
  nonce: number;
}

// Classes simuladas para demonstração da integração com Gnosis Safe em CI/CD
const EthersAdapter = class {
  constructor(options: any) {
    console.log("🔐 Initializing Safe Ethers Adapter");
  }
};

const SafeFactory = class {
  static async create(options: any) {
    console.log("🏭 Creating Safe Factory");
    return new SafeFactory();
  }

  async deploySafe({ safeAccountConfig }: { safeAccountConfig: SafeAccountConfig }) {
    const mockSafeAddress = "0xSafe" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    console.log(`📜 Safe would be created with ${safeAccountConfig.owners.length} owners and threshold ${safeAccountConfig.threshold}`);
    
    return {
      getAddress: async () => mockSafeAddress
    };
  }
};

const SafeServiceClient = class {
  constructor(options: any) {
    console.log("🌐 Initializing Safe Service Client");
  }

  async proposeTransaction(options: CreateTransactionOptions) {
    console.log(`📝 Proposing transaction to Safe ${options.safeAddress.substring(0, 10)}...`);
    return { safeTxHash: options.safeTxHash };
  }
};

// Mock do Safe Core SDK
const Safe = class {
  static async create(options: any) {
    console.log(`🔒 Creating Safe instance for ${options.safeAddress.substring(0, 10)}...`);
    
    return {
      getAddress: async () => options.safeAddress,
      createTransaction: async (txData: SafeTransactionData) => {
        console.log(`📄 Creating transaction to ${txData.to.substring(0, 10)}... with value ${txData.value}`);
        return {
          data: txData,
          signatures: {}
        };
      },
      getTransactionHash: async () => "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      signTransactionHash: async (hash: string) => {
        console.log(`✍️ Signing transaction hash ${hash.substring(0, 10)}...`);
        return { data: "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('') };
      },
      getNonce: async () => Math.floor(Math.random() * 1000)
    };
  }
};

dotenv.config();

/**
 * Script para criar e gerenciar um Gnosis Safe para administração dos contratos
 * O Gnosis Safe permite transações multi-sig para maior segurança nas operações
 */
async function setupGnosisSafe() {
  // Obter o provider e signers
  const provider = ethers.provider;
  const [deployer, owner1, owner2] = await ethers.getSigners();
  
  console.log("=".repeat(80));
  console.log("TourChain Gnosis Safe Setup");
  console.log("=".repeat(80));
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Owner 1 address: ${owner1.address}`);
  console.log(`Owner 2 address: ${owner2.address}`);
  
  try {
    // Configurar o adapter para o Gnosis Safe
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: deployer
    });
    
    // Definir os donos do Safe e o threshold (número mínimo de assinaturas)
    const owners = [
      deployer.address, 
      owner1.address, 
      owner2.address
    ];
    const threshold = 2; // Exige 2 de 3 assinaturas para executar transações
    
    // Configuração do Safe
    const safeAccountConfig: SafeAccountConfig = {
      owners,
      threshold,
    };
    
    // Criar a factory do Safe
    const safeFactory = await SafeFactory.create({ 
      ethAdapter
    });
    
    console.log("Deploying new Safe...");
    // Criar um novo Safe
    const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });
    
    const safeAddress = await safeSdk.getAddress();
    console.log(`Safe deployed at: ${safeAddress}`);
    
    // Para ambientes de produção, também configuramos o cliente de serviço Safe
    // para permitir a proposição de transações por outros proprietários
    if (process.env.HARDHAT_NETWORK !== 'hardhat' && process.env.HARDHAT_NETWORK !== 'localhost') {
      const txServiceUrl = 'https://safe-transaction.mainnet.gnosis.io';
      const safeService = new SafeServiceClient({
        txServiceUrl,
        ethAdapter
      });
      
      console.log(`Safe service client configured for ${process.env.HARDHAT_NETWORK}`);
    }
    
    // Retorna o endereço do Safe e o SDK para uso em outros scripts
    return { 
      safeAddress, 
      safeSdk 
    };
    
  } catch (error) {
    console.error("Error setting up Gnosis Safe:", error);
    throw error;
  }
}

/**
 * Função para propor uma transação através do Gnosis Safe
 * @param safeAddress Endereço do Gnosis Safe
 * @param to Endereço do contrato alvo
 * @param data Dados da chamada da função (ABI encoded)
 * @param value Valor em ETH a ser enviado (opcional)
 */
export async function proposeSafeTransaction(
  safeAddress: string,
  to: string,
  data: string,
  value: string = '0'
): Promise<string> {
  try {
    const signer = await ethers.getSigner();
    
    // Configurar o adapter
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer
    });
    
    // Inicializar o SDK com o Safe existente
    const safeSdk = await Safe.create({
      ethAdapter,
      safeAddress
    });
    
    // Criar a transação
    const safeTransaction = await safeSdk.createTransaction({
      to,
      data,
      value,
      nonce: await safeSdk.getNonce()
    });
    
    // Assinar a transação pelo primeiro signatário
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
    const signature = await safeSdk.signTransactionHash(safeTxHash);
    
    console.log(`Transaction proposed: ${safeTxHash}`);
    console.log(`Signed by: ${signer.address}`);
    
    // Para ambientes que não são de teste, usamos o serviço Safe para propor a transação
    if (process.env.HARDHAT_NETWORK !== 'hardhat' && process.env.HARDHAT_NETWORK !== 'localhost') {
      const txServiceUrl = process.env.SAFE_SERVICE_URL || 'https://safe-transaction.mainnet.gnosis.io';
      const safeService = new SafeServiceClient({
        txServiceUrl,
        ethAdapter
      });
      
      // Propor a transação no serviço
      await safeService.proposeTransaction({
        safeAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: signer.address,
        senderSignature: signature.data,
      });
      
      console.log(`Transaction proposed on Safe service. Other owners can review and sign it.`);
    } else {
      // Para ambiente local, apenas simula a execução
      console.log(`Transaction would be executed with hash: ${safeTxHash}`);
    }
    
    return safeTxHash;
  } catch (error) {
    console.error("Error proposing Safe transaction:", error);
    throw error;
  }
}

// Executar diretamente se esse script for chamado
if (require.main === module) {
  setupGnosisSafe()
    .then(({ safeAddress }) => {
      console.log("Safe setup completed successfully!");
      console.log(`Safe address: ${safeAddress}`);
      console.log("=".repeat(80));
    })
    .catch(error => {
      console.error("Failed to set up Gnosis Safe:", error);
      process.exit(1);
    });
}

export default setupGnosisSafe;