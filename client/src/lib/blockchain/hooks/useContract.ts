import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../providers/BlockchainProvider';

// Mock handlers para simular funções de contrato comuns em ambiente de desenvolvimento
const createMockContractHandlers = (contractType: string) => {
  // Handlers básicos que todos os contratos têm
  const baseHandlers = {
    // Funções básicas ERC20
    balanceOf: async (address: string) => ethers.parseEther('1000'),
    transfer: async (to: string, amount: ethers.BigNumberish) => ({ wait: async () => ({ status: 1 }) }),
    transferFrom: async (from: string, to: string, amount: ethers.BigNumberish) => ({ wait: async () => ({ status: 1 }) }),
    allowance: async (owner: string, spender: string) => ethers.parseEther('1000000'),
    approve: async (spender: string, amount: ethers.BigNumberish) => ({ wait: async () => ({ status: 1 }) }),
    
    // Funções genéricas para simulação
    address: '0xMock_Contract_Address',
  };
  
  // Handlers específicos por tipo de contrato
  switch (contractType) {
    case 'tourToken':
      return {
        ...baseHandlers,
        name: async () => 'Tour Token',
        symbol: async () => 'TOUR',
        decimals: async () => 18,
        totalSupply: async () => ethers.parseEther('1000000'),
      };
      
    case 'tourCrowdfunding':
      return {
        ...baseHandlers,
        campaigns: async (id: number) => ({
          id,
          title: 'Campanha Demo',
          description: 'Descrição da campanha demo',
          creator: '0xCreatorAddress',
          fundingGoal: ethers.parseEther('10000'),
          raisedAmount: ethers.parseEther('5000'),
          deadline: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 0, // Ativo
          contributorsCount: 25,
          fundsWithdrawn: false
        }),
        getCampaignRewardTiers: async (id: number) => [1, 2, 3],
        pledge: async (campaignId: number, amount: ethers.BigNumberish, rewardTierId: number) => 
          ({ wait: async () => ({ status: 1 }) }),
      };
      
    default:
      return baseHandlers;
  }
};

// Função para obter o tipo de contrato a partir do endereço
const getContractTypeFromAddress = (address: string, networkName: string): string => {
  // Lista de endereços conhecidos
  const addressesToTypes: Record<string, string> = {
    // Verificar endereços de desenvolvimento
    '0xMock_TourToken_Address': 'tourToken',
    '0xMock_TourCrowdfunding_Address': 'tourCrowdfunding',
    '0xMock_TourStaking_Address': 'tourStaking',
    '0xMock_TourOracle_Address': 'tourOracle',
    '0xMock_CarbonOffset_Address': 'carbonOffset',
    
    // Endereços localhost
    '0x5FbDB2315678afecb367f032d93F642f64180aa3': 'tourToken',
    '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0': 'tourCrowdfunding',
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512': 'tourStaking',
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9': 'tourOracle',
    '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9': 'carbonOffset',
  };
  
  return addressesToTypes[address] || 'unknown';
};

/**
 * Hook genérico para instanciar e interagir com smart contracts
 * @param address Endereço do contrato
 * @param abi ABI do contrato
 * @returns Instância do contrato e informações de status
 */
export function useContract(address: string, abi: any) {
  const { 
    isDevelopment, 
    isBlockchainReady, 
    areContractsReady, 
    walletAddress,
    networkName 
  } = useBlockchain();
  
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initContract() {
      if (!isBlockchainReady || !areContractsReady) {
        return;
      }

      try {
        setIsLoading(true);
        
        // No ambiente de desenvolvimento, retornamos um mock do contrato
        if (isDevelopment) {
          console.log(`Inicializando contrato simulado para ${address}`);
          
          // Determinar o tipo de contrato para fornecer o mock adequado
          const contractType = getContractTypeFromAddress(address, networkName);
          
          // Criar handlers específicos para este tipo de contrato
          const mockHandlers = createMockContractHandlers(contractType);
          
          // Criar mock do contrato usando um proxy
          const mockContract = new Proxy({}, {
            get: (target, prop) => {
              // Se temos uma implementação específica, a utilizamos
              if (prop in mockHandlers) {
                return mockHandlers[prop as keyof typeof mockHandlers];
              }
              
              // Caso contrário, retornamos uma função padrão que retorna valores simulados
              return typeof prop === 'string' ? 
                async (...args: any[]) => {
                  console.log(`Chamada simulada para ${String(prop)}`, args);
                  return ethers.parseEther('0');
                } : undefined;
            }
          });
          
          setContract(mockContract as unknown as ethers.Contract);
          setIsLoading(false);
          return;
        }
        
        // Verificar se a carteira está conectada
        if (!walletAddress) {
          setContract(null);
          setIsLoading(false);
          return;
        }

        // Validar o endereço do contrato
        if (!ethers.isAddress(address)) {
          throw new Error(`Endereço de contrato inválido: ${address}`);
        }

        // Criar provider e instância do contrato
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // Obter o signer para transações assinadas
          let contractInstance;
          
          try {
            const signer = await provider.getSigner();
            // Criar instância do contrato conectada ao signer
            contractInstance = new ethers.Contract(address, abi, signer);
            console.log(`Contrato ${address} conectado com signer`);
          } catch (signerError) {
            // Se não conseguirmos um signer, usamos só o provider (somente leitura)
            console.warn(`Não foi possível obter signer, usando provider somente leitura: ${signerError}`);
            contractInstance = new ethers.Contract(address, abi, provider);
          }
          
          setContract(contractInstance);
        }
      } catch (err) {
        console.error("Erro ao inicializar contrato:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    initContract();
  }, [address, abi, isBlockchainReady, areContractsReady, walletAddress, isDevelopment, networkName]);

  return {
    contract,
    isLoading,
    error
  };
}

export default useContract;