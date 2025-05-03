# Integração dos Smart Contracts com o Frontend

Este documento descreve como integrar os smart contracts da TourChain com o frontend da aplicação.

## Configuração Inicial

### 1. Instalar Dependências

Certifique-se de que as seguintes dependências estão instaladas:

```bash
# Já instaladas no projeto
# ethers (para interagir com a blockchain)
# @tanstack/react-query (para gerenciar estados e requisições)
```

### 2. Configuração de Ambiente

Crie um arquivo `.env` na raiz do projeto (se ainda não existir) e adicione as seguintes variáveis:

```
VITE_BLOCKCHAIN_NETWORK=localhost
VITE_INFURA_API_KEY=sua_chave_api_infura
```

## Estrutura de Integração

Recomendamos a seguinte estrutura de arquivos para a integração com o frontend:

```
client/src/
├── lib/
│   ├── blockchain/
│   │   ├── contracts/          # ABIs e endereços dos contratos
│   │   ├── hooks/              # Custom hooks para interagir com os contratos
│   │   ├── providers/          # Providers para conexão com a blockchain
│   │   └── utils.ts            # Utilitários para blockchain
│   └── ...
└── ...
```

## Configuração dos ABIs e Endereços

Após o deploy dos contratos, você precisará dos ABIs (Application Binary Interface) e endereços dos contratos. Crie os seguintes arquivos:

### `client/src/lib/blockchain/contracts/addresses.ts`

```typescript
// Endereços de contratos por rede
export const CONTRACT_ADDRESSES: Record<string, Record<string, string>> = {
  // Ambiente local
  localhost: {
    tourToken: "0x...",
    tourStaking: "0x...",
    tourCrowdfunding: "0x...",
    tourOracle: "0x...",
    carbonOffset: "0x..."
  },
  // Testnet Sepolia
  sepolia: {
    tourToken: "0x...",
    tourStaking: "0x...",
    tourCrowdfunding: "0x...",
    tourOracle: "0x...",
    carbonOffset: "0x..."
  }
};

// Função para obter o endereço do contrato com base na rede atual
export function getContractAddress(contractName: string, network = import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'localhost'): string {
  if (!CONTRACT_ADDRESSES[network] || !CONTRACT_ADDRESSES[network][contractName]) {
    throw new Error(`Endereço do contrato ${contractName} não encontrado para a rede ${network}`);
  }
  return CONTRACT_ADDRESSES[network][contractName];
}
```

### `client/src/lib/blockchain/contracts/abis.ts`

```typescript
// Importe os ABIs gerados pelo Hardhat (após o deploy)
// Estes serão gerados em contracts/artifacts/contracts/*/.../*.json
export const TOUR_TOKEN_ABI = [...]; // Substitua pelo ABI real
export const TOUR_STAKING_ABI = [...]; // Substitua pelo ABI real
export const TOUR_CROWDFUNDING_ABI = [...]; // Substitua pelo ABI real
export const TOUR_ORACLE_ABI = [...]; // Substitua pelo ABI real
export const CARBON_OFFSET_ABI = [...]; // Substitua pelo ABI real
```

## Provider de Blockchain

Crie um provider para conectar com a blockchain:

### `client/src/lib/blockchain/providers/BlockchainProvider.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface BlockchainContextType {
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  network: ethers.Network | null;
  account: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const BlockchainContext = createContext<BlockchainContextType>({
  provider: null,
  signer: null,
  network: null,
  account: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {}
});

