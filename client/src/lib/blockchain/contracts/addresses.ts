// Endereços de contratos por rede
export const CONTRACT_ADDRESSES: Record<string, Record<string, string>> = {
  // Ambiente local (serão preenchidos após o deploy)
  localhost: {
    tourToken: "",
    tourStaking: "",
    tourCrowdfunding: "",
    tourOracle: "",
    carbonOffset: ""
  },
  // Testnet Sepolia (serão preenchidos após o deploy)
  sepolia: {
    tourToken: "",
    tourStaking: "",
    tourCrowdfunding: "",
    tourOracle: "",
    carbonOffset: ""
  },
  // Testnet Polygon Mumbai (serão preenchidos após o deploy)
  polygon_mumbai: {
    tourToken: "",
    tourStaking: "",
    tourCrowdfunding: "",
    tourOracle: "",
    carbonOffset: ""
  }
};

/**
 * Função para obter o endereço do contrato com base na rede atual
 * @param contractName Nome do contrato
 * @param network Rede blockchain (padrão: valor do .env ou 'localhost')
 * @returns Endereço do contrato
 */
export function getContractAddress(
  contractName: string, 
  network = import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'localhost'
): string {
  if (!CONTRACT_ADDRESSES[network] || !CONTRACT_ADDRESSES[network][contractName]) {
    console.warn(`Endereço do contrato ${contractName} não encontrado para a rede ${network}`);
    return "";
  }
  return CONTRACT_ADDRESSES[network][contractName];
}

/**
 * Função para verificar se os endereços dos contratos estão configurados
 * @param network Rede blockchain (padrão: valor do .env ou 'localhost')
 * @returns Booleano indicando se todos os contratos necessários estão configurados
 */
export function areContractsConfigured(
  network = import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'localhost'
): boolean {
  if (!CONTRACT_ADDRESSES[network]) {
    return false;
  }
  
  const contracts = CONTRACT_ADDRESSES[network];
  const requiredContracts = ['tourToken', 'tourCrowdfunding'];
  
  return requiredContracts.every(contract => 
    contracts[contract] && contracts[contract].startsWith('0x') && contracts[contract].length === 42
  );
}

/**
 * Função para atualizar os endereços dos contratos em tempo de execução
 * Útil para conectar aos contratos após o deploy
 * @param network Rede blockchain
 * @param addresses Objeto com os endereços dos contratos
 */
export function updateContractAddresses(
  network: string,
  addresses: Record<string, string>
): void {
  if (!CONTRACT_ADDRESSES[network]) {
    CONTRACT_ADDRESSES[network] = {};
  }
  
  Object.entries(addresses).forEach(([contract, address]) => {
    CONTRACT_ADDRESSES[network][contract] = address;
  });
  
  console.log(`Endereços dos contratos atualizados para a rede ${network}:`, addresses);
}