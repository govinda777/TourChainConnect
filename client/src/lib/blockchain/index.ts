// Este arquivo exporta todos os módulos relacionados à blockchain para facilitar a importação

// Exportar os ABIs dos contratos
export * from './contracts/abis';

// Exportar utilitários de endereços
export * from './contracts/addresses';

// Exportar hooks
export { default as useContract } from './hooks/useContract';
export { default as useTourTokenBalance } from './hooks/useTourTokenBalance';
export { default as useTourCrowdfunding } from './hooks/useTourCrowdfunding';
export { default as useTourOracle } from './hooks/useTourOracle';
export { default as useCarbonOffset } from './hooks/useCarbonOffset';

// Exportar provider e hook de contexto
export { default as BlockchainProvider, useBlockchain } from './providers/BlockchainProvider';

// Configuração blockchain
export const BLOCKCHAIN_CONFIG = {
  networkName: import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'localhost',
  infuraApiKey: import.meta.env.VITE_INFURA_API_KEY || '',
  alchemyApiKey: import.meta.env.VITE_ALCHEMY_API_KEY || '',
  chainId: import.meta.env.VITE_CHAIN_ID || '0x539', // 0x539 = localhost
};

/**
 * Utilitários para conversão de valores
 */

// Converte um valor em string/number para bigint (com 18 casas decimais)
export function parseTokenAmount(amount: string | number): bigint {
  if (typeof amount === 'string' && amount.trim() === '') {
    return BigInt(0);
  }
  
  try {
    const numericValue = Number(amount);
    if (isNaN(numericValue)) return BigInt(0);
    
    return BigInt(Math.floor(numericValue * 10**18));
  } catch (error) {
    console.error('Erro ao converter token amount:', error);
    return BigInt(0);
  }
}

// Formata um bigint para string legível (remove 18 casas decimais)
export function formatTokenAmount(amount: bigint): string {
  try {
    // Converte o BigInt para string para evitar erros de precisão
    const amountStr = amount.toString();
    
    // Se o valor for menor que 10^18, precisamos adicionar zeros à esquerda
    if (amountStr.length <= 18) {
      const zeros = '0'.repeat(18 - amountStr.length);
      return `0.${zeros}${amountStr}`;
    }
    
    // Caso contrário, inserimos o ponto decimal na posição correta
    const integerPart = amountStr.slice(0, amountStr.length - 18);
    const decimalPart = amountStr.slice(-18);
    
    return `${integerPart}.${decimalPart}`.replace(/\.?0+$/, '');
  } catch (error) {
    console.error('Erro ao formatar token amount:', error);
    return '0.00';
  }
}

// Formata um endereço ethereum para exibição, truncando o meio
export function formatAddress(address: string, prefixLength: number = 6, suffixLength: number = 4): string {
  if (!address) return '';
  
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}