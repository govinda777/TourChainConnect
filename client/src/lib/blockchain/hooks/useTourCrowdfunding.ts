import { useState } from 'react';
import { useBlockchain } from '../providers/BlockchainProvider';
import { useToast } from '@/hooks/use-toast';
import useContract from './useContract';
import { TOUR_CROWDFUNDING_ABI } from '../contracts/abis';
import { getAddressesForNetwork } from '../contracts/addresses';
import { parseTokenAmount } from '../index';
import { ethers } from 'ethers';

/**
 * Interface para campanhas de crowdfunding
 */
export interface CampaignInfo {
  id: number;
  title: string;
  description: string;
  creator: string;
  fundingGoal: bigint;
  raisedAmount: bigint;
  deadline: bigint;
  status: number; // 0: Ativo, 1: Bem-sucedido, 2: Falha, 3: Cancelado
  contributorsCount: number;
  fundsWithdrawn: boolean;
}

/**
 * Interface para tiers de recompensa
 */
export interface RewardTier {
  id: number;
  title: string;
  minimumAmount: bigint;
  tokenAmount: bigint;
  description: string;
  limit: number;
  claimed: number;
  tierType: number; // 0: Regular, 1: Early Bird, 2: Premium, etc
}

/**
 * Interface para promessas/contribuições
 */
export interface Pledge {
  id: number;
  backer: string;
  name: string;
  email: string;
  amount: bigint;
  rewardTierId: number;
  comment: string;
  isAnonymous: boolean;
  status: number; // 0: Pendente, 1: Confirmada, 2: Reembolsada
  createdAt: number;
}

/**
 * Hook para interagir com o contrato de crowdfunding
 */
