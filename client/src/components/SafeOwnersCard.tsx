import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ShieldCheck, UserCheck } from "lucide-react";
import { SafeInfo } from '@/lib/blockchain/hooks/useGnosisSafe';

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
  
  // Verificar se o usuário conectado é um owner do safe
  const isOwnerConnected = (address: string) => {
    if (!connectedWallet) return false;
    return connectedWallet.toLowerCase() === address.toLowerCase();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Administradores do Safe
        </CardTitle>
        <CardDescription>
          Usuários com permissão para propor e assinar transações
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !safeInfo ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Threshold: {safeInfo.threshold} de {safeInfo.owners.length}</span>
              <Badge variant="outline" className="text-indigo-700 border-indigo-300 bg-indigo-50">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Multi-Sig
              </Badge>
            </div>
            
            {safeInfo.owners.map((owner, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isOwnerConnected(owner) ? 'bg-indigo-50 border-indigo-200' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{formatAddress(owner)}</div>
                    <div className="text-xs text-muted-foreground">
                      {index === 0 ? 'Administrador Principal' : `Administrador ${index + 1}`}
                    </div>
                  </div>
                </div>
                
                {isOwnerConnected(owner) && (
                  <Badge className="bg-indigo-100 text-indigo-700">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Você
                  </Badge>
                )}
              </div>
            ))}
            
            <div className="text-xs text-muted-foreground mt-4">
              <p>Para que uma transação seja executada, ela precisa de pelo menos {safeInfo.threshold} assinaturas.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}