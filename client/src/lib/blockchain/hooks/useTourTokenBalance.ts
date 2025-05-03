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
  const { contract: tokenContract, isLoading: isContractLoading, error: contractError } = useContract(
    contractAddresses.tourToken,
    TOUR_TOKEN_ABI
  );
  
  // Consulta o saldo de tokens
  const query = useQuery({
    queryKey: ['tourTokenBalance', targetAddress, networkName],
    queryFn: async () => {
      // Se não temos endereço alvo, retorna zero
      if (!targetAddress) {
        console.log('Nenhum endereço de carteira disponível para consultar saldo');
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
        throw new Error('Blockchain não está pronta para uso');
      }
      
      // Verificamos se há erro no contrato
      if (contractError) {
        console.error('Erro na instância do contrato:', contractError);
        throw new Error(`Erro no contrato: ${contractError.message}`);
      }
      
      // Verificamos se o contrato está carregado
      if (isContractLoading || !tokenContract) {
        console.warn('Contrato do token não está pronto para consultar saldo');
        throw new Error('Contrato do token não está disponível');
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
      } catch (error: any) {
        console.error('Erro ao obter saldo de tokens:', error);
        
        // Fornece mensagem de erro mais detalhada
        const errorMessage = error.message || 'Erro desconhecido na consulta de saldo';
        throw new Error(`Falha ao consultar saldo: ${errorMessage}`);
      }
    },
    enabled: Boolean(targetAddress) && (isBlockchainReady || isDevelopment) && (!isContractLoading || isDevelopment),
    // Consulta a cada 30 segundos para manter o saldo atualizado
    refetchInterval: 30000,
    // Configurações adicionais para melhorar a experiência
    retry: 2,
    staleTime: 10000
  });
  
  // Função para atualizar o saldo após uma transação
  const updateBalance = async (contributionAmount?: string) => {
    if (!targetAddress) {
      console.warn('Não é possível atualizar saldo: endereço não disponível');
      return;
    }
    
    try {
      if (isDevelopment) {
        // Para simulação, calculamos com base no valor atual e na contribuição
        const currentBalance = query.data ? parseFloat(query.data) : 0;
        const contribution = contributionAmount ? parseFloat(contributionAmount) : 0;
        const newBalance = (currentBalance - contribution).toFixed(2);
        
        console.log(`Atualizando saldo simulado: ${currentBalance} - ${contribution} = ${newBalance}`);
        
        // Atualiza o cache com o novo valor
        queryClient.setQueryData(['tourTokenBalance', targetAddress, networkName], newBalance);
        return;
      }
      
      // Em produção, obtenha o saldo atualizado do contrato
      if (tokenContract) {
        console.log(`Buscando saldo atualizado após transação para ${targetAddress}`);
        const balance = await tokenContract.balanceOf(targetAddress);
        const formattedBalance = formatTokenAmount(balance);
        
        console.log(`Saldo atualizado: ${formattedBalance}`);
        
        // Atualiza o cache com o novo valor
        queryClient.setQueryData(['tourTokenBalance', targetAddress, networkName], formattedBalance);
      } else {
        console.warn('Não é possível atualizar saldo: contrato não está disponível');
      }
    } catch (error) {
      console.error('Erro ao atualizar saldo de tokens:', error);
      throw new Error('Falha ao atualizar saldo após transação');
    }
  };
  
  // Fornecer também a função de refetch para atualização manual
  const refetch = query.refetch;
  
  return {
    ...query,
    updateBalance,
    refetch,
    // Informações adicionais para debug
    targetAddress,
    contractAddress: contractAddresses.tourToken,
    hasContract: !!tokenContract,
    contractError
  };
}

export default useTourTokenBalance;