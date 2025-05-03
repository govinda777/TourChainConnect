import React, { useState, useEffect } from 'react';
import { useGnosisSafe, SafeInfo, SafeTransaction, SafeBalance } from '../lib/blockchain/hooks/useGnosisSafe';
import { useBlockchain } from '../lib/blockchain/providers/BlockchainProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  DollarSign,
  FileText,
  Shield,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import MobileWalletConnect from '@/components/MobileWalletConnect';
import SafeOwnersCard from '@/components/SafeOwnersCard';

export default function AuditDashboardPage() {
  const { isWalletConnected, walletAddress } = useBlockchain();
  const { 
    getSafeInfo, 
    getSafeTransactions, 
    getSafeBalances, 
    isOwner, 
    formatTokenValue, 
    isLoading, 
    formatAddress 
  } = useGnosisSafe();

  // Estados para armazenar os dados do Safe
  const [safeInfo, setSafeInfo] = useState<SafeInfo | null>(null);
  const [transactions, setTransactions] = useState<SafeTransaction[]>([]);
  const [balances, setBalances] = useState<SafeBalance[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Endereço do Safe a ser usado (em um ambiente real, poderia ser configurável)
  const safeAddress = '0x1234567890123456789012345678901234567890';

  // Carregar dados iniciais
  useEffect(() => {
    if (safeAddress) {
      loadSafeData();
    }
  }, [safeAddress]);

  // Função para carregar todos os dados do Safe
  const loadSafeData = async () => {
    setIsRefreshing(true);

    try {
      const info = await getSafeInfo(safeAddress);
      const txs = await getSafeTransactions(safeAddress);
      const bals = await getSafeBalances(safeAddress);

      setSafeInfo(info);
      setTransactions(txs);
      setBalances(bals);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Formatar timestamp para data legível
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter o status da transação com cor apropriada
  const getStatusBadge = (status: 'PENDING' | 'EXECUTED' | 'FAILED') => {
    switch (status) {
      case 'EXECUTED':
        return <Badge className="bg-green-500">Executada</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pendente</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  // Calcular o saldo total em fiat
  const calculateTotalBalance = (): string => {
    if (balances.length === 0) return "0.00";
    
    const total = balances.reduce((sum, item) => {
      return sum + parseFloat(item.fiatBalance);
    }, 0);
    
    return total.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Verificar se o usuário conectado é um owner do Safe
  const userIsOwner = isWalletConnected && walletAddress ? isOwner(safeInfo, walletAddress) : false;

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Auditoria</h1>
          <p className="text-muted-foreground">
            Monitore as transações e atividades do multi-sig do protocolo TourChain
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isWalletConnected ? (
            <MobileWalletConnect />
          ) : userIsOwner ? (
            <Badge className="bg-indigo-600">Administrador do Safe</Badge>
          ) : (
            <Badge variant="outline">Apenas Visualização</Badge>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={loadSafeData} 
            disabled={isRefreshing || isLoading}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {safeInfo && (
        <Card className="mb-8 border-indigo-100 shadow-sm">
          <CardHeader className="bg-indigo-50/50">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-600" />
              Gnosis Safe
            </CardTitle>
            <CardDescription>
              Endereço: {formatAddress(safeInfo.address)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Donos</span>
                <span className="text-2xl font-bold">{safeInfo.owners.length}</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Com threshold de {safeInfo.threshold} assinaturas
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Nonce</span>
                <span className="text-2xl font-bold">{safeInfo.nonce}</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Transações executadas
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Versão</span>
                <span className="text-2xl font-bold">{safeInfo.version}</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Na rede {safeInfo.chainId === '137' ? 'Polygon' : safeInfo.chainId}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="assets">Ativos</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card de Saldo */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-indigo-600" />
                  Saldo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">{calculateTotalBalance()}</span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Em {balances.length} tipos de tokens
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de Transações */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart className="h-4 w-4 mr-2 text-indigo-600" />
                  Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">{transactions.length}</span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {transactions.filter(tx => tx.status === 'PENDING').length} pendentes
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de Owners */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-4 w-4 mr-2 text-indigo-600" />
                  Administradores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !safeInfo ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">{safeInfo.owners.length}</span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Threshold de {safeInfo.threshold} assinaturas
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Grid com Transações e Donos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transações Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                  Transações Recentes
                </CardTitle>
                <CardDescription>
                  As últimas 3 transações realizadas no protocolo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {tx.description || `Transação para ${formatAddress(tx.to)}`}
                            </span>
                            {getStatusBadge(tx.status)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(tx.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {tx.value && (
                            <span className="font-medium mr-2">
                              {(parseInt(tx.value) / 1e18).toFixed(3)} ETH
                            </span>
                          )}
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab("transactions")}
                >
                  Ver todas as transações
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            {/* Componente de Administradores do Safe */}
            <SafeOwnersCard 
              safeInfo={safeInfo}
              connectedWallet={walletAddress}
              formatAddress={formatAddress}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        {/* Transações */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Histórico de Transações
              </CardTitle>
              <CardDescription>
                Todas as transações realizadas através do Safe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Confirmações</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.id}</TableCell>
                        <TableCell>{formatDate(tx.timestamp)}</TableCell>
                        <TableCell>
                          {tx.description || `Transferência para ${formatAddress(tx.to)}`}
                        </TableCell>
                        <TableCell>
                          {tx.value ? `${(parseInt(tx.value) / 1e18).toFixed(3)} ETH` : '-'}
                        </TableCell>
                        <TableCell>
                          {tx.confirmations.length}/{tx.confirmationsRequired}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {tx.status === 'EXECUTED' && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />}
                            {tx.status === 'PENDING' && <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />}
                            {tx.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                            {getStatusBadge(tx.status)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma transação encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ativos */}
        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
                Ativos no Safe
              </CardTitle>
              <CardDescription>
                Saldo de tokens e ativos gerenciados pelo multi-sig
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : balances.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead className="text-right">Valor (BRL)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.map((balance, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {balance.token.logoUri && (
                              <img 
                                src={balance.token.logoUri} 
                                alt={balance.token.symbol} 
                                className="h-5 w-5 mr-2" 
                              />
                            )}
                            <span>{balance.token.name} ({balance.token.symbol})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatTokenValue(
                            balance.balance, 
                            balance.token.decimals, 
                            balance.token.symbol
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(balance.fiatBalance).toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption>
                    <div className="flex justify-end font-bold pt-2">
                      Total: {calculateTotalBalance()}
                    </div>
                  </TableCaption>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum ativo encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}