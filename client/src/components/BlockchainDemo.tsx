import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBlockchain } from '@/lib/blockchain/providers/BlockchainProvider';
import { formatAddress } from '@/lib/blockchain/utils';
import { getAddressesForNetwork } from '@/lib/blockchain/contracts/addresses';
import useTourTokenBalance from '@/lib/blockchain/hooks/useTourTokenBalance';
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
  
  // Obtém o saldo de tokens diretamente no componente de demo
  const { 
    data: balance, 
    isLoading: isBalanceLoading, 
    error: balanceError,
    refetch: refetchBalance,
    contractAddress,
    hasContract
  } = useTourTokenBalance();
  
  const isMobile = useIsMobile();
  const [lastAction, setLastAction] = useState<string>('');
  const [currentTab, setCurrentTab] = useState('status');
  const [contractTestResult, setContractTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Obtém os endereços dos contratos para a rede atual
  const contractAddresses = getAddressesForNetwork(networkName);
  
  // Função para conectar carteira e registrar ação
  const handleConnect = async () => {
    setLastAction('Conectando carteira...');
    try {
      await connectWallet();
      setLastAction('Carteira conectada com sucesso');
    } catch (error: any) {
      setLastAction(`Erro ao conectar carteira: ${error.message || 'Erro desconhecido'}`);
    }
  };
  
  // Função para desconectar carteira e registrar ação
  const handleDisconnect = () => {
    setLastAction('Desconectando carteira...');
    try {
      disconnectWallet();
      setLastAction('Carteira desconectada com sucesso');
    } catch (error: any) {
      setLastAction(`Erro ao desconectar carteira: ${error.message || 'Erro desconhecido'}`);
    }
  };
  
  // Função para alternar modo e registrar ação
  const handleToggleMode = () => {
    setLastAction(`Alternando para modo ${isDevelopment ? 'produção' : 'desenvolvimento'}...`);
    toggleDevelopmentMode();
    setTimeout(() => {
      setLastAction(`Modo alterado para ${!isDevelopment ? 'produção' : 'desenvolvimento'}`);
    }, 500);
  };
  
  // Teste de conexão com o contrato de token
  const testTokenContractConnection = async () => {
    setLastAction('Testando conexão com contrato de token...');
    setContractTestResult(null);
    
    try {
      await refetchBalance();
      
      if (balanceError) {
        throw new Error(balanceError.message);
      }
      
      setContractTestResult({
        success: true,
        message: `Conexão bem-sucedida! Saldo atual: ${balance} TOUR`
      });
      
      setLastAction('Teste de contrato concluído com sucesso');
    } catch (error: any) {
      console.error('Erro no teste de contrato:', error);
      setContractTestResult({
        success: false,
        message: `Falha na conexão: ${error.message || 'Erro desconhecido'}`
      });
      setLastAction('Teste de contrato falhou');
    }
  };
  
  // Formatar o status em uma badge
  const renderStatusBadge = (status: boolean, label: string) => (
    <Badge variant={status ? "default" : "outline"} className={status ? "bg-green-500" : "bg-red-100 text-red-800"}>
      {status ? `${label} ✓` : `${label} ✗`}
    </Badge>
  );
  
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
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="status" className="flex-1">Status</TabsTrigger>
            <TabsTrigger value="contracts" className="flex-1">Contratos</TabsTrigger>
            {!isMobile && <TabsTrigger value="debug" className="flex-1">Debug</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            {/* Informações de Status */}
            <div className="rounded-md bg-indigo-50 p-3">
              <h3 className="text-sm font-medium text-indigo-900">Status da Integração</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-700">Modo:</span>
                  <Badge 
                    variant={isDevelopment ? "outline" : "default"}
                    className="cursor-pointer"
                    onClick={handleToggleMode}
                  >
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
                
                <div className="flex items-center justify-between">
                  <span className="text-indigo-700">Saldo:</span>
                  <span className={`font-medium ${isBalanceLoading ? 'animate-pulse' : ''}`}>
                    {isBalanceLoading ? 'Carregando...' : `${balance || '0.00'} TOUR`}
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
                  onConnect={handleConnect}
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
          </TabsContent>
          
          <TabsContent value="contracts" className="space-y-4">
            <div className="rounded-md bg-indigo-50 p-3">
              <h3 className="text-sm font-medium text-indigo-900 mb-2">Contratos Inteligentes</h3>
              
              <div className="text-xs space-y-3">
                <div className="grid grid-cols-[30%_70%] gap-1">
                  <div className="font-medium text-indigo-700">TourToken:</div>
                  <div className="font-mono text-[10px] truncate">
                    {contractAddresses.tourToken}
                  </div>
                  
                  <div className="font-medium text-indigo-700">TourStaking:</div>
                  <div className="font-mono text-[10px] truncate">
                    {contractAddresses.tourStaking}
                  </div>
                  
                  <div className="font-medium text-indigo-700">TourCrowdfunding:</div>
                  <div className="font-mono text-[10px] truncate">
                    {contractAddresses.tourCrowdfunding}
                  </div>
                  
                  <div className="font-medium text-indigo-700">TourOracle:</div>
                  <div className="font-mono text-[10px] truncate">
                    {contractAddresses.tourOracle}
                  </div>
                  
                  <div className="font-medium text-indigo-700">CarbonOffset:</div>
                  <div className="font-mono text-[10px] truncate">
                    {contractAddresses.carbonOffset}
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={testTokenContractConnection}
                    disabled={isBalanceLoading || !isWalletConnected}
                  >
                    {isBalanceLoading ? 'Testando...' : 'Testar Conexão com TourToken'}
                  </Button>
                  
                  {contractTestResult && (
                    <Alert variant={contractTestResult.success ? "default" : "destructive"} className="mt-2">
                      <AlertTitle>{contractTestResult.success ? 'Teste bem-sucedido' : 'Falha no teste'}</AlertTitle>
                      <AlertDescription className="text-xs">
                        {contractTestResult.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
            
            <div className="rounded-md border p-3">
              <h3 className="text-sm font-medium mb-2">Detalhes da Conexão</h3>
              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span>TourToken disponível:</span>
                  {renderStatusBadge(hasContract, 'Contrato')}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Saldo carregado:</span>
                  {renderStatusBadge(!isBalanceLoading && balance !== undefined, 'Dados')}
                </div>
                
                {balanceError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTitle>Erro no contrato</AlertTitle>
                    <AlertDescription className="text-xs">
                      {balanceError.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="debug" className="space-y-4">
            <div className="rounded-md border p-3">
              <h3 className="text-sm font-medium mb-2">Informações de Debug</h3>
              
              <ScrollArea className="h-[180px] rounded border p-2">
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Ambiente:</strong> {process.env.NODE_ENV || 'não definido'}
                  </div>
                  <div>
                    <strong>Modo Blockchain:</strong> {isDevelopment ? 'Desenvolvimento (Mock)' : 'Produção'}
                  </div>
                  <div>
                    <strong>Rede:</strong> {networkName}
                  </div>
                  <div>
                    <strong>Carteira:</strong> {walletAddress || 'Não conectada'}
                  </div>
                  <div>
                    <strong>Contrato TourToken:</strong> <span className="font-mono">{contractAddresses.tourToken}</span>
                  </div>
                  <div>
                    <strong>Estado de Conexão:</strong><br />
                    - Blockchain Pronta: {isBlockchainReady ? 'Sim' : 'Não'}<br />
                    - Contratos Prontos: {areContractsReady ? 'Sim' : 'Não'}<br />
                    - Carteira Conectada: {isWalletConnected ? 'Sim' : 'Não'}<br />
                    - Contrato Disponível: {hasContract ? 'Sim' : 'Não'}<br />
                  </div>
                  <div>
                    <strong>Última Ação:</strong> {lastAction || 'Nenhuma'}
                  </div>
                </div>
              </ScrollArea>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => console.log('Estado completo:', {
                isDevelopment,
                isBlockchainReady,
                areContractsReady,
                isWalletConnected,
                walletAddress,
                networkName,
                contractAddresses,
                balance,
                hasContract
              })}
            >
              Mostrar Estado no Console
            </Button>
          </TabsContent>
        </Tabs>
        
        {/* Logs de Ação */}
        {lastAction && (
          <Alert variant="default" className="bg-muted/50 mt-4">
            <AlertTitle>Última Ação</AlertTitle>
            <AlertDescription>
              {lastAction}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="bg-indigo-500/5 pt-2 text-xs text-muted-foreground flex justify-between">
        <span>Transparência através da blockchain</span>
        <span>TourChain</span>
      </CardFooter>
    </Card>
  );
}