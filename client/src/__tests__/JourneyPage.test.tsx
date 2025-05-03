import { render, screen, waitFor } from '@testing-library/react';
import JourneyPage from '../pages/JourneyPage';
import { apiRequest } from '@/lib/queryClient';

// Mock wouter's useLocation hook
jest.mock('wouter', () => ({
  useLocation: () => ['/journey/wellness', jest.fn()]
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

describe('JourneyPage Component', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
    
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/journey/wellness'
      },
      writable: true
    });
    
    // Mock successful API response
    (apiRequest as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test-session-id',
          type: 'wellness',
          progress: 0,
          stages: ['Estágio 1', 'Estágio 2', 'Estágio 3'],
          currentStage: 0,
          startedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          completed: false
        })
      })
    );
  });

  test('renders loading state initially', () => {
    render(<JourneyPage />);
    expect(screen.getByText(/Iniciando sua experiência personalizada/i)).toBeInTheDocument();
  });

  test('renders journey when data is loaded', async () => {
    render(<JourneyPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Jornada de Bem-Estar')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Progresso')).toBeInTheDocument();
    expect(screen.getByText('Estágio 1')).toBeInTheDocument();
  });

  test('displays error state when API request fails', async () => {
    // Mock failed API response
    (apiRequest as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: false
      })
    );
    
    render(<JourneyPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Ops! Algo deu errado/i)).toBeInTheDocument();
    });
  });
});