import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBlockchain } from '../providers/BlockchainProvider';
import { formatTokenAmount, parseTokenAmount } from '../index';
import useContract from './useContract';
import { TOUR_TOKEN_ABI } from '../contracts/abis';
import { getAddressesForNetwork } from '../contracts/addresses';
import { ethers } from 'ethers';

/**
 * Hook para obter e atualizar o saldo de tokens TOUR
 * @param address Endereço da carteira para verificar o saldo (opcional, usa a carteira conectada se não fornecido)
 * @returns Objeto com dados do saldo, status de carregamento e função para atualizar o saldo
 */
export function useTourTokenBalance(address?: string) {
  const { 
    walletAddress, 
    isBlockchainReady, 
    isWalletConnected, 
    isDevelopment,
    networkName
  } = useBlockchain();
  const queryClient = useQueryClient();
  
  // Usa o endereço fornecido ou o endereço da carteira conectada
  const targetAddress = address || walletAddress;
  
  // Obtém o endereço do contrato de token para a rede atual
  const contractAddresses = getAddressesForNetwork(networkName);
  
  // Obtém a instância do contrato
  const { contract: tokenContract, isLoading: isContractLoading } = useContract(
    contractAddresses.tourToken,
    TOUR_TOKEN_ABI
  );
  
  // Consulta o saldo de tokens
  const query = useQuery({
    queryKey: ['tourTokenBalance', targetAddress, networkName],
    queryFn: async () => {
      // Em ambiente de desenvolvimento, retorna um valor simulado
      if (isDevelopment || !isBlockchainReady || !targetAddress) {
        return '1000.00';
      }
      
      if (isContractLoading || !tokenContract) {
        throw new Error('Contrato do token não está pronto');
      }
      
      try {
        // Chama o método balanceOf do contrato ERC20
        const balance = await tokenContract.balanceOf(targetAddress);
        
        // Formata o saldo para exibição (de wei para unidades do token)
        return formatTokenAmount(balance);
      } catch (error) {
        console.error('Erro ao obter saldo de tokens:', error);
        return '0.00';
      }
    },
    enabled: Boolean(targetAddress) && isBlockchainReady && (!isContractLoading || isDevelopment)
  });
  
  // Função para atualizar o saldo após uma transação
  const updateBalance = async (contributionAmount?: string) => {
    if (!targetAddress) return;
    
    try {
      if (isDevelopment) {
        // Para simulação, calculamos com base no valor atual e na contribuição
        const currentBalance = query.data ? parseFloat(query.data) : 0;
        const contribution = contributionAmount ? parseFloat(contributionAmount) : 0;
        const newBalance = (currentBalance - contribution).toFixed(2);
        
        // Atualiza o cache com o novo valor
        queryClient.setQueryData(['tourTokenBalance', targetAddress, networkName], newBalance);
        return;
      }
      
      // Em produção, obtenha o saldo atualizado do contrato
      if (tokenContract) {
        const balance = await tokenContract.balanceOf(targetAddress);
        const formattedBalance = formatTokenAmount(balance);
        
        // Atualiza o cache com o novo valor
        queryClient.setQueryData(['tourTokenBalance', targetAddress, networkName], formattedBalance);
      }
    } catch (error) {
      console.error('Erro ao atualizar saldo de tokens:', error);
    }
  };
  
  return {
    ...query,
    updateBalance
  };
}

export default useTourTokenBalance;