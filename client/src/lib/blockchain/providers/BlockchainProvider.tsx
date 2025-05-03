import React, { createContext, useContext, useState, useEffect } from 'react';

// Definimos uma interface tipada para o contexto de blockchain
interface BlockchainContextType {
  // Estado indicando se estamos em ambiente de desenvolvimento
  isDevelopment: boolean;
  // Estado indicando se a conexão com a blockchain está pronta
  isBlockchainReady: boolean;
  // Estado indicando se os contratos estão prontos para uso
  areContractsReady: boolean;
  // Estado indicando se o usuário está conectado com uma carteira
  isWalletConnected: boolean;
  // Função para conectar carteira
  connectWallet: () => Promise<void>;
  // Função para desconectar carteira
  disconnectWallet: () => void;
  // Endereço da carteira conectada
  walletAddress: string | null;
  // Saldo em tokens TOUR (formado como string)
  tourTokenBalance: string;
  // Nome da rede conectada
  networkName: string;
}

// Cria um contexto para os dados de blockchain
const BlockchainContext = createContext<BlockchainContextType>({
  isDevelopment: true,
  isBlockchainReady: false,
  areContractsReady: false,
  isWalletConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  walletAddress: null,
  tourTokenBalance: '0',
  networkName: 'development',
});

// Hook para usar o contexto de blockchain em componentes
export const useBlockchain = () => useContext(BlockchainContext);

// Provider para fornecer o contexto de blockchain para a aplicação
export const BlockchainProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Estados para gerenciar a conexão com a blockchain
  const [isDevelopment] = useState<boolean>(
    process.env.NODE_ENV === 'development' || import.meta.env.DEV
  );
  const [isBlockchainReady, setIsBlockchainReady] = useState<boolean>(false);
  const [areContractsReady, setAreContractsReady] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tourTokenBalance, setTourTokenBalance] = useState<string>('0');
  const [networkName, setNetworkName] = useState<string>(
    import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'development'
  );

  // Efeito para inicializar a conexão com a blockchain
  useEffect(() => {
    const initBlockchain = async () => {
      try {
        // Verificar se temos Web3 injetado (como MetaMask)
        const hasWeb3 = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
        
        // Em desenvolvimento, fingimos que tudo está pronto
        if (isDevelopment) {
          console.log('Executando em ambiente de desenvolvimento, simulando blockchain...');
          setIsBlockchainReady(true);
          
          // Simula que os contratos estão prontos após 1 segundo
          setTimeout(() => {
            setAreContractsReady(true);
            console.log('Contratos simulados prontos para uso em ambiente de desenvolvimento');
          }, 1000);
          
          return;
        }
        
        if (!hasWeb3) {
          console.warn('Web3 não encontrado. MetaMask ou carteira compatível é necessária.');
          return;
        }
        
        // Registrar que a blockchain está pronta
        setIsBlockchainReady(true);
        console.log('Blockchain pronta para conexão');
        
        // Verificar se o usuário já tem uma carteira conectada
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          console.log('Carteira já conectada:', accounts[0]);
        }
        
        // Eventos de mudança de conta
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            // Usuário desconectou a carteira
            setIsWalletConnected(false);
            setWalletAddress(null);
            console.log('Carteira desconectada');
          } else {
            // Mudou para outra conta
            setWalletAddress(accounts[0]);
            setIsWalletConnected(true);
            console.log('Carteira alterada para:', accounts[0]);
          }
        });
        
        // Eventos de mudança de rede
        window.ethereum.on('chainChanged', (chainId: string) => {
          // Recarrega a página quando a rede muda
          window.location.reload();
        });
        
        // Obter a rede atual
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        let currentNetwork = 'unknown';
        
        // Mapear IDs de rede para nomes
        switch (chainId) {
          case '0x1':
            currentNetwork = 'mainnet';
            break;
          case '0xaa36a7':
            currentNetwork = 'sepolia';
            break;
          case '0x13881':
            currentNetwork = 'polygon_mumbai';
            break;
          case '0x539':
            currentNetwork = 'localhost';
            break;
          default:
            currentNetwork = 'unknown';
        }
        
        setNetworkName(currentNetwork);
        console.log('Rede conectada:', currentNetwork);
        
        // Verificar se os contratos foram deployados
        // Posteriormente, isso verificará se os endereços existem
        setAreContractsReady(true);
        
      } catch (error) {
        console.error('Erro ao inicializar blockchain:', error);
      }
    };
    
    initBlockchain();
    
    // Limpar listeners ao desmontar
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [isDevelopment]);

  // Função para conectar carteira
  const connectWallet = async () => {
    if (!isBlockchainReady) {
      console.warn('Blockchain não está pronta para conexão');
      return;
    }
    
    // Em ambiente de desenvolvimento, simular conexão
    if (isDevelopment) {
      console.log('Ambiente de desenvolvimento: simulando conexão de carteira');
      setWalletAddress('0x1234...5678');
      setIsWalletConnected(true);
      setTourTokenBalance('1000.00');
      return;
    }
    
    try {
      // Solicitar acesso às contas
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        console.log('Carteira conectada:', accounts[0]);
        
        // Aqui seria o lugar para carregar o saldo de tokens TOUR
        // setTourTokenBalance(...);
      }
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
    }
  };

  // Função para desconectar carteira
  const disconnectWallet = () => {
    // Não é possível desconectar programaticamente com MetaMask,
    // mas podemos limpar o estado local
    setIsWalletConnected(false);
    setWalletAddress(null);
    setTourTokenBalance('0');
    console.log('Estado de conexão de carteira resetado');
  };

  const value = {
    isDevelopment,
    isBlockchainReady,
    areContractsReady,
    isWalletConnected,
    connectWallet,
    disconnectWallet,
    walletAddress,
    tourTokenBalance,
    networkName,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainProvider;