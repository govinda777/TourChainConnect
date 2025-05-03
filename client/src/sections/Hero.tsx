import { useLocation } from "wouter";

export default function Hero() {
  const [, navigate] = useLocation();
  
  const startJourney = (journeyType: string) => {
    navigate(`/journey/${journeyType}`);
  };
  
  return (
    <section className="relative overflow-hidden py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Redefinindo Viagens Corporativas com Inovação, Bem-Estar e Sustentabilidade
            </h1>
            <p className="text-lg text-neutral-700 mb-8">
              Experimente uma nova era na gestão de viagens corporativas que prioriza o bem-estar da sua equipe, otimiza custos com IA e promove responsabilidade ambiental.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button 
                onClick={() => startJourney('optimization')}
                className="px-6 py-3 rounded-md bg-primary text-white hover:bg-primary-dark font-medium text-center transition"
              >
                Iniciar Experiência
              </button>
              <a href="#journeys" className="px-6 py-3 rounded-md border border-primary text-primary hover:bg-primary-light font-medium text-center transition">
                Explorar Jornadas
              </a>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => navigate("/crowdfunding")}
                className="text-sm px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Apoiar o Projeto
              </button>
              <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                Em desenvolvimento
              </span>
              <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800">
                Inovação Blockchain
              </span>
            </div>
            <div className="mt-4 flex items-center space-x-2">
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
              <p className="text-sm text-neutral-600"><span className="font-medium">500+</span> empresas aguardam o TourChain</p>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-xl shadow-xl max-w-full h-auto animate-float w-full h-96 bg-gradient-to-r from-primary-light to-primary-lighter flex items-center justify-center">
              <div className="text-white text-center">
                <i className="ri-global-line text-5xl mb-4"></i>
                <h3 className="text-2xl font-bold">TourChain</h3>
                <p className="text-lg opacity-80">Revolucionando viagens corporativas</p>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-secondary-light p-3 rounded-full">
                  <i className="ri-leaf-line text-secondary text-xl"></i>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Menos Emissões de Carbono</h3>
                  <p className="text-sm text-neutral-600">-32% vs média do setor</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-2 -right-2 bg-white p-3 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <i className="ri-heart-pulse-line text-blue-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Bem-estar</h3>
                  <p className="text-sm text-neutral-600">+45% satisfação</p>
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