export const useBlockchain = () => useContext(BlockchainContext);

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [network, setNetwork] = useState<ethers.Network | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Inicializa o provider
  useEffect(() => {
    const initProvider = async () => {
      // Usando Infura como provider
      const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY;
      const network = import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'localhost';
      
      let provider;
      
      if (network === 'localhost') {
        provider = new ethers.JsonRpcProvider('http://localhost:8545');
      } else {
        provider = new ethers.InfuraProvider(network, infuraApiKey);
      }
      
      setProvider(provider);
      
      try {
        const network = await provider.getNetwork();
        setNetwork(network);
      } catch (error) {
        console.error('Erro ao conectar com a rede blockchain:', error);
      }
    };
    
    initProvider();
  }, []);

  // Função para conectar carteira (usando browser provider como MetaMask)
  const connect = async () => {
    if (!window.ethereum) {
      alert('Por favor, instale MetaMask para usar esta funcionalidade');
      return;
    }
    
    try {
      // Solicita contas ao usuário
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        
        setProvider(browserProvider);
        setSigner(signer);
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Atualiza o signer quando a conta é alterada
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            disconnect();
          } else {
            setAccount(accounts[0]);
            browserProvider.getSigner().then(setSigner);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao conectar com MetaMask:', error);
    }
  };

  // Função para desconectar
  const disconnect = () => {
    setSigner(null);
    setAccount(null);
    setIsConnected(false);
  };

  return (
    <BlockchainContext.Provider value={{
      provider,
      signer,
      network,
      account,
      isConnected,
      connect,
      disconnect
    }}>
      {children}
    </BlockchainContext.Provider>
  );
};
```

## Hooks para os Contratos

Crie hooks personalizados para interagir com cada contrato:

### `client/src/lib/blockchain/hooks/useTourToken.ts`

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useBlockchain } from '../providers/BlockchainProvider';
import { TOUR_TOKEN_ABI } from '../contracts/abis';
import { getContractAddress } from '../contracts/addresses';

export function useTourToken() {
  const { provider, signer, account, isConnected } = useBlockchain();

  const getContract = (withSigner = false) => {
    if (!provider) return null;
    
    const address = getContractAddress('tourToken');
    return new ethers.Contract(
      address,
      TOUR_TOKEN_ABI,
      withSigner && signer ? signer : provider
    );
  };

  // Query para obter o saldo de tokens
  const useTokenBalance = (address?: string) => {
    const targetAddress = address || account;
    
    return useQuery({
      queryKey: ['tourToken', 'balance', targetAddress],
      queryFn: async () => {
        if (!provider || !targetAddress) return '0';
        
        const contract = getContract();
        if (!contract) return '0';
        
        const balance = await contract.balanceOf(targetAddress);
        return ethers.formatEther(balance);
      },
      enabled: !!provider && !!targetAddress
    });
  };

  // Mutação para transferir tokens
  const useTransferTokens = () => {
    return useMutation({
      mutationFn: async ({ to, amount }: { to: string; amount: string }) => {
        if (!signer || !isConnected) {
          throw new Error('Carteira não conectada');
        }
        
        const contract = getContract(true);
        if (!contract) {
          throw new Error('Contrato não inicializado');
        }
        
        const tx = await contract.transfer(to, ethers.parseEther(amount));
        return tx.wait();
      }
    });
  };

  // Mutação para aprovar um contrato a gastar tokens
  const useApproveTokens = () => {
    return useMutation({
      mutationFn: async ({ spender, amount }: { spender: string; amount: string }) => {
        if (!signer || !isConnected) {
          throw new Error('Carteira não conectada');
        }
        
        const contract = getContract(true);
        if (!contract) {
          throw new Error('Contrato não inicializado');
        }
        
        const tx = await contract.approve(spender, ethers.parseEther(amount));
        return tx.wait();
      }
    });
  };

  return {
    useTokenBalance,
    useTransferTokens,
    useApproveTokens,
    getContract
  };
}
```

### `client/src/lib/blockchain/hooks/useTourCrowdfunding.ts`

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useBlockchain } from '../providers/BlockchainProvider';
import { TOUR_CROWDFUNDING_ABI } from '../contracts/abis';
import { getContractAddress } from '../contracts/addresses';
import { useTourToken } from './useTourToken';

