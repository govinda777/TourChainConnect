import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../providers/BlockchainProvider';

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
    walletAddress 
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
          // Criar um mock do contrato para desenvolvimento
          const mockContract = {
            // Métodos simulados serão adicionados conforme necessário
            // através de proxies
          };
          
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
          
          // Opcionalmente, podemos obter o signer para transações assinadas
          const signer = await provider.getSigner();
          
          // Criar instância do contrato conectada ao signer
          const contractInstance = new ethers.Contract(address, abi, signer);
          
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
  }, [address, abi, isBlockchainReady, areContractsReady, walletAddress, isDevelopment]);

  return {
    contract,
    isLoading,
    error
  };
}

export default useContract;