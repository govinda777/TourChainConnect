import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from '@/lib/blockchain/providers/BlockchainProvider';
import useTourTokenBalance from '@/lib/blockchain/hooks/useTourTokenBalance';
import { getAddressesForNetwork } from '@/lib/blockchain/contracts/addresses';

interface TokenBalanceDisplayProps {
  showConnectButton?: boolean;
  onContribution?: (amount: string) => void;
  contributionAmount?: string;
  showDebugInfo?: boolean;
}

/**
 * Componente para exibir o saldo de tokens TOUR e alterações após contribuições
 */
export default function TokenBalanceDisplay({ 
  showConnectButton = true,
  onContribution,
  contributionAmount,
  showDebugInfo = true
}: TokenBalanceDisplayProps) {
  const { 
    isWalletConnected, 
    walletAddress, 
    connectWallet, 
    isDevelopment,
    isBlockchainReady,
    areContractsReady,
    networkName,
    toggleDevelopmentMode
  } = useBlockchain();
  
  const { 
    data: balance, 
    isLoading, 
    error: balanceError,
    updateBalance,
    refetch 
  } = useTourTokenBalance();
  
  const { toast } = useToast();
  const [isDebugExpanded, setIsDebugExpanded] = useState(false);

  // Obter os endereços dos contratos para a rede atual
  const contractAddresses = getAddressesForNetwork(networkName);

  // Efeito para atualizar o saldo quando houver uma contribuição
  useEffect(() => {
    if (contributionAmount && parseFloat(contributionAmount) > 0) {
      // Atualiza o saldo
      updateBalance(contributionAmount);
      
      // Notifica o usuário
      toast({
        title: "Contribuição registrada",
        description: `Você contribuiu com ${contributionAmount} TOUR. Saldo atual: ${balance} TOUR`,
        variant: "default",
      });
      
      // Notifica o componente pai se necessário
      if (onContribution) {
        onContribution(contributionAmount);
      }
    }
  }, [contributionAmount]);

  // Formatar o status em uma badge
  const renderStatusBadge = (status: boolean, label: string) => (
    <Badge variant={status ? "default" : "outline"} className={status ? "bg-green-500" : "bg-red-100 text-red-800"}>
      {status ? `${label} ✓` : `${label} ✗`}
    </Badge>
  );

  // Função para forçar recarregamento do saldo
  const handleRefreshBalance = () => {
    if (refetch) {
      toast({
        title: "Atualizando saldo",
        description: "Consultando blockchain para obter saldo atualizado...",
        variant: "default",
      });
      refetch();
    }
  };

  return (
    <Card className="mb-6 overflow-hidden border-2 border-yellow-500/20 bg-yellow-500/5">
      <CardHeader className="bg-yellow-500/10 pb-4">
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
              className="size-5 text-yellow-500"
            >
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
              <path d="M12 18V6"/>
            </svg>
          </span>
          Seu Saldo de Tokens TOUR
        </CardTitle>
        <CardDescription>Acompanhe seu saldo de tokens da plataforma</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isWalletConnected ? (
          <div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-yellow-600">
                {isLoading ? "..." : balance}
              </span>
              <span className="ml-2 text-lg">TOUR</span>
              
              {/* Botão de atualização */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2 h-8 w-8" 
                onClick={handleRefreshBalance}
                disabled={isLoading}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                  <path d="M16 21h5v-5"/>
                </svg>
                <span className="sr-only">Atualizar saldo</span>
              </Button>
            </div>
            
            <div className="mt-2 text-sm text-muted-foreground">
              {walletAddress && (
                <span>Carteira: {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</span>
              )}
            </div>
            
            {/* Exibir erro de saldo se houver */}
            {balanceError && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>Erro ao obter saldo</AlertTitle>
                <AlertDescription className="text-xs">
                  {balanceError.message}
                </AlertDescription>
              </Alert>
            )}
            
            {contributionAmount && parseFloat(contributionAmount) > 0 && (
              <div className="mt-2 animate-pulse rounded-md bg-green-500/10 p-2 text-sm text-green-600">
                <span className="font-medium">Última contribuição:</span> {contributionAmount} TOUR
              </div>
            )}
            
            {/* Informações de debug */}
            {showDebugInfo && (
              <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-yellow-700">Informações técnicas</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={() => setIsDebugExpanded(!isDebugExpanded)}
                  >
                    {isDebugExpanded ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                
                {isDebugExpanded && (
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-1">
                      <div>Modo:</div>
                      <div className="text-right">
                        <Badge onClick={toggleDevelopmentMode} className="cursor-pointer">
                          {isDevelopment ? 'Desenvolvimento' : 'Produção'}
                        </Badge>
                      </div>
                      
                      <div>Blockchain:</div>
                      <div className="text-right">
                        {renderStatusBadge(isBlockchainReady, 'Pronta')}
                      </div>
                      
                      <div>Contratos:</div>
                      <div className="text-right">
                        {renderStatusBadge(areContractsReady, 'Prontos')}
                      </div>
                      
                      <div>Rede:</div>
                      <div className="text-right">
                        <Badge variant="secondary">{networkName}</Badge>
                      </div>
                      
                      <div>TourToken:</div>
                      <div className="text-right font-mono text-[10px] truncate">
                        {contractAddresses.tourToken || 'N/A'}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 w-full text-xs"
                      onClick={handleRefreshBalance}
                    >
                      Atualizar Saldo
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="mb-4 text-sm text-muted-foreground">
              Conecte sua carteira para ver seu saldo de tokens TOUR
            </p>
            
            {showConnectButton && (
              <button
                onClick={connectWallet}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Conectar Carteira
              </button>
            )}
            
            {/* Modo para desenvolvedores quando não conectado */}
            {showDebugInfo && (
              <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-yellow-700">Modo de desenvolvimento</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={toggleDevelopmentMode}
                  >
                    {isDevelopment ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-yellow-500/5 pt-2 text-xs text-muted-foreground">
        Use seus tokens para financiar projetos sustentáveis e receber recompensas
      </CardFooter>
    </Card>
  );
}