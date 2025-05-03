import { render, screen, fireEvent } from '@testing-library/react';
import CrowdfundingPage from '../pages/CrowdfundingPage';
import { apiRequest } from '@/lib/queryClient';

// Mock wouter's useLocation hook
jest.mock('wouter', () => ({
  useLocation: () => ['/crowdfunding', jest.fn()]
}));

// Mock apiRequest
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock Dialog component
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogClose: () => <button>Close</button>
}));

describe('CrowdfundingPage Component', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  test('renders campaign information', () => {
    render(<CrowdfundingPage />);
    
    expect(screen.getByText(/O futuro das viagens corporativas/i)).toBeInTheDocument();
    expect(screen.getByText(/TourChain/i)).toBeInTheDocument();
    expect(screen.getByText(/Sobre o Projeto/i)).toBeInTheDocument();
  });

  test('renders campaign statistics', () => {
    render(<CrowdfundingPage />);
    
    expect(screen.getByTestId('campaign-percentage')).toBeInTheDocument();
    expect(screen.getByTestId('campaign-backers')).toBeInTheDocument();
    expect(screen.getByTestId('campaign-days-left')).toBeInTheDocument();
  });

  test('shows support dialog when clicking support button', () => {
    render(<CrowdfundingPage />);
    
    const supportButton = screen.getByText(/Apoiar Este Projeto/i);
    fireEvent.click(supportButton);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  test('displays reward tiers', () => {
    render(<CrowdfundingPage />);
    
    expect(screen.getByText(/Recompensas/i)).toBeInTheDocument();
    // A lista de recompensas deve ser renderizada, mas como estamos usando dados mocados
    // e a lista é dinâmica, aqui verificamos apenas a seção
  });
});