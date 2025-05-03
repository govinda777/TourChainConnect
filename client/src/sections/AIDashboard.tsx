import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function AIDashboard() {
  const expenseData = [
    { name: 'Flights', value: 182350, color: '#1A73E8' },
    { name: 'Hotels', value: 125800, color: '#34A853' },
    { name: 'Transport', value: 68540, color: '#FBBC04' },
    { name: 'Meals', value: 54210, color: '#4285F4' },
    { name: 'Other', value: 42350, color: '#EA4335' },
  ];

  return (
    <section id="ai-optimization" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-feature text-sm font-semibold uppercase tracking-wider">AI-Powered Insights</span>
            <h2 className="text-3xl font-bold mt-2 mb-6">Intelligent Cost Optimization</h2>
            <p className="text-neutral-700 mb-6">Our advanced AI analytics platform analyzes travel patterns, spending behaviors, and market conditions to identify opportunities for savings.</p>
            
            <div className="space-y-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-primary-light p-2 rounded-lg">
                    <i className="ri-line-chart-line text-primary"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Expense Analysis</h3>
                  <p className="text-neutral-600">Comprehensive analysis of travel expenses to identify patterns and optimization opportunities.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-primary-light p-2 rounded-lg">
                    <i className="ri-pie-chart-line text-primary"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Waste Identification</h3>
                  <p className="text-neutral-600">Pinpoint inefficiencies in your travel spending with precision targeting.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-primary-light p-2 rounded-lg">
                    <i className="ri-funds-line text-primary"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Savings Forecasting</h3>
                  <p className="text-neutral-600">Predictive models that project potential savings based on optimization strategies.</p>
                </div>
              </div>
            </div>
            
            <a href="#demo" className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-white hover:bg-primary-dark font-medium transition">
              See AI in Action
              <i className="ri-arrow-right-line ml-2"></i>
            </a>
          </div>
          
          <div className="relative bg-neutral-50 p-6 rounded-xl shadow-xl">
            {/* AI Dashboard Mockup */}
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-bold text-xl">TourChain AI Dashboard</h3>
                <div className="text-primary">
                  <span className="text-sm font-medium">Q3 2023</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-neutral-600 text-sm mb-1">Total Spend</p>
                  <p className="text-2xl font-bold">$483,250</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <i className="ri-arrow-down-line mr-1"></i> 12% vs. Last Quarter
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-neutral-600 text-sm mb-1">Savings Found</p>
                  <p className="text-2xl font-bold text-secondary">$78,500</p>
                  <p className="text-xs text-primary flex items-center mt-1">
                    <i className="ri-arrow-up-line mr-1"></i> 8% vs. Last Quarter
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-neutral-600 text-sm mb-1">Avg. Trip Cost</p>
                  <p className="text-2xl font-bold">$1,842</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <i className="ri-arrow-down-line mr-1"></i> 6% vs. Industry Avg
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Expense Breakdown</h4>
                  <div className="text-xs text-neutral-500">Last 90 days</div>
                </div>
                <div className="h-40 w-full bg-neutral-50 rounded">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={expenseData}
                      margin={{
                        top: 5,
                        right: 5,
                        left: 5,
                        bottom: 5,
                      }}
                      barSize={30}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="name" scale="point" axisLine={false} tickLine={false} />
                      <YAxis hide={true} />
                      <Tooltip 
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          color: 'white',
                          borderRadius: '4px',
                          border: 'none',
                        }}
                        labelStyle={{ color: 'white' }}
                      />
                      <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">AI Recommendations</h4>
                  <div className="text-xs text-success">Potential Savings: $42,800</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 bg-primary-light p-1.5 rounded-full mt-0.5">
                      <i className="ri-lightbulb-line text-primary text-sm"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">Switch NYC hotel bookings to preferred vendors for 15% average savings</p>
                      <p className="text-xs text-success">Est. savings: $18,500</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 bg-primary-light p-1.5 rounded-full mt-0.5">
                      <i className="ri-lightbulb-line text-primary text-sm"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">Book flights 21+ days in advance for LAX-SFO route</p>
                      <p className="text-xs text-success">Est. savings: $15,300</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 bg-primary-light p-1.5 rounded-full mt-0.5">
                      <i className="ri-lightbulb-line text-primary text-sm"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">Consolidate car rental vendors to qualify for volume discount</p>
                      <p className="text-xs text-success">Est. savings: $9,000</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary opacity-5 rounded-full -mt-10 -mr-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary opacity-5 rounded-full -mb-8 -ml-8"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
