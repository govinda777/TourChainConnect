import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, ArrowUpRight, ArrowDownRight, DollarSign, Activity, Users } from "lucide-react";
import { SafeTransaction, SafeBalance } from '@/lib/blockchain/hooks/useGnosisSafe';

interface SafeMetricsCardProps {
  transactions: SafeTransaction[];
  balances: SafeBalance[];
  isLoading: boolean;
}

export default function SafeMetricsCard({ 
  transactions, 
  balances, 
  isLoading 
}: SafeMetricsCardProps) {
  
  // Calcular métricas
  const totalTransactions = transactions.length;
  const pendingTransactions = transactions.filter(tx => tx.status === 'PENDING').length;
  const completionRate = totalTransactions ? Math.round((totalTransactions - pendingTransactions) / totalTransactions * 100) : 0;
  
  // Calcular valor total de tokens em USD/BRL
  const totalValue = balances.reduce((sum, item) => sum + parseFloat(item.fiatBalance), 0);
  
  // Análise de tendência (simulada)
  const transactionTrend = calculateTransactionTrend(transactions);
  const valueTrend = calculateValueTrend(balances);
  
  // Atividade mensal (simulada)
  const monthlyActivity = [15, 12, 8, 23, 35, 28, 18];
  const maxActivity = Math.max(...monthlyActivity);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
          Métricas de Auditoria
        </CardTitle>
        <CardDescription>
          Análise de atividade e desempenho do multi-sig
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Taxa de Conclusão */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taxa de Conclusão de Transações</span>
              <span className="text-sm font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{totalTransactions} transações totais</span>
              <span>{pendingTransactions} pendentes</span>
            </div>
          </div>
          
          {/* Grid de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Métrica: Valor Total */}
            <div className="rounded-lg border p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">
                    {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  valueTrend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {valueTrend > 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(valueTrend)}%
                </div>
              </div>
              <div className="mt-1">
                <p className="text-xs text-muted-foreground">
                  {balances.length} tipos de tokens
                </p>
              </div>
            </div>
            
            {/* Métrica: Atividade de Transação */}
            <div className="rounded-lg border p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atividade de Transação</p>
                  <p className="text-2xl font-bold">
                    {transactions.length}
                  </p>
                </div>
                <div className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  transactionTrend > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {transactionTrend > 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(transactionTrend)}%
                </div>
              </div>
              <div className="mt-1">
                <p className="text-xs text-muted-foreground">
                  Nos últimos 30 dias
                </p>
              </div>
            </div>
          </div>
          
          {/* Gráfico Minimalista de Atividade */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Atividade Mensal</h4>
            <div className="flex items-end h-16 space-x-1">
              {monthlyActivity.map((value, index) => (
                <div 
                  key={index} 
                  className="bg-indigo-100 rounded-sm flex-1"
                  style={{ 
                    height: `${(value / maxActivity) * 100}%`,
                    backgroundColor: index === monthlyActivity.length - 1 ? 'rgb(99, 102, 241)' : '' 
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>Mai</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
          
          {/* Métricas Adicionais */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg border p-3">
              <Users className="h-5 w-5 text-indigo-600 mb-1" />
              <span className="text-sm font-bold">2.5x</span>
              <span className="text-xs text-muted-foreground text-center">Participação</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border p-3">
              <Activity className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-sm font-bold">98.2%</span>
              <span className="text-xs text-muted-foreground text-center">Disponibilidade</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border p-3">
              <DollarSign className="h-5 w-5 text-amber-600 mb-1" />
              <span className="text-sm font-bold">28.5%</span>
              <span className="text-xs text-muted-foreground text-center">ROI</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Função para calcular tendência de transações (simulada)
function calculateTransactionTrend(transactions: SafeTransaction[]): number {
  // Simulando tendência para demonstração
  const recentTxCount = transactions.filter(tx => 
    tx.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000
  ).length;
  
  const olderTxCount = transactions.filter(tx => 
    tx.timestamp <= Date.now() - 30 * 24 * 60 * 60 * 1000 && 
    tx.timestamp > Date.now() - 60 * 24 * 60 * 60 * 1000
  ).length;
  
  if (olderTxCount === 0) return recentTxCount > 0 ? 100 : 0;
  
  const percentChange = ((recentTxCount - olderTxCount) / olderTxCount) * 100;
  return Math.round(percentChange);
}

// Função para calcular tendência de valor (simulada)
function calculateValueTrend(_balances: SafeBalance[]): number {
  // Simulando tendência para demonstração
  return 12.5; // Valor fixo para demonstração
}