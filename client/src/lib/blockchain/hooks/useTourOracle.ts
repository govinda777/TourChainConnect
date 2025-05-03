import { useState } from 'react';
import { useBlockchain } from '../providers/BlockchainProvider';
import { useToast } from '@/hooks/use-toast';
import useContract from './useContract';
import { TOUR_ORACLE_ABI } from '../contracts/abis';
import { getAddressesForNetwork } from '../contracts/addresses';
import { ethers } from 'ethers';

/**
 * Interface para dados de emissão de carbono
 */
export interface CarbonEmissionData {
  amount: bigint;
  timestamp: bigint;
  travelMode: string;
  distance: bigint;
  dataSource: string;
}

/**
 * Interface para dados de preços
 */
export interface PriceData {
  price: bigint;
  currencyPair: string;
  timestamp: bigint;
  dataSource: string;
}

/**
 * Interface para dados de otimização de viagem
 */
export interface TravelOptimizationData {
  savingsPercent: bigint;
  origin: string;
  destination: string;
  optimizedCost: bigint;
  originalCost: bigint;
  timestamp: bigint;
  optimizations: string[];
  dataSource: string;
}

/**
 * Hook para interagir com o contrato TourOracle
 */
export function useTourOracle() {
  const { isDevelopment, networkName } = useBlockchain();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtém o endereço do contrato para a rede atual
  const contractAddresses = getAddressesForNetwork(networkName);
  
  // Instância do contrato
  const { contract, isLoading: isContractLoading, error } = useContract(
    contractAddresses.tourOracle,
    TOUR_ORACLE_ABI
  );
  
  /**
   * Obtém dados de emissão de carbono
   */
  const getCarbonEmission = async (dataId: string): Promise<CarbonEmissionData | null> => {
    if (isDevelopment) {
      // Dados simulados para ambiente de desenvolvimento
      return {
        amount: BigInt(245 * 10**18),
        timestamp: BigInt(Date.now() / 1000),
        travelMode: "flight",
        distance: BigInt(1500),
        dataSource: "simulation"
      };
    }
    
    setIsLoading(true);
    
    try {
      if (!contract) {
        throw new Error("Contrato Oracle não inicializado");
      }
      
      const dataIdBytes = ethers.keccak256(ethers.toUtf8Bytes(dataId));
      const emission = await contract.getCarbonEmission(dataIdBytes);
      
      return {
        amount: emission[0],
        timestamp: emission[1],
        travelMode: emission[2],
        distance: emission[3],
        dataSource: emission[4]
      };
    } catch (error) {
      console.error("Erro ao obter dados de emissão de carbono:", error);
      toast({
        title: "Erro ao obter dados",
        description: "Não foi possível obter os dados de emissão de carbono.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Obtém dados de preços
   */
  const getPrice = async (dataId: string): Promise<PriceData | null> => {
    if (isDevelopment) {
      // Dados simulados para ambiente de desenvolvimento
      return {
        price: BigInt(145 * 10**8), // Preço com 8 casas decimais
        currencyPair: "TOUR/USD",
        timestamp: BigInt(Date.now() / 1000),
        dataSource: "simulation"
      };
    }
    
    setIsLoading(true);
    
    try {
      if (!contract) {
        throw new Error("Contrato Oracle não inicializado");
      }
      
      const dataIdBytes = ethers.keccak256(ethers.toUtf8Bytes(dataId));
      const priceData = await contract.getPrice(dataIdBytes);
      
      return {
        price: priceData[0],
        currencyPair: priceData[1],
        timestamp: priceData[2],
        dataSource: priceData[3]
      };
    } catch (error) {
      console.error("Erro ao obter dados de preço:", error);
      toast({
        title: "Erro ao obter dados",
        description: "Não foi possível obter os dados de preço.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Obtém dados de otimização de viagem
   */
  const getTravelOptimization = async (dataId: string): Promise<TravelOptimizationData | null> => {
    if (isDevelopment) {
      // Dados simulados para ambiente de desenvolvimento
      return {
        savingsPercent: BigInt(15 * 10**18), // 15% de economia com 18 casas decimais
        origin: "São Paulo",
        destination: "Rio de Janeiro",
        optimizedCost: BigInt(850 * 10**18),
        originalCost: BigInt(1000 * 10**18),
        timestamp: BigInt(Date.now() / 1000),
        optimizations: [
          "Escolha de companhia aérea mais econômica",
          "Horário alternativo com tarifas reduzidas",
          "Pacote com hospedagem incluída"
        ],
        dataSource: "simulation"
      };
    }
    
    setIsLoading(true);
    
    try {
      if (!contract) {
        throw new Error("Contrato Oracle não inicializado");
      }
      
      const dataIdBytes = ethers.keccak256(ethers.toUtf8Bytes(dataId));
      const optimizationData = await contract.getTravelOptimization(dataIdBytes);
      
      return {
        savingsPercent: optimizationData[0],
        origin: optimizationData[1],
        destination: optimizationData[2],
        optimizedCost: optimizationData[3],
        originalCost: optimizationData[4],
        timestamp: optimizationData[5],
        optimizations: optimizationData[6],
        dataSource: optimizationData[7]
      };
    } catch (error) {
      console.error("Erro ao obter dados de otimização de viagem:", error);
      toast({
        title: "Erro ao obter dados",
        description: "Não foi possível obter os dados de otimização de viagem.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    getCarbonEmission,
    getPrice,
    getTravelOptimization,
    isLoading: isLoading || isContractLoading,
    error
  };
}

export default useTourOracle;