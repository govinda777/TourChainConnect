import { useLocation } from "wouter";
import Hero from "@/sections/Hero";
import Stats from "@/sections/Stats";
import KeyDifferentiators from "@/sections/KeyDifferentiators";
import AIDashboard from "@/sections/AIDashboard";
import WellnessProgram from "@/sections/WellnessProgram";
import SustainabilityCalculator from "@/sections/SustainabilityCalculator";
import TransparencyAudit from "@/sections/TransparencyAudit";
import Testimonials from "@/sections/Testimonials";
import DemoRequest from "@/sections/DemoRequest";
import Resources from "@/sections/Resources";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const [, navigate] = useLocation();

  // Handle smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      
      if (anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            window.scrollTo({
              top: targetElement.getBoundingClientRect().top + window.scrollY - 80,
              behavior: 'smooth'
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  // Handlers for journey navigation
  const startJourney = (journeyType: string) => {
    navigate(`/journey/${journeyType}`);
  };

  // Jornadas disponíveis para exploração
  const journeys = [
    {
      id: "wellness",
      title: "Jornada de Bem-Estar",
      description: "Descubra como o TourChain pode melhorar a qualidade de vida dos viajantes corporativos, reduzindo estresse e aumentando a produtividade.",
      icon: "ri-mental-health-line",
      color: "bg-blue-50 border-blue-200 text-blue-700",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: "sustainability",
      title: "Jornada de Sustentabilidade",
      description: "Explore nossa solução de cálculo e compensação de carbono, e como podemos ajudar sua empresa a alcançar objetivos ESG.",
      icon: "ri-plant-line",
      color: "bg-green-50 border-green-200 text-green-700",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    {
      id: "optimization",
      title: "Jornada de Economia",
      description: "Veja como nossa IA pode analisar seus gastos com viagens e identificar oportunidades de economia de até 30%.",
      icon: "ri-funds-line",
      color: "bg-amber-50 border-amber-200 text-amber-700",
      buttonColor: "bg-amber-600 hover:bg-amber-700"
    },
    {
      id: "blockchain",
      title: "Jornada Tecnológica",
      description: "Entenda como a tecnologia blockchain elimina intermediários e torna as transações mais transparentes e eficientes.",
      icon: "ri-link-m",
      color: "bg-purple-50 border-purple-200 text-purple-700",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  return (
    <main>
      <Hero />
      <Stats />
      <KeyDifferentiators />
      
      {/* Nova seção de Jornadas */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Nossas Jornadas</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Escolha uma jornada para experimentar uma prévia do poder do TourChain e descubra como podemos transformar as viagens corporativas da sua empresa.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {journeys.map((journey) => (
              <Card 
                key={journey.id} 
                className={`p-6 border-2 ${journey.color} hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-white shadow-sm">
                    <i className={`${journey.icon} text-2xl`}></i>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-2">{journey.title}</h3>
                    <p className="mb-4">{journey.description}</p>
                    <Button 
                      onClick={() => startJourney(journey.id)}
                      className={journey.buttonColor}
                    >
                      Iniciar Jornada
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/crowdfunding")}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Apoiar o Projeto Diretamente
            </Button>
          </div>
        </div>
      </section>
      
      <AIDashboard />
      <WellnessProgram />
      <SustainabilityCalculator />
      <TransparencyAudit />
      <Testimonials />
      <DemoRequest />
      <Resources />
    </main>
  );
}
