import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBlockchain } from '../providers/BlockchainProvider';
import { formatTokenAmount } from '../index';

/**
 * Hook para obter e atualizar o saldo de tokens TOUR
 * @param address Endereço da carteira para verificar o saldo (opcional, usa a carteira conectada se não fornecido)
 * @returns Objeto com dados do saldo, status de carregamento e função para atualizar o saldo
 */
export function useTourTokenBalance(address?: string) {
  const { walletAddress, isBlockchainReady, isWalletConnected } = useBlockchain();
  const queryClient = useQueryClient();
  
  // Usa o endereço fornecido ou o endereço da carteira conectada
  const targetAddress = address || walletAddress;
  
  // Consulta o saldo de tokens
  const query = useQuery({
    queryKey: ['tourTokenBalance', targetAddress],
    queryFn: async () => {
      // Em ambiente de desenvolvimento, retorna um valor simulado
      if (!isBlockchainReady || !targetAddress) {
        return '1000.00';
      }
      
      try {
        // Em um ambiente real, aqui chamaríamos o contrato do token
        // Simulando um valor de saldo para demonstração
        return '1000.00'; // Valor fixo para demonstração
      } catch (error) {
        console.error('Erro ao obter saldo de tokens:', error);
        return '0.00';
      }
    },
    enabled: Boolean(targetAddress) && isBlockchainReady
  });
  
  // Função para atualizar o saldo após uma transação
  const updateBalance = async (contributionAmount?: string) => {
    if (!targetAddress) return;
    
    try {
      // Em um ambiente real, chamaríamos o contrato para obter o saldo atualizado
      // Para simulação, vamos calcular com base no valor atual e na contribuição
      const currentBalance = query.data ? parseFloat(query.data) : 0;
      const contribution = contributionAmount ? parseFloat(contributionAmount) : 0;
      const newBalance = (currentBalance - contribution).toFixed(2);
      
      // Atualiza o cache com o novo valor
      queryClient.setQueryData(['tourTokenBalance', targetAddress], newBalance);
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