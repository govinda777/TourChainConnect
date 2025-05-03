export default function Testimonials() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-feature text-sm font-semibold uppercase tracking-wider">Success Stories</span>
          <h2 className="text-3xl font-bold mt-2 mb-6">Trusted by Leading Companies</h2>
          <p className="text-lg text-neutral-700">Hear from organizations that have transformed their corporate travel experience with TourChain.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-accent text-xl">
                <i className="ri-double-quotes-l"></i>
              </div>
            </div>
            <p className="text-neutral-700 mb-6">
              "TourChain's AI-powered cost optimization helped us reduce our travel expenses by 28% while maintaining high-quality travel experiences for our team."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600">
                <i className="ri-user-line"></i>
              </div>
              <div className="ml-4">
                <p className="font-medium">Michael Lawson</p>
                <p className="text-sm text-neutral-500">CFO, TechCorp Inc.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-accent text-xl">
                <i className="ri-double-quotes-l"></i>
              </div>
            </div>
            <p className="text-neutral-700 mb-6">
              "The wellness program has transformed how our employees feel about business travel. We've seen notable improvements in productivity and satisfaction scores."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600">
                <i className="ri-user-line"></i>
              </div>
              <div className="ml-4">
                <p className="font-medium">Sarah Chen</p>
                <p className="text-sm text-neutral-500">HR Director, GlobalHealth</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-accent text-xl">
                <i className="ri-double-quotes-l"></i>
              </div>
            </div>
            <p className="text-neutral-700 mb-6">
              "Achieving our sustainability goals was made possible with TourChain's carbon offset program. The certification has strengthened our brand reputation."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600">
                <i className="ri-user-line"></i>
              </div>
              <div className="ml-4">
                <p className="font-medium">David Rodriguez</p>
                <p className="text-sm text-neutral-500">Sustainability Lead, EcoTech</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 flex flex-wrap justify-center items-center gap-12 opacity-70">
          <div className="w-32">
            <div className="h-12 bg-neutral-300 rounded flex items-center justify-center text-neutral-600 font-bold">LOGO 1</div>
          </div>
          <div className="w-32">
            <div className="h-12 bg-neutral-300 rounded flex items-center justify-center text-neutral-600 font-bold">LOGO 2</div>
          </div>
          <div className="w-32">
            <div className="h-12 bg-neutral-300 rounded flex items-center justify-center text-neutral-600 font-bold">LOGO 3</div>
          </div>
          <div className="w-32">
            <div className="h-12 bg-neutral-300 rounded flex items-center justify-center text-neutral-600 font-bold">LOGO 4</div>
          </div>
          <div className="w-32">
            <div className="h-12 bg-neutral-300 rounded flex items-center justify-center text-neutral-600 font-bold">LOGO 5</div>
          </div>
        </div>
      </div>
    </section>
  );
}
