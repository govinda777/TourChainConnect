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
      // Se não temos endereço alvo, retorna zero
      if (!targetAddress) {
        return '0.00';
      }
      
      // Em ambiente de desenvolvimento, podemos usar o mock
      if (isDevelopment) {
        console.log('Usando saldo simulado de tokens em ambiente de desenvolvimento');
        return '1000.00';
      }
      
      // Verificamos se a blockchain está pronta
      if (!isBlockchainReady) {
        console.warn('Blockchain não está pronta para consultar saldo');
        throw new Error('Blockchain não está pronta');
      }
      
      // Verificamos se o contrato está carregado
      if (isContractLoading || !tokenContract) {
        console.warn('Contrato do token não está pronto para consultar saldo');
        throw new Error('Contrato do token não está pronto');
      }
      
      try {
        console.log(`Consultando saldo de ${targetAddress} no contrato ${contractAddresses.tourToken}`);
        
        // Chama o método balanceOf do contrato ERC20
        const balance = await tokenContract.balanceOf(targetAddress);
        console.log('Saldo obtido do contrato:', balance.toString());
        
        // Formata o saldo para exibição (de wei para unidades do token)
        const formattedBalance = formatTokenAmount(balance);
        console.log('Saldo formatado:', formattedBalance);
        
        return formattedBalance;
      } catch (error) {
        console.error('Erro ao obter saldo de tokens:', error);
        return '0.00';
      }
    },
    enabled: Boolean(targetAddress) && (isBlockchainReady || isDevelopment) && (!isContractLoading || isDevelopment),
    // Consulta a cada 30 segundos para manter o saldo atualizado
    refetchInterval: 30000
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