export function useTourCrowdfunding() {
  const { provider, signer, account, isConnected } = useBlockchain();
  const { useApproveTokens } = useTourToken();
  const { mutateAsync: approveTokens } = useApproveTokens();

  const getContract = (withSigner = false) => {
    if (!provider) return null;
    
    const address = getContractAddress('tourCrowdfunding');
    return new ethers.Contract(
      address,
      TOUR_CROWDFUNDING_ABI,
      withSigner && signer ? signer : provider
    );
  };

  // Query para obter uma campanha
  const useCampaign = (campaignId?: number) => {
    return useQuery({
      queryKey: ['tourCrowdfunding', 'campaign', campaignId],
      queryFn: async () => {
        if (!provider || !campaignId) return null;
        
        const contract = getContract();
        if (!contract) return null;
        
        const campaign = await contract.campaigns(campaignId);
        return campaign;
      },
      enabled: !!provider && !!campaignId
    });
  };

  // Query para obter recompensas de uma campanha
  const useCampaignRewards = (campaignId?: number) => {
    return useQuery({
      queryKey: ['tourCrowdfunding', 'rewards', campaignId],
      queryFn: async () => {
        if (!provider || !campaignId) return [];
        
        const contract = getContract();
        if (!contract) return [];
        
        const rewardIds = await contract.getCampaignRewardTiers(campaignId);
        
        const rewards = await Promise.all(
          rewardIds.map(async (id: number) => {
            const reward = await contract.campaignRewardTiers(campaignId, id);
            return reward;
          })
        );
        
        return rewards;
      },
      enabled: !!provider && !!campaignId
    });
  };

  // Mutação para criar uma campanha
  const useCreateCampaign = () => {
    return useMutation({
      mutationFn: async ({ 
        title, 
        description, 
        fundingGoal, 
        durationInDays 
      }: { 
        title: string; 
        description: string; 
        fundingGoal: string; 
        durationInDays: number 
      }) => {
        if (!signer || !isConnected) {
          throw new Error('Carteira não conectada');
        }
        
        const contract = getContract(true);
        if (!contract) {
          throw new Error('Contrato não inicializado');
        }
        
        const tx = await contract.createCampaign(
          title,
          description,
          ethers.parseEther(fundingGoal),
          durationInDays
        );
        
        return tx.wait();
      }
    });
  };

  // Mutação para fazer um pledge
  const usePledge = () => {
    return useMutation({
      mutationFn: async ({ 
        campaignId, 
        amount, 
        rewardTierId, 
        name, 
        email, 
        comment, 
        isAnonymous 
      }: { 
        campaignId: number; 
        amount: string; 
        rewardTierId: number; 
        name: string; 
        email: string; 
        comment: string; 
        isAnonymous: boolean 
      }) => {
        if (!signer || !isConnected) {
          throw new Error('Carteira não conectada');
        }
        
        const contract = getContract(true);
        if (!contract) {
          throw new Error('Contrato não inicializado');
        }
        
        // Primeiro, aprovar o contrato para gastar tokens
        const crowdfundingAddress = getContractAddress('tourCrowdfunding');
        await approveTokens({ 
          spender: crowdfundingAddress, 
          amount 
        });
        
        // Depois, fazer o pledge
        const tx = await contract.pledge(
          campaignId,
          ethers.parseEther(amount),
          rewardTierId,
          name,
          email,
          comment,
          isAnonymous
        );
        
        return tx.wait();
      }
    });
  };

  return {
    useCampaign,
    useCampaignRewards,
    useCreateCampaign,
    usePledge,
    getContract
  };
}
```

## Integração com Componentes React

Aqui está um exemplo de como usar os hooks em componentes React:

### Exemplo: Componente de Saldo de Tokens

```tsx
import React from 'react';
import { useTourToken } from '../lib/blockchain/hooks/useTourToken';
import { useBlockchain } from '../lib/blockchain/providers/BlockchainProvider';

export function TokenBalance() {
  const { useTokenBalance } = useTourToken();
  const { account, isConnected, connect } = useBlockchain();
  
  const { data: balance, isLoading } = useTokenBalance();
  
  if (!isConnected) {
    return (
      <div className="p-4 border rounded">
        <p>Conecte sua carteira para ver seu saldo de tokens</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={connect}
        >
          Conectar Carteira
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold">Saldo de Tokens TOUR</h2>
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <p className="text-2xl">{balance} TOUR</p>
      )}
      <p className="text-sm text-gray-500">Carteira: {account}</p>
    </div>
  );
}
```

### Exemplo: Componente de Campanha de Crowdfunding

```tsx
import React from 'react';
import { useTourCrowdfunding } from '../lib/blockchain/hooks/useTourCrowdfunding';
import { useBlockchain } from '../lib/blockchain/providers/BlockchainProvider';

