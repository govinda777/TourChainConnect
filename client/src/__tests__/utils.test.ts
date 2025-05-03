import { 
  formatCurrency, 
  formatNumber, 
  calculateCarbonEmissions, 
  calculateEquivalentCars, 
  calculateOffsetCost 
} from '../lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    test('formats currency values correctly', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
      expect(formatCurrency(0)).toBe('R$ 0,00');
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00');
    });
  });

  describe('formatNumber', () => {
    test('formats numbers with proper thousand separators', () => {
      expect(formatNumber(1234)).toBe('1.234');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1000000)).toBe('1.000.000');
    });
  });

  describe('Carbon Calculation Functions', () => {
    describe('calculateCarbonEmissions', () => {
      test('calculates emissions based on flight data', () => {
        // Test with different class mixes
        // 100% economy class
        expect(calculateCarbonEmissions(10, 1000, 100, 0, 0)).toBe(0.82);
        
        // 100% business class
        expect(calculateCarbonEmissions(10, 1000, 0, 100, 0)).toBe(2.34);
        
        // 100% first class
        expect(calculateCarbonEmissions(10, 1000, 0, 0, 100)).toBe(4.68);
        
        // Mixed classes (50% economy, 30% business, 20% first)
        const mixedEmissions = calculateCarbonEmissions(10, 1000, 50, 30, 20);
        expect(Math.round(mixedEmissions * 100) / 100).toBe(1.73); // Round to 2 decimal places
      });
    });

    describe('calculateEquivalentCars', () => {
      test('converts CO2 emissions to equivalent number of cars', () => {
        // Assuming 4.6 tons of CO2 per car per year, converted to kg
        // 4600kg per car per year = 12.6kg per car per day
        const dailyCarEmission = 4600 / 365; // ~12.6kg per day
        
        expect(calculateEquivalentCars(dailyCarEmission)).toBe(1);
        expect(calculateEquivalentCars(dailyCarEmission * 2)).toBe(2);
        expect(calculateEquivalentCars(0)).toBe(0);
      });
    });

    describe('calculateOffsetCost', () => {
      test('calculates cost to offset carbon emissions', () => {
        // Assuming offset cost of around R$50 per ton of CO2 (0.05 per kg)
        expect(calculateOffsetCost(1000)).toBe(50);
        expect(calculateOffsetCost(2000)).toBe(100);
        expect(calculateOffsetCost(0)).toBe(0);
      });
    });
  });
});