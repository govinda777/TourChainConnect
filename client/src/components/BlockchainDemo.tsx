import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBlockchain } from '@/lib/blockchain/providers/BlockchainProvider';
import { formatAddress } from '@/lib/blockchain/utils';
import MobileWalletConnect from './MobileWalletConnect';
import { useIsMobile } from '../hooks/use-mobile';

/**
 * Componente para demonstrar e testar a integração com a blockchain
 * Permite alternar entre modo de desenvolvimento e produção
 */
export default function BlockchainDemo() {
  const { 
    isDevelopment, 
    isBlockchainReady, 
    areContractsReady,
    isWalletConnected,
    walletAddress,
    networkName,
    connectWallet,
    disconnectWallet,
    toggleDevelopmentMode
  } = useBlockchain();
  
  const isMobile = useIsMobile();
  const [lastAction, setLastAction] = useState<string>('');
  
  // Função para conectar carteira e registrar ação
  const handleConnect = async () => {
    setLastAction('Conectando carteira...');
    await connectWallet();
    setLastAction('Carteira conectada');
  };
  
  // Função para desconectar carteira e registrar ação
  const handleDisconnect = () => {
    setLastAction('Desconectando carteira...');
    disconnectWallet();
    setLastAction('Carteira desconectada');
  };
  
  // Função para alternar modo e registrar ação
  const handleToggleMode = () => {
    setLastAction(`Alternando para modo ${isDevelopment ? 'produção' : 'desenvolvimento'}...`);
    toggleDevelopmentMode();
    setTimeout(() => {
      setLastAction(`Modo alterado para ${!isDevelopment ? 'produção' : 'desenvolvimento'}`);
    }, 500);
  };
  
  return (
    <Card className="mb-6 overflow-hidden border-2 border-indigo-500/20 bg-indigo-500/5">
      <CardHeader className="bg-indigo-500/10 pb-4">
        <CardTitle className="flex items-center text-xl">
          <span className="mr-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="size-5 text-indigo-500"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" x2="21" y1="9" y2="9" />
              <line x1="9" x2="9" y1="21" y2="9" />
            </svg>
          </span>
          Demonstração da Integração Blockchain
        </CardTitle>
        <CardDescription>Configure e teste a conexão com a blockchain</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Informações de Status */}
          <div className="rounded-md bg-indigo-50 p-3">
            <h3 className="text-sm font-medium text-indigo-900">Status da Integração</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-indigo-700">Modo:</span>
                <Badge variant={isDevelopment ? "outline" : "default"}>
                  {isDevelopment ? 'Desenvolvimento (Simulado)' : 'Produção (Real)'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-indigo-700">Blockchain:</span>
                <Badge variant={isBlockchainReady ? "default" : "destructive"} className={isBlockchainReady ? "bg-green-500" : ""}>
                  {isBlockchainReady ? 'Pronta' : 'Não Inicializada'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-indigo-700">Contratos:</span>
                <Badge variant={areContractsReady ? "default" : "destructive"} className={areContractsReady ? "bg-green-500" : ""}>
                  {areContractsReady ? 'Prontos' : 'Não Inicializados'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-indigo-700">Carteira:</span>
                <Badge variant={isWalletConnected ? "default" : "destructive"} className={isWalletConnected ? "bg-green-500" : ""}>
                  {isWalletConnected ? 'Conectada' : 'Desconectada'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-indigo-700">Rede:</span>
                <Badge variant="secondary">{networkName}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-indigo-700">Endereço:</span>
                <span className="font-mono text-xs">
                  {walletAddress ? formatAddress(walletAddress) : '-'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Configuração de Modo */}
          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mode-toggle">Modo de Desenvolvimento</Label>
                <p className="text-xs text-muted-foreground">
                  Alterna entre dados simulados e dados reais da blockchain
                </p>
              </div>
              <Switch 
                id="mode-toggle" 
                checked={isDevelopment}
                onCheckedChange={handleToggleMode}
              />
            </div>
          </div>
          
          {/* Ações da Carteira */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Ações da Carteira</h3>
            <div className="flex gap-2">
              {/* Uso do componente MobileWalletConnect para melhor experiência mobile */}
              <MobileWalletConnect 
                onConnect={() => setLastAction('Conectando carteira...')}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={!isWalletConnected}
              >
                Desconectar Carteira
              </Button>
            </div>
            
            {/* Instruções condicionais - mostradas apenas em desktop */}
            {!isMobile && (
              <div className="text-xs text-muted-foreground mt-2 bg-indigo-50 p-2 rounded border border-indigo-200">
                <p className="font-medium text-indigo-800 mb-1">Acesso à Blockchain:</p>
                <ul className="list-disc pl-4 text-indigo-700 space-y-1">
                  <li>Instale a extensão MetaMask para o seu navegador</li>
                  <li>Crie ou importe uma carteira</li>
                  <li>Conecte-se à rede {networkName}</li>
                  <li>Use o botão acima para conectar sua carteira</li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Logs de Ação */}
          {lastAction && (
            <Alert variant="default" className="bg-muted/50">
              <AlertTitle>Última Ação</AlertTitle>
              <AlertDescription>
                {lastAction}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-indigo-500/5 pt-2 text-xs text-muted-foreground flex justify-between">
        <span>Transparência através da blockchain</span>
        <span>TourChain</span>
      </CardFooter>
    </Card>
  );
}