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
  // Função para alternar entre modo desenvolvimento e produção
  toggleDevelopmentMode: () => void;
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
  toggleDevelopmentMode: () => {},
});

// Hook para usar o contexto de blockchain em componentes
export const useBlockchain = () => useContext(BlockchainContext);

// Provider para fornecer o contexto de blockchain para a aplicação
export const BlockchainProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Estados para gerenciar a conexão com a blockchain
  // Permite forçar modo de produção para testar a integração real com a blockchain
  // mesmo em ambiente de desenvolvimento
  const [isDevelopment, setIsDevelopment] = useState<boolean>(
    (process.env.NODE_ENV === 'development' || import.meta.env.DEV) && 
    !import.meta.env.VITE_FORCE_REAL_BLOCKCHAIN
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

  // Detecta se está em um ambiente mobile
  const isMobileDevice = () => {
    return (
      typeof window !== 'undefined' && 
      (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
      )
    );
  };

  // Verifica se o MetaMask está disponível
  const isMetaMaskAvailable = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Redireciona para o deep link do MetaMask em dispositivos móveis
  const openMetaMaskMobile = () => {
    // URL da sua aplicação para o callback
    const callbackUrl = encodeURIComponent(window.location.href);
    // Formatamos a URL de deep link para o MetaMask
    const deepLink = `https://metamask.app.link/dapp/${window.location.host}/?${callbackUrl}`;
    window.location.href = deepLink;
  };

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

    // Verifica se está em dispositivo móvel
    const mobileDevice = isMobileDevice();
    
    try {
      if (mobileDevice && !isMetaMaskAvailable()) {
        // Em mobile sem MetaMask detectado, redirecionamos para o app
        console.log('Dispositivo móvel detectado, redirecionando para MetaMask app');
        openMetaMaskMobile();
        return;
      } else if (!isMetaMaskAvailable()) {
        console.error('MetaMask não detectado');
        throw new Error('Carteira MetaMask não encontrada. Por favor, instale a extensão ou use o aplicativo MetaMask.');
      }
      
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
  
  // Função para alternar entre modo de desenvolvimento e produção
  const toggleDevelopmentMode = () => {
    const newMode = !isDevelopment;
    console.log(`Alterando para modo ${newMode ? 'desenvolvimento' : 'produção'}`);
    setIsDevelopment(newMode);
    
    // Resetar estado
    setIsBlockchainReady(false);
    setAreContractsReady(false);
    setIsWalletConnected(false);
    setWalletAddress(null);
    setTourTokenBalance('0');
    
    // Reiniciar o processo após 100ms para garantir que o estado foi atualizado
    setTimeout(() => {
      if (newMode) {
        // Modo desenvolvimento
        setIsBlockchainReady(true);
        setTimeout(() => {
          setAreContractsReady(true);
        }, 500);
      } else {
        // Modo produção - iniciar conexão de carteira
        if (typeof window !== 'undefined' && window.ethereum) {
          setIsBlockchainReady(true);
          setAreContractsReady(true);
        }
      }
    }, 100);
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
    toggleDevelopmentMode, // Nova função para alternar modo
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainProvider;