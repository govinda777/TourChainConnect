// ethereum.d.ts - Declarações de tipos para Ethereum/Web3 no navegador

interface Window {
  ethereum: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, callback: (...args: any[]) => void) => void;
    removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
    removeAllListeners: (eventName: string) => void;
    isConnected: () => boolean;
    selectedAddress: string | null;
    chainId: string | null;
    networkVersion: string | null;
    _metamask?: {
      isUnlocked: () => Promise<boolean>;
    };
  };
}