// Endereços dos contratos inteligentes por rede
// Preencher com os endereços reais após o deploy

import { ethers } from 'ethers';

// Tipos para os endereços dos contratos
export interface ContractAddresses {
  tourToken: string;
  tourStaking: string;
  tourCrowdfunding: string;
  tourOracle: string;
  carbonOffset: string;
}

// Mapeamento de endereços por rede
export const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
  // Mainnet (quando os contratos forem deployados)
  mainnet: {
    tourToken: '',
    tourStaking: '',
    tourCrowdfunding: '',
    tourOracle: '',
    carbonOffset: ''
  },
  
  // Testnet Sepolia
  sepolia: {
    tourToken: '',
    tourStaking: '',
    tourCrowdfunding: '',
    tourOracle: '',
    carbonOffset: ''
  },
  
  // Testnet Mumbai (Polygon)
  polygon_mumbai: {
    tourToken: '',
    tourStaking: '',
    tourCrowdfunding: '',
    tourOracle: '',
    carbonOffset: ''
  },
  
  // Localhost / Desenvolvimento
  localhost: {
    tourToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    tourStaking: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    tourCrowdfunding: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    tourOracle: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    carbonOffset: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
  },
  
  // Ambiente de desenvolvimento (simulado)
  development: {
    tourToken: '0xMock_TourToken_Address',
    tourStaking: '0xMock_TourStaking_Address',
    tourCrowdfunding: '0xMock_TourCrowdfunding_Address',
    tourOracle: '0xMock_TourOracle_Address',
    carbonOffset: '0xMock_CarbonOffset_Address'
  }
};

// Função para obter endereços para uma rede específica
export function getAddressesForNetwork(networkName: string): ContractAddresses {
  const addresses = CONTRACT_ADDRESSES[networkName];
  
  if (!addresses) {
    console.warn(`Endereços de contratos não encontrados para a rede: ${networkName}. Usando desenvolvimento.`);
    return CONTRACT_ADDRESSES.development;
  }
  
  return addresses;
}

// Função para validar se um endereço é válido
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}