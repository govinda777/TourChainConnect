import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function JourneyPage() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(1);
  const [, navigate] = useLocation();
  
  // Extract journey type from URL params if needed
  const journeyType = window.location.pathname.split("/")[2] || "default";
  
  useEffect(() => {
    // Simulate progression through stages
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prev => {
          const newProgress = prev + 1;
          
          // Update stage based on progress
          if (newProgress === 33) setStage(2);
          if (newProgress === 66) setStage(3);
          if (newProgress === 100) {
            // Redirect to crowdfunding page when complete
            setTimeout(() => navigate("/crowdfunding"), 1500);
          }
          
          return newProgress;
        });
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [progress, navigate]);
  
  // Different journey content based on type
  const journeys = {
    wellness: {
      title: "Jornada de Bem-Estar",
      stages: [
        "Analisando perfis de viajantes e padrões de bem-estar...",
        "Calculando métricas de saúde e satisfação...",
        "Preparando recomendações personalizadas..."
      ],
      color: "from-blue-500 to-indigo-600"
    },
    sustainability: {
      title: "Jornada de Sustentabilidade",
      stages: [
        "Calculando emissões de carbono das viagens corporativas...",
        "Analisando alternativas sustentáveis...",
        "Preparando plano de compensação ambiental..."
      ],
      color: "from-green-500 to-emerald-600"
    },
    optimization: {
      title: "Jornada de Otimização de Custos",
      stages: [
        "Analisando padrões de gastos e reservas...",
        "Identificando oportunidades de economia...",
        "Calculando projeções de redução de custos..."
      ],
      color: "from-orange-500 to-amber-600"
    },
    default: {
      title: "Processando sua Solicitação",
      stages: [
        "Iniciando verificação do sistema...",
        "Processando dados de entrada...",
        "Preparando resultados..."
      ],
      color: "from-primary to-secondary"
    }
  };
  
  const currentJourney = journeys[journeyType as keyof typeof journeys] || journeys.default;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">{currentJourney.title}</h1>
        
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className={`h-3 bg-neutral-100 bg-gradient-to-r ${currentJourney.color}`} />
        </div>
        
        <div className="space-y-6">
          {currentJourney.stages.map((stageText, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-4 ${index + 1 <= stage ? "opacity-100" : "opacity-40"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index + 1 < stage 
                  ? "bg-green-100 text-green-600" 
                  : index + 1 === stage 
                    ? "bg-blue-100 text-blue-600 animate-pulse" 
                    : "bg-neutral-100 text-neutral-400"
              }`}>
                {index + 1 < stage ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div>
                <p className={`${index + 1 === stage ? "font-medium" : ""}`}>{stageText}</p>
              </div>
            </div>
          ))}
        </div>
        
        {progress === 100 && (
          <div className="mt-8 text-center">
            <div className="mb-4 text-green-600 font-medium">Processo concluído!</div>
            <Button 
              onClick={() => navigate("/crowdfunding")}
              className="bg-primary hover:bg-primary-dark"
            >
              Continuar para Financiamento
            </Button>
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-neutral-500">
          Por favor, aguarde enquanto preparamos sua experiência personalizada.
        </div>
      </div>
    </div>
  );
}