// Este arquivo exporta todos os módulos relacionados à blockchain para facilitar a importação

// Futuros imports
// export * from './contracts/abis';
// export * from './contracts/addresses';
// export * from './hooks/useTourToken';
// export * from './hooks/useTourStaking';
// export * from './hooks/useTourCrowdfunding';
// export * from './hooks/useTourOracle';
// export * from './hooks/useCarbonOffset';
// export * from './providers/BlockchainProvider';

// Configurações temporárias para integração futura
export const BLOCKCHAIN_CONFIG = {
  networkName: import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'localhost',
  infuraApiKey: import.meta.env.VITE_INFURA_API_KEY,
  contractAddresses: {
    // Endereços a serem preenchidos após o deploy
    tourToken: '',
    tourStaking: '',
    tourCrowdfunding: '',
    tourOracle: '',
    carbonOffset: ''
  }
};

// Função utilitária temporária para conversão de valores para a blockchain
export function parseTokenAmount(amount: string | number): bigint {
  return BigInt(Math.floor(Number(amount) * 10**18));
}

// Função utilitária temporária para formatação de valores da blockchain
export function formatTokenAmount(amount: bigint): string {
  return (Number(amount) / 10**18).toFixed(2);
}

// Mensagem temporária até a integração completa
console.log('Blockchain module loaded. Integration with smart contracts pending deployment.');