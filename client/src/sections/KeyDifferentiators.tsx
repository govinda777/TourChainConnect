export default function KeyDifferentiators() {
  return (
    <section id="solutions" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-6">Key Differentiators</h2>
          <p className="text-lg text-neutral-700">TourChain integrates innovation, well-being, and sustainability to transform corporate travel management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Wellness Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
            <div className="h-48 bg-primary-light flex items-center justify-center">
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm-5-7h10v-2H7v2z"/>
                </svg>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary-light p-2 rounded-full mr-3">
                  <i className="ri-mental-health-line text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-bold">Travel Wellness</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Comprehensive wellness programs with physical and mental health support for your traveling team members.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Remote psychological support</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>In-travel relaxation options</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Personalized wellness plans</span>
                </li>
              </ul>
              <a href="#wellness" className="inline-flex items-center text-primary font-medium hover:text-primary-dark">
                Explore Wellness Programs
                <i className="ri-arrow-right-line ml-1"></i>
              </a>
            </div>
          </div>

          {/* AI Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
            <div className="h-48 bg-primary-light flex items-center justify-center">
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm-5-7h10v-2H7v2z"/>
                </svg>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary-light p-2 rounded-full mr-3">
                  <i className="ri-robot-line text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-bold">AI Cost Optimization</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Advanced AI analytics that identify savings opportunities and deliver personalized recommendations.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Expense pattern analysis</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Waste identification</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Predictive pricing models</span>
                </li>
              </ul>
              <a href="#ai-optimization" className="inline-flex items-center text-primary font-medium hover:text-primary-dark">
                Discover AI Capabilities
                <i className="ri-arrow-right-line ml-1"></i>
              </a>
            </div>
          </div>

          {/* Sustainability Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
            <div className="h-48 bg-primary-light flex items-center justify-center">
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm-5-7h10v-2H7v2z"/>
                </svg>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary-light p-2 rounded-full mr-3">
                  <i className="ri-leaf-line text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-bold">Sustainability Focus</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Offset carbon footprint and earn "TourChain Sustainable" certification for your organization.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Carbon footprint tracking</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Offset program integration</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-secondary mt-1 mr-2"></i>
                  <span>Sustainability certification</span>
                </li>
              </ul>
              <a href="#sustainability" className="inline-flex items-center text-primary font-medium hover:text-primary-dark">
                Explore Sustainability Program
                <i className="ri-arrow-right-line ml-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
