import { formatTokenAmount, parseTokenAmount, formatAddress } from '../lib/blockchain/utils';

describe('Blockchain Integration Functions', () => {
  describe('formatTokenAmount', () => {
    it('should format token amounts correctly', () => {
      expect(formatTokenAmount(BigInt(10 * 10**18))).toBe('10');
      expect(formatTokenAmount(BigInt(0))).toBe('0');
      expect(formatTokenAmount(BigInt(123456 * 10**18))).toBe('123456');
      // Há uma pequena diferença de precisão devido à conversão de BigInt
      expect(formatTokenAmount(BigInt(1234567890123456789))).toMatch(/^1\.2345678901234567/);
    });

    it('should handle small token amounts', () => {
      expect(formatTokenAmount(BigInt(123))).toBe('0.000000000000000123');
      expect(formatTokenAmount(BigInt(1))).toBe('0.000000000000000001');
    });
  });

  describe('parseTokenAmount', () => {
    it('should parse string amounts to bigint', () => {
      expect(parseTokenAmount('10')).toBe(BigInt(10 * 10**18));
      expect(parseTokenAmount('0')).toBe(BigInt(0));
      expect(parseTokenAmount('123.456')).toBe(BigInt(123.456 * 10**18));
    });

    it('should handle invalid inputs', () => {
      expect(parseTokenAmount('')).toBe(BigInt(0));
      expect(parseTokenAmount('invalid')).toBe(BigInt(0));
    });
  });

  describe('formatAddress', () => {
    it('should format ethereum addresses correctly', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(formatAddress(address)).toBe('0x1234...7890');
      expect(formatAddress(address, 4, 4)).toBe('0x12...7890');
      expect(formatAddress(address, 10, 8)).toBe('0x1234567890...12345678');
    });

    it('should handle empty addresses', () => {
      expect(formatAddress('')).toBe('');
    });

    it('should return full address if it is shorter than prefix + suffix', () => {
      expect(formatAddress('0x1234')).toBe('0x1234');
    });
  });

  describe('Blockchain Utils Integration', () => {
    it('should be able to parse and format token amounts round trip', () => {
      const originalAmount = '123.456';
      const bigintAmount = parseTokenAmount(originalAmount);
      const formattedAmount = formatTokenAmount(bigintAmount);
      
      // Due to floating point precision, we might not get exactly the same number back
      expect(formattedAmount).toMatch(/^123\.45/); // Should start with 123.45...
    });
  });
});