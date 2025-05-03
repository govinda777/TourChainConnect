import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number to currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with commas
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number);
}

// Calculate carbon emissions based on travel data
export function calculateCarbonEmissions(
  flights: number, 
  distance: number, 
  economyPercent: number,
  businessPercent: number,
  firstPercent: number
): number {
  // Average emission factor for flights (kg CO2 per passenger km)
  const economyFactor = 0.082;
  const businessFactor = 0.234;
  const firstFactor = 0.468;
  
  // Calculate weighted emission factor
  const weightedFactor = 
    (economyPercent / 100) * economyFactor +
    (businessPercent / 100) * businessFactor +
    (firstPercent / 100) * firstFactor;
  
  // Calculate total emissions in tons
  return (flights * distance * weightedFactor) / 1000;
}

// Calculate equivalent cars per year (average car emits 4.6 tons CO2 per year)
export function calculateEquivalentCars(emissions: number): number {
  return emissions / 4.6;
}

// Calculate offset costs (average $50 per ton)
export function calculateOffsetCost(emissions: number): number {
  return emissions * 50;
}
