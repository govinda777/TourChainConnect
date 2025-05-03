import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { calculateCarbonEmissions, calculateEquivalentCars, calculateOffsetCost } from "@/lib/utils";

export default function SustainabilityCalculator() {
  const [annualFlights, setAnnualFlights] = useState(250);
  const [flightDistance, setFlightDistance] = useState(1500);
  const [economyPercent, setEconomyPercent] = useState(60);
  const [businessPercent, setBusinessPercent] = useState(35);
  const [firstPercent, setFirstPercent] = useState(5);
  const [offsetOption, setOffsetOption] = useState("renewable");
  
  const [emissions, setEmissions] = useState(0);
  const [equivalentCars, setEquivalentCars] = useState(0);
  const [offsetCosts, setOffsetCosts] = useState({
    reforestation: 0,
    renewable: 0,
    ocean: 0
  });
  
  // Update calculations when inputs change
  useEffect(() => {
    const calculatedEmissions = calculateCarbonEmissions(
      annualFlights,
      flightDistance,
      economyPercent,
      businessPercent,
      firstPercent
    );
    
    setEmissions(calculatedEmissions);
    setEquivalentCars(calculateEquivalentCars(calculatedEmissions));
    
    // Calculate offset costs for different programs
    const baseCost = calculateOffsetCost(calculatedEmissions);
    setOffsetCosts({
      reforestation: Math.round(baseCost * 1.25),
      renewable: Math.round(baseCost),
      ocean: Math.round(baseCost * 1.123)
    });
  }, [annualFlights, flightDistance, economyPercent, businessPercent, firstPercent]);
  
  // Handle class percentage changes with validation
  const handleClassChange = (type: string, value: number) => {
    const newValue = Math.max(0, Math.min(100, value));
    let newEconomy = economyPercent;
    let newBusiness = businessPercent;
    let newFirst = firstPercent;
    
    if (type === 'economy') newEconomy = newValue;
    if (type === 'business') newBusiness = newValue;
    if (type === 'first') newFirst = newValue;
    
    // Ensure percentages add up to 100%
    const total = newEconomy + newBusiness + newFirst;
    if (total !== 100) {
      // Adjust the other values proportionally
      if (type === 'economy') {
        const remaining = 100 - newEconomy;
        const ratio = remaining > 0 ? remaining / (businessPercent + firstPercent) : 0;
        newBusiness = Math.round(businessPercent * ratio);
        newFirst = 100 - newEconomy - newBusiness;
      } else if (type === 'business') {
        const remaining = 100 - newBusiness;
        const ratio = remaining > 0 ? remaining / (economyPercent + firstPercent) : 0;
        newEconomy = Math.round(economyPercent * ratio);
        newFirst = 100 - newEconomy - newBusiness;
      } else if (type === 'first') {
        const remaining = 100 - newFirst;
        const ratio = remaining > 0 ? remaining / (economyPercent + businessPercent) : 0;
        newEconomy = Math.round(economyPercent * ratio);
        newBusiness = 100 - newEconomy - newFirst;
      }
    }
    
    setEconomyPercent(newEconomy);
    setBusinessPercent(newBusiness);
    setFirstPercent(newFirst);
  };
  
  const calculateEmissions = () => {
    // This is just a placeholder as calculations already happen in useEffect
    // But in a real application, this is where you might trigger more complex calculations
    // or API calls to a sustainability service
  };

  return (
    <section id="sustainability" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-feature text-sm font-semibold uppercase tracking-wider">Environmental Impact</span>
            <h2 className="text-3xl font-bold mt-2 mb-6">Sustainability Program</h2>
            <p className="text-neutral-700 mb-6">
              With the TourChain Sustainability Program, your company can offset its carbon footprint from business travel and demonstrate environmental responsibility.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-secondary-light p-2 rounded-lg">
                    <i className="ri-footprint-line text-secondary"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Carbon Footprint Tracking</h3>
                  <p className="text-neutral-600">Comprehensive monitoring of your organization's travel-related carbon emissions.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-secondary-light p-2 rounded-lg">
                    <i className="ri-recycle-line text-secondary"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Offset Program</h3>
                  <p className="text-neutral-600">Contribute to verified environmental projects that neutralize your carbon impact.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-secondary-light p-2 rounded-lg">
                    <i className="ri-award-line text-secondary"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">TourChain Sustainable Certification</h3>
                  <p className="text-neutral-600">Earn recognition for your commitment to sustainable business travel practices.</p>
                </div>
              </div>
            </div>
            
            <a href="#contact" className="inline-flex items-center px-6 py-3 rounded-md bg-secondary text-white hover:bg-secondary-dark font-medium transition">
              Join Our Sustainability Program
              <i className="ri-arrow-right-line ml-2"></i>
            </a>
          </div>
          
          <div className="bg-neutral-50 p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-bold mb-6">Carbon Impact Calculator</h3>
            
            {/* Calculator Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Annual Flights</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={annualFlights} 
                      onChange={(e) => setAnnualFlights(parseInt(e.target.value) || 0)}
                      min="1" 
                      max="10000" 
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <span className="absolute right-3 top-2 text-neutral-500">trips</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Average Flight Distance</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={flightDistance}
                      onChange={(e) => setFlightDistance(parseInt(e.target.value) || 0)}
                      min="100" 
                      max="10000" 
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <span className="absolute right-3 top-2 text-neutral-500">km</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Travel Distribution</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Economy Class</p>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={economyPercent}
                        onChange={(e) => handleClassChange('economy', parseInt(e.target.value) || 0)}
                        min="0" 
                        max="100" 
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <span className="absolute right-3 top-2 text-neutral-500">%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Business Class</p>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={businessPercent}
                        onChange={(e) => handleClassChange('business', parseInt(e.target.value) || 0)}
                        min="0" 
                        max="100" 
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <span className="absolute right-3 top-2 text-neutral-500">%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">First Class</p>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={firstPercent}
                        onChange={(e) => handleClassChange('first', parseInt(e.target.value) || 0)}
                        min="0" 
                        max="100" 
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <span className="absolute right-3 top-2 text-neutral-500">%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full py-3 px-4 bg-secondary text-white rounded-md hover:bg-secondary-dark transition"
                onClick={calculateEmissions}
              >
                Calculate Carbon Impact
              </button>
            </div>
            
            {/* Results Section */}
            <div className="mt-8 p-4 border border-neutral-200 rounded-lg bg-white">
              <h4 className="font-medium mb-4">Your Estimated Impact</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-neutral-500">Annual CO2 Emissions</p>
                  <p className="text-2xl font-bold text-neutral-800">
                    {emissions.toFixed(1)} <span className="text-base font-normal">tons</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Equivalent To</p>
                  <p className="text-2xl font-bold text-neutral-800">
                    {equivalentCars.toFixed(1)} <span className="text-base font-normal">cars/year</span>
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Your Company</span>
                  <span className="text-sm font-medium">{emissions.toFixed(1)} tons</span>
                </div>
                <Progress 
                  value={(emissions / 250) * 100} 
                  className="h-3 bg-neutral-200" 
                  indicatorClassName="bg-destructive" 
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>0</span>
                  <span>Industry Average: 250 tons</span>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Offset Options</h5>
                
                <RadioGroup value={offsetOption} onValueChange={setOffsetOption}>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer transition">
                      <RadioGroupItem value="reforestation" id="offset1" className="text-secondary" />
                      <Label htmlFor="offset1" className="ml-3 flex-1 cursor-pointer">
                        <span className="block font-medium">Reforestation Projects</span>
                        <span className="text-sm text-neutral-500">Support forest restoration in critical ecosystems</span>
                      </Label>
                      <span className="text-secondary font-medium">${offsetCosts.reforestation.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center p-3 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer transition">
                      <RadioGroupItem value="renewable" id="offset2" className="text-secondary" />
                      <Label htmlFor="offset2" className="ml-3 flex-1 cursor-pointer">
                        <span className="block font-medium">Renewable Energy</span>
                        <span className="text-sm text-neutral-500">Fund solar and wind energy development</span>
                      </Label>
                      <span className="text-secondary font-medium">${offsetCosts.renewable.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center p-3 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer transition">
                      <RadioGroupItem value="ocean" id="offset3" className="text-secondary" />
                      <Label htmlFor="offset3" className="ml-3 flex-1 cursor-pointer">
                        <span className="block font-medium">Ocean Conservation</span>
                        <span className="text-sm text-neutral-500">Support blue carbon initiatives</span>
                      </Label>
                      <span className="text-secondary font-medium">${offsetCosts.ocean.toLocaleString()}</span>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
