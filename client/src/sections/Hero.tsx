export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Redefining Corporate Travel with Innovation, Wellness & Sustainability
            </h1>
            <p className="text-lg text-neutral-700 mb-8">
              Experience a new era of business travel management that prioritizes your team's well-being, optimizes costs with AI, and champions environmental responsibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#solutions" className="px-6 py-3 rounded-md bg-primary text-white hover:bg-primary-dark font-medium text-center transition">
                Explore Solutions
              </a>
              <a href="#demo" className="px-6 py-3 rounded-md border border-primary text-primary hover:bg-primary-light font-medium text-center transition">
                Schedule Demo
              </a>
            </div>
            <div className="mt-8 flex items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-neutral-300 flex items-center justify-center text-neutral-600 text-xs">
                  <i className="ri-user-line"></i>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-neutral-300 flex items-center justify-center text-neutral-600 text-xs">
                  <i className="ri-user-line"></i>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-neutral-300 flex items-center justify-center text-neutral-600 text-xs">
                  <i className="ri-user-line"></i>
                </div>
              </div>
              <p className="text-sm text-neutral-600"><span className="font-medium">500+</span> companies trust TourChain</p>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-xl shadow-xl max-w-full h-auto animate-float w-full h-96 bg-neutral-100 flex items-center justify-center">
              <svg className="w-24 h-24 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm-4.44-6.44l-2.35 3.02-1.56-1.88c-.2-.25-.58-.24-.78.01l-1.74 2.23c-.2.26-.02.64.29.64h8.98c.3 0 .48-.37.29-.64l-2.55-3.21c-.19-.24-.55-.24-.75.02z"/>
              </svg>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-secondary-light p-3 rounded-full">
                  <i className="ri-leaf-line text-secondary text-xl"></i>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Reduced Carbon Footprint</h3>
                  <p className="text-sm text-neutral-600">-32% vs industry average</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 -z-10 w-full h-full">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1A73E8', stopOpacity: '0.1' }} />
              <stop offset="100%" style={{ stopColor: '#34A853', stopOpacity: '0.2' }} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)" />
        </svg>
      </div>
    </section>
  );
}
