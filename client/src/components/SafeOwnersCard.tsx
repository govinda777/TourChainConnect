import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, CheckCircle } from "lucide-react";
import { SafeInfo } from '../lib/blockchain/hooks/useGnosisSafe';

interface SafeOwnersCardProps {
  safeInfo: SafeInfo | null;
  connectedWallet: string | null;
  formatAddress: (address: string) => string;
  isLoading: boolean;
}

export default function SafeOwnersCard({ 
  safeInfo, 
  connectedWallet, 
  formatAddress, 
  isLoading 
}: SafeOwnersCardProps) {
  if (!safeInfo) return null;

  // Gera uma cor baseada no endereço (para consistência visual)
  const getColorFromAddress = (address: string): string => {
    const hash = address.toLowerCase().split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 40%)`;
  };

  // Gera as iniciais para o avatar baseado no endereço
  const getInitials = (address: string): string => {
    return address.substring(2, 4).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Administradores do Safe
        </CardTitle>
        <CardDescription>
          Proprietários que podem confirmar transações (Threshold: {safeInfo.threshold})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {safeInfo.owners.map((owner, index) => (
            <div 
              key={owner} 
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center">
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarFallback 
                    style={{ backgroundColor: getColorFromAddress(owner) }}
                    className="text-white"
                  >
                    {getInitials(owner)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-medium">
                          {formatAddress(owner)}
                          {connectedWallet && owner.toLowerCase() === connectedWallet.toLowerCase() && (
                            <Badge variant="outline" className="ml-2 border-indigo-200 text-indigo-600">
                              Você
                            </Badge>
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{owner}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <span className="text-xs text-muted-foreground">
                    Proprietário #{index + 1}
                  </span>
                </div>
              </div>
              
              {index < safeInfo.threshold && (
                <Badge className="bg-indigo-100 text-indigo-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Confirmador
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}