export function useTourCrowdfunding() {
  const { isDevelopment, isBlockchainReady, networkName, walletAddress } = useBlockchain();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Obtém o endereço do contrato para a rede atual
  const contractAddresses = getAddressesForNetwork(networkName);
  
  // Instância do contrato
  const { contract, isLoading, error } = useContract(
    contractAddresses.tourCrowdfunding,
    TOUR_CROWDFUNDING_ABI
  );
  
  /**
   * Obtém os detalhes de uma campanha
   */
  const getCampaign = async (campaignId: number): Promise<CampaignInfo | null> => {
    if (isDevelopment) {
      // Dados simulados para ambiente de desenvolvimento
      return {
        id: campaignId,
        title: "TourChain: Revolução nas Viagens Corporativas",
        description: "Ajude a construir o futuro das viagens corporativas com blockchain, bem-estar e sustentabilidade.",
        creator: "0x7Da37534E347561BEfC711F1a0dCFcb70735F268",
        fundingGoal: BigInt(100000 * 10**18),
        raisedAmount: BigInt(67500 * 10**18),
        deadline: BigInt(Date.now() / 1000 + 18 * 24 * 60 * 60), // +18 dias
        status: 0, // Ativo
        contributorsCount: 285,
        fundsWithdrawn: false
      };
    }
    
    try {
      if (!contract) {
        throw new Error("Contrato de crowdfunding não inicializado");
      }
      
      // Chama o método do contrato para obter os detalhes da campanha
      const campaign = await contract.getCampaign(campaignId);
      
      // Mapeia os dados retornados para o nosso formato de interface
      return {
        id: campaignId,
        title: campaign.title,
        description: campaign.description,
        creator: campaign.creator,
        fundingGoal: campaign.fundingGoal,
        raisedAmount: campaign.raisedAmount,
        deadline: campaign.deadline,
        status: campaign.status,
        contributorsCount: campaign.contributorsCount,
        fundsWithdrawn: campaign.fundsWithdrawn
      };
    } catch (error) {
      console.error(`Erro ao obter campanha ${campaignId}:`, error);
      toast({
        title: "Erro ao carregar campanha",
        description: "Não foi possível obter os detalhes da campanha. Tente novamente.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  /**
   * Obtém as recompensas de uma campanha
   */
  const getCampaignRewards = async (campaignId: number): Promise<RewardTier[]> => {
    if (isDevelopment) {
      // Dados simulados de recompensas
      return [
        {
          id: 1,
          title: "Tokens Dinâmicos",
          minimumAmount: BigInt(1 * 10**18),
          tokenAmount: BigInt(100 * 10**18),
          description: "Compre 100 tokens por um preço que aumenta US$ 1 a cada compra.",
          limit: 1000,
          claimed: 35,
          tierType: 0
        },
        {
          id: 2,
          title: "Acesso Antecipado",
          minimumAmount: BigInt(250 * 10**18),
          tokenAmount: BigInt(500 * 10**18),
          description: "Seja um dos primeiros a utilizar a plataforma TourChain com acesso prioritário e suporte VIP por 3 meses.",
          limit: 150,
          claimed: 87,
          tierType: 1
        }
      ];
    }
    
    try {
      if (!contract) {
        throw new Error("Contrato de crowdfunding não inicializado");
      }
      
      // Obtém os IDs das recompensas
      const rewardIds = await contract.getCampaignRewardTiers(campaignId);
      
      // Para cada ID, obtém os detalhes da recompensa
      const rewards: RewardTier[] = [];
      
      for (const id of rewardIds) {
        const reward = await contract.campaignRewardTiers(campaignId, id);
        
        rewards.push({
          id: Number(id),
          title: reward.title,
          minimumAmount: reward.minimumAmount,
          tokenAmount: reward.tokenAmount,
          description: reward.description,
          limit: Number(reward.limit),
          claimed: Number(reward.claimed),
          tierType: Number(reward.tierType)
        });
      }
      
      return rewards;
    } catch (error) {
      console.error(`Erro ao obter recompensas da campanha ${campaignId}:`, error);
      toast({
        title: "Erro ao carregar recompensas",
        description: "Não foi possível obter as recompensas da campanha. Tente novamente.",
        variant: "destructive"
      });
      return [];
    }
  };
  
  /**
   * Contribuir com uma campanha (pledge)
   */
  const pledge = async (
    campaignId: number,
    amount: string,
    rewardTierId: number,
    name: string,
    email: string,
    comment: string = "",
    isAnonymous: boolean = false
  ): Promise<boolean> => {
    if (!walletAddress) {
      toast({
        title: "Carteira não conectada",
        description: "Conecte sua carteira para fazer contribuições.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      if (isDevelopment) {
        // Simulação em ambiente de desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        toast({
          title: "Contribuição realizada com sucesso",
          description: `Você contribuiu com ${amount} tokens para a campanha #${campaignId}. Obrigado pelo seu apoio!`,
        });
        
        setIsProcessing(false);
        return true;
      }
      
      if (!contract) {
        throw new Error("Contrato de crowdfunding não inicializado");
      }
      
      // Converter string para BigInt
      const amountInWei = parseTokenAmount(amount);
      
      // Chamar o método pledge do contrato
      const tx = await contract.pledge(
        campaignId,
        amountInWei,
        rewardTierId,
        name,
        email,
        comment,
        isAnonymous,
        { gasLimit: 3000000 } // Ajuste conforme necessário
      );
      
      toast({
        title: "Transação enviada",
        description: "Sua contribuição está sendo processada. Aguarde a confirmação.",
      });
      
      // Aguardar confirmação da transação
      await tx.wait();
      
      toast({
        title: "Contribuição confirmada",
        description: `Sua contribuição de ${amount} tokens foi confirmada. Obrigado pelo seu apoio!`,
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao fazer contribuição:", error);
      toast({
        title: "Erro na contribuição",
        description: "Ocorreu um erro ao processar sua contribuição. Verifique se você tem saldo suficiente e tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    getCampaign,
    getCampaignRewards,
    pledge,
    isLoading,
    isProcessing,
    error
  };
}

export default useTourCrowdfunding;