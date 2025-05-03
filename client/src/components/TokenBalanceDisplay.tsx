import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from '@/lib/blockchain/providers/BlockchainProvider';
import useTourTokenBalance from '@/lib/blockchain/hooks/useTourTokenBalance';

interface TokenBalanceDisplayProps {
  showConnectButton?: boolean;
  onContribution?: (amount: string) => void;
  contributionAmount?: string;
}

/**
 * Componente para exibir o saldo de tokens TOUR e alterações após contribuições
 */
export default function TokenBalanceDisplay({ 
  showConnectButton = true,
  onContribution,
  contributionAmount
}: TokenBalanceDisplayProps) {
  const { isWalletConnected, walletAddress, connectWallet } = useBlockchain();
  const { data: balance, isLoading, updateBalance } = useTourTokenBalance();
  const { toast } = useToast();

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
            </div>
            
            <div className="mt-2 text-sm text-muted-foreground">
              {walletAddress && (
                <span>Carteira: {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</span>
              )}
            </div>
            
            {contributionAmount && parseFloat(contributionAmount) > 0 && (
              <div className="mt-2 animate-pulse rounded-md bg-green-500/10 p-2 text-sm text-green-600">
                <span className="font-medium">Última contribuição:</span> {contributionAmount} TOUR
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
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-yellow-500/5 pt-2 text-xs text-muted-foreground">
        Use seus tokens para financiar projetos sustentáveis e receber recompensas
      </CardFooter>
    </Card>
  );
}