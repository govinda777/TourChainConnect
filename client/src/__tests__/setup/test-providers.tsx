import React, { createContext, useContext, useState } from 'react';

// Mock do contexto blockchain para testes
interface BlockchainContextType {
  isDevelopment: boolean;
  isBlockchainReady: boolean;
  areContractsReady: boolean;
  isWalletConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  walletAddress: string | null;
  tourTokenBalance: string;
  networkName: string;
}

const BlockchainContext = createContext<BlockchainContextType>({
  isDevelopment: true,
  isBlockchainReady: true,
  areContractsReady: true,
  isWalletConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  walletAddress: null,
  tourTokenBalance: '1000.00',
  networkName: 'localhost',
});

export const useBlockchain = () => useContext(BlockchainContext);

export const BlockchainProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  const connectWallet = async () => {
    setWalletAddress('0x1234...5678');
    setIsWalletConnected(true);
  };
  
  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress(null);
  };
  
  const value = {
    isDevelopment: true,
    isBlockchainReady: true,
    areContractsReady: true,
    isWalletConnected,
    connectWallet,
    disconnectWallet,
    walletAddress,
    tourTokenBalance: '1000.00',
    networkName: 'localhost',
  };
  
  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainProvider;