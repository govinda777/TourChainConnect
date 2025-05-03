import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface JourneySession {
  id: string;
  type: string;
  email?: string;
  progress: number;
  stages: string[];
  currentStage: number;
  startedAt: string;
  lastActivityAt: string;
  completed: boolean;
  completedAt?: string;
}

export default function JourneyPage() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [journeySession, setJourneySession] = useState<JourneySession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Extract journey type from URL params if needed
  const journeyType = window.location.pathname.split("/")[2] || "default";
  
  // Diferentes jornadas e suas configurações visuais
  const journeys = {
    wellness: {
      title: "Jornada de Bem-Estar",
      color: "from-blue-500 to-indigo-600",
      icon: "ri-mental-health-line"
    },
    sustainability: {
      title: "Jornada de Sustentabilidade",
      color: "from-green-500 to-emerald-600",
      icon: "ri-plant-line"
    },
    optimization: {
      title: "Jornada de Otimização de Custos",
      color: "from-orange-500 to-amber-600",
      icon: "ri-funds-line"
    },
    blockchain: {
      title: "Jornada Tecnológica",
      color: "from-purple-500 to-purple-600",
      icon: "ri-link-m"
    },
    default: {
      title: "Processando sua Solicitação",
      color: "from-primary to-secondary",
      icon: "ri-global-line"
    }
  };
  
  const currentJourneyStyle = journeys[journeyType as keyof typeof journeys] || journeys.default;
  
  // Iniciar uma nova sessão de jornada no carregamento da página
  useEffect(() => {
    const startJourney = async () => {
      try {
        setLoading(true);
        
        // Obter email da sessionStorage/localStorage (se usuário preencheu formulário antes)
        const storedEmail = sessionStorage.getItem('userEmail') || undefined;
        
        // Criar uma nova sessão de jornada
        const response = await apiRequest('POST', '/api/journey', { 
          type: journeyType,
          email: storedEmail
        });
        
        if (!response.ok) {
          throw new Error('Falha ao iniciar jornada');
        }
        
        const journeyData = await response.json();
        setJourneySession(journeyData);
        setProgress(journeyData.progress);
        
        // Começar a atualizar o progresso automaticamente
        setLoading(false);
      } catch (err) {
        console.error("Erro ao iniciar jornada:", err);
        setError("Não foi possível iniciar a jornada. Por favor, tente novamente.");
        setLoading(false);
        
        toast({
          title: "Erro",
          description: "Não foi possível iniciar a jornada. Por favor, tente novamente.",
          variant: "destructive"
        });
      }
    };
    
    startJourney();
  }, [journeyType, toast]);
  
  // Atualizar progresso periodicamente
  useEffect(() => {
    if (!journeySession || loading) return;
    
    const updateProgress = async () => {
      // Se já completou, não atualiza mais
      if (journeySession.progress >= 100) return;
      
      const newProgress = Math.min(100, journeySession.progress + 1);
      
      try {
        const response = await apiRequest('PUT', `/api/journey/${journeySession.id}/progress`, {
          progress: newProgress
        });
        
        if (!response.ok) {
          throw new Error('Falha ao atualizar progresso');
        }
        
        const updatedJourney = await response.json();
        setJourneySession(updatedJourney);
        setProgress(updatedJourney.progress);
        
        // Se completou 100%, marca como concluído
        if (updatedJourney.progress >= 100) {
          completeJourney();
        }
      } catch (err) {
        console.error("Erro ao atualizar progresso:", err);
      }
    };
    
    const timer = setTimeout(updateProgress, 200);
    return () => clearTimeout(timer);
  }, [journeySession, loading]);
  
  // Função para marcar jornada como concluída
  const completeJourney = async () => {
    if (!journeySession) return;
    
    try {
      const response = await apiRequest('PUT', `/api/journey/${journeySession.id}/complete`, {});
      
      if (!response.ok) {
        throw new Error('Falha ao completar jornada');
      }
      
      const completedJourney = await response.json();
      setJourneySession(completedJourney);
      
      // Após marcar como completo, espera um pouco e redireciona
      setTimeout(() => {
        navigate("/crowdfunding");
      }, 2000);
    } catch (err) {
      console.error("Erro ao completar jornada:", err);
    }
  };
  
  // Ir para financiamento coletivo imediatamente
  const skipToFunding = () => {
    navigate("/crowdfunding");
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Iniciando sua experiência personalizada...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="text-red-500 text-5xl mb-4">
            <i className="ri-error-warning-line"></i>
          </div>
          <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado</h1>
          <p className="mb-6 text-neutral-600">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline" className="mr-2">
            Voltar ao Início
          </Button>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }
  
  if (!journeySession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentJourneyStyle.color} 
                          flex items-center justify-center text-white text-2xl`}>
            <i className={currentJourneyStyle.icon}></i>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-6 text-center">{currentJourneyStyle.title}</h1>
        
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className={`h-3 bg-neutral-100`} data-cy="journey-progress" />
        </div>
        
        <div className="space-y-6">
          {journeySession.stages.map((stageText, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-4 ${index <= journeySession.currentStage ? "opacity-100" : "opacity-40"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index < journeySession.currentStage 
                  ? "bg-green-100 text-green-600" 
                  : index === journeySession.currentStage 
                    ? "bg-blue-100 text-blue-600 animate-pulse" 
                    : "bg-neutral-100 text-neutral-400"
              }`}>
                {index < journeySession.currentStage ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div>
                <p className={`${index === journeySession.currentStage ? "font-medium" : ""}`}>{stageText}</p>
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
              data-cy="next-stage-button"
            >
              Continuar para Financiamento
            </Button>
          </div>
        )}
        
        {progress < 100 && (
          <div className="mt-8 text-center">
            <Button 
              variant="outline"
              onClick={skipToFunding}
              className="text-sm"
              data-cy="skip-to-funding-button"
            >
              Pular para Financiamento
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