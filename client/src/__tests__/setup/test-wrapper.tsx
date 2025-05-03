import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Mock das funções blockchain para testes
export const mockBlockchainContext = {
  isDevelopment: true,
  isBlockchainReady: true,
  areContractsReady: true,
  isWalletConnected: false,
  connectWallet: jest.fn().mockResolvedValue(undefined),
  disconnectWallet: jest.fn(),
  walletAddress: null,
  tourTokenBalance: '1000.00',
  networkName: 'localhost',
};

export const mockTourTokenBalance = {
  data: '1000.00',
  isLoading: false,
  updateBalance: jest.fn().mockResolvedValue(undefined)
};

// Wrapper de teste
export const TestWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Cria um wrapper para testes
export function renderWithProviders(ui: React.ReactElement) {
  return {
    ui: <TestWrapper>{ui}</TestWrapper>,
  };
}