export function CampaignDetail({ campaignId }: { campaignId: number }) {
  const { useCampaign, useCampaignRewards, usePledge } = useTourCrowdfunding();
  const { isConnected, connect } = useBlockchain();
  
  const { data: campaign, isLoading: isLoadingCampaign } = useCampaign(campaignId);
  const { data: rewards, isLoading: isLoadingRewards } = useCampaignRewards(campaignId);
  
  const { mutate: pledge, isPending: isPledging } = usePledge();
  
  const [selectedReward, setSelectedReward] = React.useState<number | null>(null);
  const [pledgeAmount, setPledgeAmount] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  
  const handlePledge = () => {
    if (!isConnected) {
      connect();
      return;
    }
    
    pledge({
      campaignId,
      amount: pledgeAmount,
      rewardTierId: selectedReward || 0,
      name,
      email,
      comment,
      isAnonymous
    }, {
      onSuccess: () => {
        alert('Pledge realizado com sucesso!');
        // Limpar formulário
        setPledgeAmount('');
        setSelectedReward(null);
        setName('');
        setEmail('');
        setComment('');
        setIsAnonymous(false);
      },
      onError: (error) => {
        alert(`Erro ao fazer pledge: ${error}`);
      }
    });
  };
  
  if (isLoadingCampaign || isLoadingRewards) {
    return <div>Carregando...</div>;
  }
  
  if (!campaign) {
    return <div>Campanha não encontrada</div>;
  }
  
  return (
    <div className="p-4 border rounded">
      <h1 className="text-2xl font-bold">{campaign.title}</h1>
      <p className="my-2">{campaign.description}</p>
      
      <div className="my-4">
        <p>Meta: {ethers.formatEther(campaign.fundingGoal)} TOUR</p>
        <p>Arrecadado: {ethers.formatEther(campaign.totalFunds)} TOUR</p>
        <p>Apoiadores: {campaign.numberOfBackers.toString()}</p>
        <p>Status: {
          campaign.status === 0 ? 'Ativa' :
          campaign.status === 1 ? 'Bem-sucedida' :
          campaign.status === 2 ? 'Falhou' : 'Cancelada'
        }</p>
      </div>
      
      <h2 className="text-xl font-bold mt-6">Recompensas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        {rewards.map((reward) => (
          <div 
            key={reward.id.toString()} 
            className={`p-4 border rounded cursor-pointer ${selectedReward === reward.id ? 'border-blue-500 bg-blue-50' : ''}`}
            onClick={() => {
              setSelectedReward(reward.id);
              setPledgeAmount(ethers.formatEther(reward.minimumAmount));
            }}
          >
            <h3 className="font-bold">{reward.title}</h3>
            <p>{reward.description}</p>
            <p className="font-bold mt-2">Mínimo: {ethers.formatEther(reward.minimumAmount)} TOUR</p>
            <p>Tokens TOUR: {reward.tokenAmount.toString()}</p>
            <p>Reclamados: {reward.claimed.toString()}/{reward.limit.toString() || 'Ilimitado'}</p>
          </div>
        ))}
      </div>
      
      <h2 className="text-xl font-bold mt-6">Faça seu Pledge</h2>
      <div className="my-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Valor (TOUR)</label>
          <input
            type="text"
            value={pledgeAmount}
            onChange={(e) => setPledgeAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Ex: 100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Seu nome"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Comentário</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Seu comentário (opcional)"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="anonymous">Permanecer anônimo</label>
        </div>
        
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={handlePledge}
          disabled={isPledging || !pledgeAmount}
        >
          {isPledging ? 'Processando...' : isConnected ? 'Apoiar Projeto' : 'Conectar Carteira'}
        </button>
      </div>
    </div>
  );
}
```

## Utilização na Aplicação

Para utilizar os providers e hooks na aplicação, envolva o componente principal com o BlockchainProvider:

### `client/src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { BlockchainProvider } from './lib/blockchain/providers/BlockchainProvider';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BlockchainProvider>
        <App />
      </BlockchainProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
```

## Conclusão

Esta documentação fornece um guia para integrar os smart contracts da TourChain com o frontend da aplicação. Siga os passos descritos acima para configurar a conexão com a blockchain, interagir com os contratos e criar componentes React que utilizem essas funcionalidades.

Lembre-se de atualizar os endereços dos contratos e ABIs após cada deploy.