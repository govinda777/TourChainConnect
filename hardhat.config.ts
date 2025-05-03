import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "solidity-coverage";

dotenv.config();

// Chaves privadas por padrão para testes locais
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || PRIVATE_KEY;
const MAINNET_DEPLOYER_PRIVATE_KEY = process.env.MAINNET_DEPLOYER_PRIVATE_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: false,
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      allowUnlimitedContractSize: false,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      gasMultiplier: 1.2,
      gasPrice: 30000000000, // 30 gwei
    },
    polygon_mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
      gasMultiplier: 1.2,
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: MAINNET_DEPLOYER_PRIVATE_KEY ? [MAINNET_DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./contracts/cache",
    artifacts: "./contracts/artifacts"
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 30,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    excludeContracts: [],
    src: "./contracts",
    outputFile: "gas-report.txt",
  },
  mocha: {
    timeout: 60000, // 60 segundos máx por teste
  },
};

export default config;