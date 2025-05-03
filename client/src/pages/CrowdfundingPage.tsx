import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CrowdfundingPage() {
  const { toast } = useToast();
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  
  // Mock data for crowdfunding campaign
  const campaign = {
    title: "TourChain: Revolução nas Viagens Corporativas",
    description: "Ajude a construir o futuro das viagens corporativas com blockchain, bem-estar e sustentabilidade.",
    goal: 100000,
    raised: 67500,
    backers: 285,
    daysLeft: 18,
    featuredImage: "bg-gradient-to-r from-primary to-secondary"
  };

  const rewardTiers = [
    {
      id: "early-access",
      title: "Acesso Antecipado",
      amount: 250,
      description: "Seja um dos primeiros a utilizar a plataforma TourChain com acesso prioritário e suporte VIP por 3 meses.",
      claimed: 87,
      limit: 150
    },
    {
      id: "corporate-package",
      title: "Pacote Corporativo",
      amount: 1000,
      description: "Licença para até 10 usuários por 6 meses, incluindo acesso a todas as funcionalidades de otimização de custos com IA.",
      claimed: 42,
      limit: 100
    },
    {
      id: "strategic-partner",
      title: "Parceiro Estratégico",
      amount: 5000,
      description: "Torne-se um parceiro estratégico com acesso ilimitado por 1 ano e participe das reuniões de desenvolvimento de produto.",
      claimed: 12,
      limit: 25
    }
  ];

  const handlePledge = (amount: string, rewardId: string | null = null) => {
    setPledgeAmount(amount);
    setSelectedReward(rewardId);
    setIsDialogOpen(true);
  };

  const handleCompletePledge = () => {
    toast({
      title: "Apoio registrado com sucesso!",
      description: `Agradecemos seu apoio de R$ ${pledgeAmount}. Você receberá mais informações por email.`,
    });
    setIsDialogOpen(false);
  };

  const percentComplete = (campaign.raised / campaign.goal) * 100;
  
  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Campaign Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{campaign.title}</h1>
          <p className="text-lg text-neutral-700 mb-6">{campaign.description}</p>
          
          {/* Campaign Image */}
          <div className={`w-full h-64 sm:h-80 rounded-xl ${campaign.featuredImage} mb-6 flex items-center justify-center text-white`}>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">TourChain</div>
              <div className="text-xl">O futuro das viagens corporativas</div>
            </div>
          </div>
          
          {/* Campaign Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">R$ {campaign.raised.toLocaleString()}</span>
                <span className="text-neutral-500">Meta: R$ {campaign.goal.toLocaleString()}</span>
              </div>
              <Progress value={percentComplete} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{percentComplete.toFixed(0)}%</div>
                <div className="text-sm text-neutral-500">Financiado</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{campaign.backers}</div>
                <div className="text-sm text-neutral-500">Apoiadores</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{campaign.daysLeft}</div>
                <div className="text-sm text-neutral-500">Dias restantes</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contribution Button */}
        <div className="mb-12 text-center">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg bg-primary hover:bg-primary-dark"
            onClick={() => handlePledge("100")}
          >
            Apoiar Este Projeto
          </Button>
          <p className="mt-2 text-neutral-500">Junte-se a outros {campaign.backers} apoiadores</p>
        </div>
        
        {/* Project Description */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Sobre o Projeto</h2>
          <div className="prose max-w-none">
            <p>TourChain é uma plataforma revolucionária que combina blockchain, bem-estar e sustentabilidade para redefinir a experiência de viagens corporativas.</p>
            
            <p>Desenvolvemos uma solução descentralizada baseada em EVM (Ethereum Virtual Machine) que elimina intermediários, tornando as transações mais transparentes e eficientes. Com nosso protocolo exclusivo e ERC-4337 para facilitar a integração de usuários web2 com web3, estamos criando um ecossistema completo para departamentos de viagens corporativas.</p>
            
            <h3 className="text-xl font-bold mt-6 mb-2">Por que investir no TourChain?</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Economia de custos significativa para empresas</li>
              <li>Dashboard de IA para análise e otimização de gastos</li>
              <li>Programas de bem-estar para viajantes corporativos</li>
              <li>Cálculo e compensação de pegada de carbono</li>
              <li>Sistema de recompensas para motoristas e empresas exemplares</li>
            </ul>
            
            <p>Seu investimento nos ajudará a finalizar o desenvolvimento da plataforma, expandir nossa equipe e iniciar operações em mercados-chave da América Latina.</p>
          </div>
        </div>
        
        {/* Reward Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Recompensas</h2>
          <div className="space-y-4">
            {rewardTiers.map(tier => (
              <Card key={tier.id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{tier.title}</h3>
                  <div className="text-xl font-bold text-primary">R$ {tier.amount}</div>
                </div>
                <p className="text-neutral-700 mb-4">{tier.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-neutral-500">
                    {tier.claimed} de {tier.limit} reivindicados
                  </div>
                  <Button 
                    onClick={() => handlePledge(tier.amount.toString(), tier.id)}
                    variant={tier.claimed >= tier.limit ? "outline" : "default"}
                    disabled={tier.claimed >= tier.limit}
                  >
                    {tier.claimed >= tier.limit ? "Esgotado" : "Selecionar"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Quando a plataforma será lançada?</h3>
              <p className="text-neutral-700">O lançamento oficial está previsto para o primeiro trimestre de 2026, com beta fechado para apoiadores a partir do último trimestre de 2025.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Como funciona o sistema baseado em blockchain?</h3>
              <p className="text-neutral-700">Utilizamos a tecnologia EVM para criar contratos inteligentes que garantem transparência e eliminam intermediários, reduzindo custos e aumentando a eficiência.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Quais são as opções de compensação de carbono?</h3>
              <p className="text-neutral-700">Oferecemos três programas principais: reflorestamento, investimento em energias renováveis e conservação dos oceanos, permitindo que as empresas escolham onde investir para compensar sua pegada de carbono.</p>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center bg-neutral-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Faça Parte da Revolução</h2>
          <p className="text-lg mb-6">Juntos, podemos transformar as viagens corporativas em experiências mais econômicas, saudáveis e sustentáveis.</p>
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg bg-primary hover:bg-primary-dark"
            onClick={() => handlePledge("100")}
          >
            Apoiar TourChain Agora
          </Button>
        </div>
      </div>
      
      {/* Pledge Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete seu apoio</DialogTitle>
            <DialogDescription>
              Seu apoio ajudará a tornar o TourChain uma realidade
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" placeholder="Seu nome" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input 
                id="amount" 
                value={pledgeAmount} 
                onChange={(e) => setPledgeAmount(e.target.value)} 
              />
            </div>
            
            {selectedReward && (
              <div className="bg-neutral-50 p-3 rounded-md">
                <div className="font-medium">Recompensa selecionada:</div>
                <div>{rewardTiers.find(tier => tier.id === selectedReward)?.title}</div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleCompletePledge}>Confirmar Apoio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}