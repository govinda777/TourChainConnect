import { Progress } from "@/components/ui/progress";

export default function WellnessProgram() {
  return (
    <section id="wellness" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-feature text-sm font-semibold uppercase tracking-wider">Employee Experience</span>
          <h2 className="text-3xl font-bold mt-2 mb-6">Travel Wellness Programs</h2>
          <p className="text-lg text-neutral-700">Supporting your team's physical and mental well-being during business travel with comprehensive wellness solutions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-video bg-neutral-100 flex items-center justify-center">
              <svg className="w-24 h-24 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm-4.44-6.44l-2.35 3.02-1.56-1.88c-.2-.25-.58-.24-.78.01l-1.74 2.23c-.2.26-.02.64.29.64h8.98c.3 0 .48-.37.29-.64l-2.55-3.21c-.19-.24-.55-.24-.75.02z"/>
              </svg>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4">Comprehensive Wellness Support</h3>
              <p className="text-neutral-700 mb-6">
                TourChain's wellness program goes beyond traditional travel management by providing holistic support for your team's well-being during business trips.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-light p-2 rounded-lg mt-1">
                    <i className="ri-mental-health-line text-primary"></i>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium mb-1">Mental Health Support</h4>
                    <p className="text-sm text-neutral-600">On-demand psychological support for travelers experiencing stress or anxiety.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-light p-2 rounded-lg mt-1">
                    <i className="ri-heart-pulse-line text-primary"></i>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium mb-1">Physical Wellness</h4>
                    <p className="text-sm text-neutral-600">Access to fitness facilities and recommendations for healthy dining options.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-light p-2 rounded-lg mt-1">
                    <i className="ri-zzz-line text-primary"></i>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium mb-1">Rest & Recovery</h4>
                    <p className="text-sm text-neutral-600">Sleep optimization tips and jet lag management techniques.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-light p-2 rounded-lg mt-1">
                    <i className="ri-user-heart-line text-primary"></i>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium mb-1">Work-Life Balance</h4>
                    <p className="text-sm text-neutral-600">Tools to maintain connection with family while traveling for business.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
              <div className="flex items-center mb-4">
                <div className="bg-primary-light p-2 rounded-full mr-3">
                  <i className="ri-smartphone-line text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-bold">Wellness App</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Access all wellness resources through our intuitive mobile application.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>One-tap access to wellness resources</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Personalized wellness recommendations</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Track wellness metrics during travel</span>
                </li>
              </ul>
              <div className="w-full h-32 rounded-lg mt-4 bg-neutral-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm-4.44-6.44l-2.35 3.02-1.56-1.88c-.2-.25-.58-.24-.78.01l-1.74 2.23c-.2.26-.02.64.29.64h8.98c.3 0 .48-.37.29-.64l-2.55-3.21c-.19-.24-.55-.24-.75.02z"/>
                </svg>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
              <div className="flex items-center mb-4">
                <div className="bg-primary-light p-2 rounded-full mr-3">
                  <i className="ri-group-line text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-bold">Wellness Results</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-neutral-700">Employee Satisfaction</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2 bg-neutral-200" indicatorClassName="bg-secondary" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-neutral-700">Stress Reduction</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2 bg-neutral-200" indicatorClassName="bg-secondary" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-neutral-700">Productivity Increase</span>
                    <span className="text-sm font-medium">36%</span>
                  </div>
                  <Progress value={36} className="h-2 bg-neutral-200" indicatorClassName="bg-secondary" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-neutral-700">Sick Days Reduction</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2 bg-neutral-200" indicatorClassName="bg-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <a href="#demo" className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-white hover:bg-primary-dark font-medium transition">
            Schedule Wellness Demo
            <i className="ri-arrow-right-line ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
