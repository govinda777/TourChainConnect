import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../providers/BlockchainProvider';

export interface SafeInfo {
  address: string;
  nonce: number;
  threshold: number;
  owners: string[];
  version: string;
  chainId: string;
}

export interface SafeTransaction {
  id: string;
  to: string;
  value: string;
  data: string;
  timestamp: number;
  description?: string;
  confirmations: string[]; // Lista de endereços que confirmaram
  confirmationsRequired: number;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

export interface SafeBalance {
  token: {
    name: string;
    symbol: string;
    decimals: number;
    logoUri?: string;
  };
  balance: string;
  fiatBalance: string;
}

/**
 * Hook para interagir com o Gnosis Safe
 * Permite consultar informações do Safe, transações e saldos
 */
export function useGnosisSafe() {
  const { provider } = useBlockchain();
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Consulta informações básicas do Safe
   * @param safeAddress Endereço do Gnosis Safe
   */
  const getSafeInfo = useCallback(async (safeAddress: string): Promise<SafeInfo> => {
    setIsLoading(true);
    
    try {
      // Em um ambiente de produção, isso usaria a API do Safe Service
      // https://safe-client.safe.global/
      
      // Para fins de demonstração, usamos dados simulados
      // Em produção, substituir por uma chamada real à API do Safe
      await new Promise(resolve => setTimeout(resolve, 800)); // Simular delay de rede
      
      const mockSafeInfo: SafeInfo = {
        address: safeAddress,
        nonce: 42,
        threshold: 2,
        owners: [
          '0xD7D7Deb1a97f047CcdD5A95F20de02d7A4D3B524',
          '0x9F84c5453F95D93E64f37F57E3B4F30bE9dAFeD4',
          '0xA375F8120Af3cCC5dfc6c7AA4f876e21B19921f9',
        ],
        version: '1.3.0',
        chainId: '137', // Polygon
      };
      
      return mockSafeInfo;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Consulta transações do Safe
   * @param safeAddress Endereço do Gnosis Safe
   */
  const getSafeTransactions = useCallback(async (safeAddress: string): Promise<SafeTransaction[]> => {
    setIsLoading(true);
    
    try {
      // Em um ambiente de produção, isso usaria a API do Safe Transaction Service
      
      // Para fins de demonstração, usamos dados simulados
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de rede
      
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      
      const mockTransactions: SafeTransaction[] = [
        {
          id: 'tx1',
          to: '0xA1B5D97Edc2d198a4ae5D02512Ac3D9a208F55d9',
          value: ethers.utils.parseEther('0.5').toString(),
          data: '0x',
          timestamp: now - 2 * day,
          description: 'Pagamento para fornecedor de hospedagem',
          confirmations: [
            '0xD7D7Deb1a97f047CcdD5A95F20de02d7A4D3B524',
            '0x9F84c5453F95D93E64f37F57E3B4F30bE9dAFeD4',
          ],
          confirmationsRequired: 2,
          status: 'EXECUTED',
        },
        {
          id: 'tx2',
          to: '0xB6D3d6f4b182a4F3747Dc83074AE6B4D68DBAdF1',
          value: ethers.utils.parseEther('1.2').toString(),
          data: '0x',
          timestamp: now - 5 * day,
          description: 'Compra de tokens para staking',
          confirmations: [
            '0xD7D7Deb1a97f047CcdD5A95F20de02d7A4D3B524',
            '0x9F84c5453F95D93E64f37F57E3B4F30bE9dAFeD4',
          ],
          confirmationsRequired: 2,
          status: 'EXECUTED',
        },
        {
          id: 'tx3',
          to: '0xD9BC43C9B97a736114aa3e7F0D25AA4f13d93763',
          value: ethers.utils.parseEther('0.8').toString(),
          data: '0x',
          timestamp: now - 12 * day,
          description: 'Reembolso de despesas de viagem',
          confirmations: [
            '0xD7D7Deb1a97f047CcdD5A95F20de02d7A4D3B524',
          ],
          confirmationsRequired: 2,
          status: 'PENDING',
        },
        {
          id: 'tx4',
          to: '0xF5DC4b45C552a98448704422Fd9f77F688F34C3B',
          value: ethers.utils.parseEther('0.3').toString(),
          data: '0x',
          timestamp: now - 15 * day,
          description: 'Compensação de carbono',
          confirmations: [
            '0xD7D7Deb1a97f047CcdD5A95F20de02d7A4D3B524',
            '0x9F84c5453F95D93E64f37F57E3B4F30bE9dAFeD4',
          ],
          confirmationsRequired: 2,
          status: 'EXECUTED',
        },
        {
          id: 'tx5',
          to: '0x3A32cd67B99B4C12C7dD63c43D781997589A0C11',
          value: ethers.utils.parseEther('0.05').toString(),
          data: '0x',
          timestamp: now - 18 * day,
          description: 'Interação com DApp de sustentabilidade',
          confirmations: [
            '0xD7D7Deb1a97f047CcdD5A95F20de02d7A4D3B524',
            '0xA375F8120Af3cCC5dfc6c7AA4f876e21B19921f9',
          ],
          confirmationsRequired: 2,
          status: 'EXECUTED',
        },
        {
          id: 'tx6',
          to: '0xE54BBc52ad7D9D14C94435b300c3b95139241c75',
          value: '0',
          data: '0x23b872dd0000000000000000000000003a32cd67b99b4c12c7dd63c43d781997589a0c110000000000000000000000000000000000000000000000056bc75e2d63100000',
          timestamp: now - 1 * day,
          description: 'Transferência de 100 TOUR para programa de recompensas',
          confirmations: [
            '0xD7D7Deb1a97f047CcdD5A95F20de02d7A4D3B524',
          ],
          confirmationsRequired: 2,
          status: 'PENDING',
        },
      ];
      
      return mockTransactions;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Consulta saldos do Safe
   * @param safeAddress Endereço do Gnosis Safe
   */
  const getSafeBalances = useCallback(async (safeAddress: string): Promise<SafeBalance[]> => {
    setIsLoading(true);
    
    try {
      // Em um ambiente de produção, isso usaria a API do Safe Service
      
      // Para fins de demonstração, usamos dados simulados
      await new Promise(resolve => setTimeout(resolve, 700)); // Simular delay de rede
      
      const mockBalances: SafeBalance[] = [
        {
          token: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
            logoUri: 'https://safe-transaction-assets.safe.global/tokens/logos/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
          },
          balance: ethers.utils.parseEther('2.5').toString(),
          fiatBalance: '7500.00',
        },
        {
          token: {
            name: 'TourChain Token',
            symbol: 'TOUR',
            decimals: 18,
            logoUri: '',
          },
          balance: ethers.utils.parseEther('1500').toString(),
          fiatBalance: '15000.00',
        },
        {
          token: {
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoUri: 'https://safe-transaction-assets.safe.global/tokens/logos/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
          },
          balance: '5000000000', // 5,000 USDC (6 decimals)
          fiatBalance: '5000.00',
        },
      ];
      
      return mockBalances;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Formata valor do token com base na quantidade de decimais
   */
  const formatTokenValue = useCallback((
    balance: string, 
    decimals: number, 
    symbol: string
  ): string => {
    const formatted = ethers.utils.formatUnits(balance, decimals);
    const numberValue = parseFloat(formatted);
    
    // Limitar casas decimais com base no token
    const decimalPlaces = symbol === 'ETH' ? 4 : (symbol === 'USDC' ? 2 : 2);
    
    return `${numberValue.toLocaleString('pt-BR', { 
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    })} ${symbol}`;
  }, []);
  
  /**
   * Formata um endereço para exibição abreviada
   */
  const formatAddress = useCallback((address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }, []);
  
  /**
   * Verifica se um endereço é owner do Safe
   */
  const isOwner = useCallback((safeInfo: SafeInfo | null, address: string): boolean => {
    if (!safeInfo || !address) return false;
    
    return safeInfo.owners.some(
      owner => owner.toLowerCase() === address.toLowerCase()
    );
  }, []);
  
  return {
    getSafeInfo,
    getSafeTransactions,
    getSafeBalances,
    formatTokenValue,
    formatAddress,
    isOwner,
    isLoading,
  };
}