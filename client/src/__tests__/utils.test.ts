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
      test('calculates emissions based on distance and transport type', () => {
        // Test for flights (assume average of 0.2kg CO2 per km)
        expect(calculateCarbonEmissions(1000, 'avião')).toBeCloseTo(200);
        
        // Test for car (assume average of 0.12kg CO2 per km)
        expect(calculateCarbonEmissions(1000, 'carro')).toBeCloseTo(120);
        
        // Test for train (assume average of 0.04kg CO2 per km)
        expect(calculateCarbonEmissions(1000, 'trem')).toBeCloseTo(40);
        
        // Test default transport type
        expect(calculateCarbonEmissions(1000)).toBeCloseTo(200);
      });
    });

    describe('calculateEquivalentCars', () => {
      test('converts CO2 emissions to equivalent number of cars', () => {
        // Assuming 4.6 tons of CO2 per car per year, converted to kg
        // 4600kg per car per year = 12.6kg per car per day
        const dailyCarEmission = 4600 / 365; // ~12.6kg per day
        
        expect(calculateEquivalentCars(dailyCarEmission)).toBeCloseTo(1);
        expect(calculateEquivalentCars(dailyCarEmission * 2)).toBeCloseTo(2);
        expect(calculateEquivalentCars(0)).toBe(0);
      });
    });

    describe('calculateOffsetCost', () => {
      test('calculates cost to offset carbon emissions', () => {
        // Assuming offset cost of around R$50 per ton of CO2 (0.05 per kg)
        expect(calculateOffsetCost(1000)).toBeCloseTo(50);
        expect(calculateOffsetCost(2000)).toBeCloseTo(100);
        expect(calculateOffsetCost(0)).toBe(0);
      });
    });
  });
});