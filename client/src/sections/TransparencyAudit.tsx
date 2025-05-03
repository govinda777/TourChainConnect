import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, LineChart, LockKeyhole, Users, Clock, CheckCircle } from "lucide-react";

export default function TransparencyAudit() {
  const [, navigate] = useLocation();

  return (
    <section id="transparency" className="py-16 bg-indigo-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-4">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Transparência e Auditoria</h2>
          <p className="text-lg text-neutral-700 mb-8">
            O TourChain utiliza tecnologia blockchain para garantir a transparência
            e imutabilidade de todas as transações realizadas. Nosso sistema de 
            auditoria permite que você acompanhe em tempo real o fluxo de recursos
            e a governança da plataforma.
          </p>
          <Button 
            onClick={() => navigate("/audit-dashboard")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-6 h-auto text-lg"
          >
            Acessar Dashboard de Auditoria
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100">
            <div className="mb-4 p-3 bg-indigo-100 rounded-full inline-block">
              <LineChart className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Rastreamento Completo</h3>
            <p className="text-neutral-600">
              Todas as transações são registradas permanentemente na blockchain, 
              permitindo auditoria completa do histórico de operações.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100">
            <div className="mb-4 p-3 bg-indigo-100 rounded-full inline-block">
              <LockKeyhole className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Multi-assinatura</h3>
            <p className="text-neutral-600">
              Utilizamos carteiras Gnosis Safe com multi-assinatura para 
              garantir que operações críticas exijam aprovação de múltiplos administradores.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100">
            <div className="mb-4 p-3 bg-indigo-100 rounded-full inline-block">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Governança Transparente</h3>
            <p className="text-neutral-600">
              Todos os processos de tomada de decisão são registrados e podem ser 
              verificados, garantindo a integridade do protocolo.
            </p>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-indigo-200">
          <h3 className="text-2xl font-bold mb-5 text-center">Processo de Auditoria</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="font-bold text-indigo-600">1</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Registro em Blockchain</h4>
                <p className="text-neutral-600">
                  Cada transação é registrada na blockchain Polygon, garantindo imutabilidade e transparência.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="font-bold text-indigo-600">2</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Validação Multi-assinatura</h4>
                <p className="text-neutral-600">
                  Transações importantes precisam da assinatura de no mínimo 2 administradores para serem executadas.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="font-bold text-indigo-600">3</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Transparência Pública</h4>
                <p className="text-neutral-600">
                  Qualquer pessoa pode verificar as transações realizadas através do dashboard público de auditoria.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="font-bold text-indigo-600">4</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Relatórios Periódicos</h4>
                <p className="text-neutral-600">
                  Emitimos relatórios trimestrais detalhando todas as operações financeiras e uso de recursos.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              variant="outline"
              onClick={() => navigate("/audit-dashboard")}
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verificar Transparência Agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}