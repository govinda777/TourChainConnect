import { useState } from 'react';
import { useBlockchain } from '../providers/BlockchainProvider';
import { useToast } from '@/hooks/use-toast';
import useContract from './useContract';
import { CARBON_OFFSET_ABI } from '../contracts/abis';
import { getAddressesForNetwork } from '../contracts/addresses';
import { parseTokenAmount, formatTokenAmount } from '../index';

/**
 * Interface para compensações de carbono
 */
export interface CarbonOffset {
  id: number;
  company: string;
  emissionAmount: bigint;
  travelDetails: string;
  offsetAmount: bigint;
  cost: bigint;
  verified: boolean;
  timestamp: bigint;
  offsetMethod: string;
}

/**
 * Interface para projetos de compensação de carbono
 */
export interface OffsetProject {
  id: number;
  name: string;
  description: string;
  pricePerTon: bigint;
  location: string;
  projectType: string;
  active: boolean;
  totalCapacity: bigint;
  remainingCapacity: bigint;
}

/**
 * Hook para interagir com o contrato CarbonOffset
 */
export function useCarbonOffset() {
  const { isDevelopment, networkName, walletAddress } = useBlockchain();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Obtém o endereço do contrato para a rede atual
  const contractAddresses = getAddressesForNetwork(networkName);
  
  // Instância do contrato
  const { contract, isLoading, error } = useContract(
    contractAddresses.carbonOffset,
    CARBON_OFFSET_ABI
  );
  
  /**
   * Obter projetos de compensação disponíveis
   */
  const getOffsetProjects = async (): Promise<OffsetProject[]> => {
    if (isDevelopment) {
      // Dados simulados para ambiente de desenvolvimento
      return [
        {
          id: 1,
          name: "Reflorestamento Amazônia",
          description: "Projeto de reflorestamento na Amazônia brasileira",
          pricePerTon: BigInt(25 * 10**18),
          location: "Amazônia, Brasil",
          projectType: "reflorestamento",
          active: true,
          totalCapacity: BigInt(10000 * 10**18),
          remainingCapacity: BigInt(8500 * 10**18)
        },
        {
          id: 2,
          name: "Energia Solar Nordeste",
          description: "Projeto de energia solar no Nordeste do Brasil",
          pricePerTon: BigInt(18 * 10**18),
          location: "Nordeste, Brasil",
          projectType: "energia renovável",
          active: true,
          totalCapacity: BigInt(5000 * 10**18),
          remainingCapacity: BigInt(3200 * 10**18)
        }
      ];
    }
    
    try {
      if (!contract) {
        throw new Error("Contrato CarbonOffset não inicializado");
      }
      
      // Em um contrato real, poderíamos ter um método para listar todos os projetos
      // Como é um exemplo, vamos apenas simular para 2 projetos
      const projects: OffsetProject[] = [];
      
      // Lógica para obter os projetos do contrato
      // Exemplo: Um contador de projetos e depois buscar cada um
      const projectCount = 2; // Simulado, em produção viria do contrato
      
      for (let i = 1; i <= projectCount; i++) {
        const project = await contract.offsetProjects(i);
        
        projects.push({
          id: i,
          name: project[1],
          description: project[2],
          pricePerTon: project[3],
          location: project[4],
          projectType: project[5],
          active: project[6],
          totalCapacity: project[7],
          remainingCapacity: project[8]
        });
      }
      
      return projects;
    } catch (error) {
      console.error("Erro ao obter projetos de compensação:", error);
      toast({
        title: "Erro ao obter projetos",
        description: "Não foi possível obter a lista de projetos de compensação de carbono.",
        variant: "destructive"
      });
      return [];
    }
  };
  
  /**
   * Calcular custo de compensação
   */
  const calculateOffsetCost = async (projectId: number, emissionAmount: string): Promise<{
    offsetCost: string,
    platformFee: string
  }> => {
    if (isDevelopment) {
      // Dados simulados para ambiente de desenvolvimento
      const emission = parseFloat(emissionAmount);
      const pricePerTon = 25; // Simulado em dólares
      
      const offsetCost = (emission * pricePerTon).toString();
      const platformFee = (emission * pricePerTon * 0.05).toString(); // 5% de taxa da plataforma
      
      return { offsetCost, platformFee };
    }
    
    try {
      if (!contract) {
        throw new Error("Contrato CarbonOffset não inicializado");
      }
      
      // Converter string para BigInt
      const emissionAmountWei = parseTokenAmount(emissionAmount);
      
      // Chamar o método do contrato para calcular o custo de compensação
      const result = await contract.calculateOffsetCost(projectId, emissionAmountWei);
      
      const offsetCost = formatTokenAmount(result[0]);
      const platformFee = formatTokenAmount(result[1]);
      
      return { offsetCost, platformFee };
    } catch (error) {
      console.error("Erro ao calcular custo de compensação:", error);
      toast({
        title: "Erro ao calcular custo",
        description: "Não foi possível calcular o custo de compensação de carbono.",
        variant: "destructive"
      });
      return { offsetCost: "0", platformFee: "0" };
    }
  };
  
  /**
   * Criar uma compensação de carbono
   */
  const createOffset = async (
    projectId: number,
    emissionAmount: string,
    travelDetails: string,
    offsetMethod: string
  ): Promise<boolean> => {
    if (!walletAddress) {
      toast({
        title: "Carteira não conectada",
        description: "Conecte sua carteira para criar uma compensação de carbono.",
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
          title: "Compensação de carbono criada",
          description: `Você compensou ${emissionAmount} toneladas de CO2 através do projeto #${projectId}.`,
        });
        
        setIsProcessing(false);
        return true;
      }
      
      if (!contract) {
        throw new Error("Contrato CarbonOffset não inicializado");
      }
      
      // Converter string para BigInt
      const emissionAmountWei = parseTokenAmount(emissionAmount);
      
      // Chamar o método createOffset do contrato
      const tx = await contract.createOffset(
        projectId,
        emissionAmountWei,
        travelDetails,
        offsetMethod,
        { gasLimit: 3000000 } // Ajuste conforme necessário
      );
      
      toast({
        title: "Transação enviada",
        description: "Sua compensação de carbono está sendo processada. Aguarde a confirmação.",
      });
      
      // Aguardar confirmação da transação
      await tx.wait();
      
      toast({
        title: "Compensação confirmada",
        description: `Sua compensação de ${emissionAmount} toneladas de CO2 foi confirmada.`,
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao criar compensação de carbono:", error);
      toast({
        title: "Erro na compensação",
        description: "Ocorreu um erro ao processar sua compensação de carbono. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Obter as compensações de carbono de uma empresa
   */
  const getCompanyOffsets = async (companyAddress: string = walletAddress || ''): Promise<CarbonOffset[]> => {
    if (isDevelopment) {
      // Dados simulados para ambiente de desenvolvimento
      return [
        {
          id: 1,
          company: companyAddress,
          emissionAmount: BigInt(125 * 10**18),
          travelDetails: "Voo São Paulo - Nova York",
          offsetAmount: BigInt(125 * 10**18),
          cost: BigInt(3125 * 10**18), // 125 * $25
          verified: true,
          timestamp: BigInt(Date.now() / 1000 - 86400), // Ontem
          offsetMethod: "reflorestamento"
        },
        {
          id: 2,
          company: companyAddress,
          emissionAmount: BigInt(75 * 10**18),
          travelDetails: "Voo Rio de Janeiro - Paris",
          offsetAmount: BigInt(75 * 10**18),
          cost: BigInt(1350 * 10**18), // 75 * $18
          verified: false,
          timestamp: BigInt(Date.now() / 1000 - 43200), // 12h atrás
          offsetMethod: "energia renovável"
        }
      ];
    }
    
    try {
      if (!contract) {
        throw new Error("Contrato CarbonOffset não inicializado");
      }
      
      // Obter IDs das compensações da empresa
      const offsetIds = await contract.getCompanyOffsets(companyAddress);
      
      // Para cada ID, obter os detalhes da compensação
      const offsets: CarbonOffset[] = [];
      
      for (const id of offsetIds) {
        const offset = await contract.offsets(id);
        
        offsets.push({
          id: Number(id),
          company: offset[1],
          emissionAmount: offset[2],
          travelDetails: offset[3],
          offsetAmount: offset[4],
          cost: offset[5],
          verified: offset[6],
          timestamp: offset[7],
          offsetMethod: offset[8]
        });
      }
      
      return offsets;
    } catch (error) {
      console.error("Erro ao obter compensações de carbono:", error);
      toast({
        title: "Erro ao obter compensações",
        description: "Não foi possível obter as compensações de carbono. Tente novamente.",
        variant: "destructive"
      });
      return [];
    }
  };
  
  return {
    getOffsetProjects,
    calculateOffsetCost,
    createOffset,
    getCompanyOffsets,
    isLoading,
    isProcessing,
    error
  };
}

export default useCarbonOffset;