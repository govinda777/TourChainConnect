import { render, screen, fireEvent } from '@testing-library/react';
import TokenBalanceDisplay from '../components/TokenBalanceDisplay';

// Mock dos hooks blockchain
jest.mock('@/lib/blockchain/providers/BlockchainProvider', () => {
  return require('../__tests__/setup/test-providers');
});

jest.mock('@/lib/blockchain/hooks/useTourTokenBalance', () => {
  return () => ({
    data: '1000.00',
    isLoading: false,
    updateBalance: jest.fn()
  });
});

describe('TokenBalanceDisplay Component', () => {
  it('renders token balance correctly', () => {
    render(<TokenBalanceDisplay />);
    
    // Deve mostrar o saldo do token
    expect(screen.getByText(/Saldo TOUR/i)).toBeInTheDocument();
    expect(screen.getByText(/1000.00/)).toBeInTheDocument();
  });
  
  it('shows connect wallet button when showConnectButton is true', () => {
    render(<TokenBalanceDisplay showConnectButton={true} />);
    
    // Deve mostrar o botão de conectar carteira
    const connectButton = screen.getByText(/Conectar Carteira/i);
    expect(connectButton).toBeInTheDocument();
  });
  
  it('shows contribution animation when contributionAmount is provided', () => {
    const onContribution = jest.fn();
    
    render(
      <TokenBalanceDisplay 
        contributionAmount="100" 
        onContribution={onContribution} 
      />
    );
    
    // Deve mostrar a animação de contribuição
    expect(screen.getByText(/Tokens TOUR/i)).toBeInTheDocument();
    expect(screen.getByText(/Sua carteira acabou de receber/i)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});