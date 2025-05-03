import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../lib/blockchain/providers/BlockchainProvider';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from './ui/sheet';
import { Badge } from './ui/badge';
import { useIsMobile } from '../hooks/use-mobile';

interface MobileWalletConnectProps {
  onConnect?: () => void;
  variant?: 'default' | 'connect-only';
}

export default function MobileWalletConnect({ 
  onConnect,
  variant = 'default'
}: MobileWalletConnectProps) {
  const { 
    isDevelopment, 
    isWalletConnected, 
    connectWallet,
    walletAddress
  } = useBlockchain();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Se conectar automaticamente quando em ambiente de desenvolvimento
  useEffect(() => {
    if (isDevelopment && !isWalletConnected && variant === 'connect-only') {
      connectWallet();
    }
  }, [isDevelopment, isWalletConnected, connectWallet, variant]);
  
  // Tratar a conexão da carteira
  const handleConnect = async () => {
    if (onConnect) {
      onConnect();
    }
    
    await connectWallet();
    setSheetOpen(false);
  };
  
  // Renderiza um botão simples para desktop ou dispositivos em modo de desenvolvimento
  if (!isMobile || isDevelopment) {
    if (variant === 'connect-only' && isWalletConnected) {
      return (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground cursor-default" disabled>
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : 'Conectado'}
        </Button>
      );
    }
    
    return (
      <Button 
        onClick={handleConnect} 
        variant={variant === 'connect-only' ? "outline" : "default"}
        size="sm"
        disabled={isWalletConnected}
        className={variant === 'connect-only' ? "text-xs" : ""}
      >
        {isWalletConnected ? (
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Conectado
          </span>
        ) : (
          <span className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="size-4 mr-2"
            >
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
            Conectar Carteira
          </span>
        )}
      </Button>
    );
  }
  
  // Renderiza um sheet com instruções para mobile
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button 
          variant={variant === 'connect-only' ? "outline" : "default"}
          size="sm"
          className={variant === 'connect-only' ? "text-xs" : ""}
        >
          {isWalletConnected ? (
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Conectado
            </span>
          ) : (
            <span className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="size-4 mr-2"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              Conectar Carteira
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Conectar com MetaMask</SheetTitle>
          <SheetDescription>
            Conecte sua carteira MetaMask para interagir com a blockchain.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
            <div className="flex items-center mb-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-amber-600"
              >
                <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
              </svg>
              <span className="ml-2 font-medium text-amber-800">Como conectar no celular</span>
            </div>
            <ol className="list-decimal text-sm pl-5 text-amber-700 space-y-2">
              <li>Instale o aplicativo <Badge variant="outline" className="font-bold">MetaMask</Badge> no seu celular</li>
              <li>Ao clicar em "Conectar MetaMask" abaixo, você será redirecionado ao aplicativo</li>
              <li>Aprove a conexão no MetaMask</li>
              <li>Você será retornado automaticamente a este aplicativo</li>
            </ol>
          </div>
        </div>
        
        <SheetFooter className="flex gap-3 pt-4">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button onClick={handleConnect}>
            <svg
              width="30"
              height="30"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M36.0873 0.277344L22.0871 13.1234L24.8153 6.022L36.0873 0.277344Z"
                fill="#E2761B"
                stroke="#E2761B"
                strokeWidth="0.412989"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.90137 0.277344L17.8051 13.2344L15.1851 6.022L3.90137 0.277344Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeWidth="0.412989"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30.8842 28.7051L27.0068 35.2693L35.3117 37.7472L37.7101 28.8436L30.8842 28.7051Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeWidth="0.412989"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.30078 28.8436L4.68753 37.7472L12.9924 35.2693L9.11501 28.7051L2.30078 28.8436Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeWidth="0.412989"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.4648 17.7266L10.0781 21.5764L18.3245 21.9814L18.0006 13.0972L12.4648 17.7266Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeWidth="0.412989"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.5236 17.7266L21.9101 12.9863L21.6953 21.9814L29.9138 21.5764L27.5236 17.7266Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeWidth="0.412989"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.9922 35.2691L17.7844 32.625L13.6399 28.8857L12.9922 35.2691Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeWidth="0.412989"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22.2031 32.625L27.0064 35.2691L26.3476 28.8857L22.2031 32.625Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeWidth="0.412989"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Conectar MetaMask
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}