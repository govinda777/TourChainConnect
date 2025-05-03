import { renderHook, act } from '@testing-library/react';
import { useBlockchain } from '../lib/blockchain/providers/BlockchainProvider';
import { useTourTokenBalance } from '../lib/blockchain/hooks/useTourTokenBalance';
import { useTourCrowdfunding } from '../lib/blockchain/hooks/useTourCrowdfunding';
import { useTourOracle } from '../lib/blockchain/hooks/useTourOracle';
import { useCarbonOffset } from '../lib/blockchain/hooks/useCarbonOffset';

// Mock the useBlockchain hook
jest.mock('../lib/blockchain/providers/BlockchainProvider', () => ({
  useBlockchain: jest.fn(),
}));

describe('Blockchain Hooks', () => {
  beforeEach(() => {
    // Default mock implementation
    (useBlockchain as jest.Mock).mockReturnValue({
      walletAddress: '0x1234567890123456789012345678901234567890',
      isBlockchainReady: true,
      isWalletConnected: true,
      networkName: 'localhost',
      isDevelopment: true,
      connectWallet: jest.fn().mockResolvedValue(true),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useTourTokenBalance', () => {
    it('should return mock balance in development mode', async () => {
      const { result } = renderHook(() => useTourTokenBalance());
      
      // In development mode, it should return 1000.00
      expect(result.current.data).toBe('1000.00');
      expect(result.current.isLoading).toBe(false);
      
      // Test updateBalance function
      await act(async () => {
        await result.current.updateBalance('100');
      });
      
      // Should handle the mock balance update
      expect(result.current.data).toBe('900.00');
    });
  });

  describe('useTourCrowdfunding', () => {
    it('should provide crowdfunding functions', () => {
      const { result } = renderHook(() => useTourCrowdfunding());
      
      expect(result.current.getCampaign).toBeDefined();
      expect(result.current.getCampaignRewards).toBeDefined();
      expect(result.current.pledge).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isProcessing).toBe(false);
    });

    it('should get campaign data in development mode', async () => {
      const { result } = renderHook(() => useTourCrowdfunding());
      
      let campaignData;
      await act(async () => {
        campaignData = await result.current.getCampaign(1);
      });
      
      // Verify mock campaign data
      expect(campaignData).not.toBeNull();
      expect(campaignData?.title).toBe('TourChain: Revolução nas Viagens Corporativas');
      expect(campaignData?.contributorsCount).toBe(285);
    });
  });

  describe('useTourOracle', () => {
    it('should provide oracle data retrieval functions', () => {
      const { result } = renderHook(() => useTourOracle());
      
      expect(result.current.getCarbonEmission).toBeDefined();
      expect(result.current.getPrice).toBeDefined();
      expect(result.current.getTravelOptimization).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should get carbon emission data in development mode', async () => {
      const { result } = renderHook(() => useTourOracle());
      
      let emissionData;
      await act(async () => {
        emissionData = await result.current.getCarbonEmission('test-id');
      });
      
      // Verify mock emission data
      expect(emissionData).not.toBeNull();
      expect(emissionData?.travelMode).toBe('flight');
      expect(typeof emissionData?.amount).toBe('bigint');
    });
  });

  describe('useCarbonOffset', () => {
    it('should provide carbon offset functions', () => {
      const { result } = renderHook(() => useCarbonOffset());
      
      expect(result.current.getOffsetProjects).toBeDefined();
      expect(result.current.calculateOffsetCost).toBeDefined();
      expect(result.current.createOffset).toBeDefined();
      expect(result.current.getCompanyOffsets).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isProcessing).toBe(false);
    });

    it('should get offset projects in development mode', async () => {
      const { result } = renderHook(() => useCarbonOffset());
      
      let projects;
      await act(async () => {
        projects = await result.current.getOffsetProjects();
      });
      
      // Verify mock projects data
      expect(projects.length).toBe(2);
      expect(projects[0].name).toBe('Reflorestamento Amazônia');
      expect(projects[1].name).toBe('Energia Solar Nordeste');
    });
  });
});