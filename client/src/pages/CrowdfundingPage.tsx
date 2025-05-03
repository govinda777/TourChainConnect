import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function CrowdfundingPage() {
  const { toast } = useToast();
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [paymentTab, setPaymentTab] = useState<"crypto" | "traditional">("crypto");
  const [isPledgeSubmitting, setIsPledgeSubmitting] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(1); // Preço inicial de 1 dólar
  const [tokensPurchased, setTokensPurchased] = useState<Array<{wallet: string, tokens: number, price: number}>>([]);
  const [, navigate] = useLocation();
  
  // Obter email da sessionStorage se disponível
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('userEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  
  // Mock data for crowdfunding campaign (em produção, seria obtido de um smart contract)
  const campaign = {
    title: "TourChain: Revolução nas Viagens Corporativas",
    description: "Ajude a construir o futuro das viagens corporativas com blockchain, bem-estar e sustentabilidade.",
    goal: 100000,
    raised: 67500,
    backers: 285,
    daysLeft: 18,
    tokenSymbol: "TOUR",
    contractAddress: "0x7Da37534E347561BEfC711F1a0dCFcb70735F268",
    networkName: "Ethereum (Sepolia Testnet)",
    featuredImage: "bg-gradient-to-r from-primary to-secondary"
  };

  const rewardTiers = [
    {
      id: "early-access",
      title: "Acesso Antecipado",
      amount: 250,
      tokenAmount: 500,
      description: "Seja um dos primeiros a utilizar a plataforma TourChain com acesso prioritário e suporte VIP por 3 meses.",
      claimed: 87,
      limit: 150,
      contractId: "0x001"
    },
    {
      id: "corporate-package",
      title: "Pacote Corporativo",
      amount: 1000,
      tokenAmount: 2000,
      description: "Licença para até 10 usuários por 6 meses, incluindo acesso a todas as funcionalidades de otimização de custos com IA.",
      claimed: 42,
      limit: 100,
      contractId: "0x002"
    },
    {
      id: "strategic-partner",
      title: "Parceiro Estratégico",
      amount: 5000,
      tokenAmount: 10000,
      description: "Torne-se um parceiro estratégico com acesso ilimitado por 1 ano e participe das reuniões de desenvolvimento de produto.",
      claimed: 12,
      limit: 25,
      contractId: "0x003"
    }
  ];

  const handlePledge = (amount: string, rewardId: string | null = null) => {
    setPledgeAmount(amount);
    setSelectedReward(rewardId);
    setIsDialogOpen(true);
  };

  // Simular conexão com carteira web3
  const handleConnectWallet = () => {
    setIsWalletConnecting(true);
    
    // Simulação de conexão com metamask ou carteira similar
    setTimeout(() => {
      const mockWalletAddress = "0x" + Math.random().toString(16).substring(2, 14) + "...";
      setWalletAddress(mockWalletAddress);
      setIsWalletConnecting(false);
      
      toast({
        title: "Carteira Conectada",
        description: `Conectado com endereço ${mockWalletAddress}`,
      });
    }, 1500);
  };

  // Função para processar o apoio/contribuição
  const handleCompletePledge = async () => {
    // Validação básica
    if (paymentTab === "traditional" && (!name || !email)) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (paymentTab === "crypto" && !walletAddress) {
      toast({
        title: "Carteira não conectada",
        description: "Por favor, conecte sua carteira para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsPledgeSubmitting(true);
    
    try {
      // Em um cenário web3 real, aqui chamaríamos funções de um smart contract
      // Para nossa demonstração, usaremos a API que criamos com armazenamento em memória
      
      if (paymentTab === "crypto") {
        // Simulação de interação com smart contract
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "Transação Enviada",
          description: "Sua transação foi enviada para a rede blockchain. Aguarde a confirmação.",
        });
        
        // Simular confirmação da blockchain após alguns segundos
        setTimeout(() => {
          toast({
            title: "Transação Confirmada",
            description: `Você recebeu ${parseInt(pledgeAmount) * 2} ${campaign.tokenSymbol} tokens em sua carteira!`,
          });
        }, 3000);
      } else {
        // Para pagamento tradicional, usamos nossa API
        const response = await apiRequest("POST", "/api/pledge", {
          name,
          email,
          amount: Number(pledgeAmount),
          rewardId: selectedReward,
          isAnonymous: false
        });
        
        if (!response.ok) {
          throw new Error("Falha ao processar pagamento");
        }
        
        // Armazenar email do usuário para uso futuro
        if (email) {
          sessionStorage.setItem('userEmail', email);
        }
        
        toast({
          title: "Apoio registrado com sucesso!",
          description: `Agradecemos seu apoio de R$ ${pledgeAmount}. Você receberá mais informações por email.`,
        });
      }
      
      // Fechar o dialog independente do método usado
      setIsDialogOpen(false);
      setIsPledgeSubmitting(false);
      
    } catch (error) {
      console.error("Erro ao processar apoio:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um erro ao processar seu apoio. Por favor, tente novamente.",
        variant: "destructive"
      });
      setIsPledgeSubmitting(false);
    }
  };

  const percentComplete = (campaign.raised / campaign.goal) * 100;
  
  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Campaign Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{campaign.title}</h1>
          <p className="text-lg text-neutral-700 mb-6" data-cy="campaign-description">{campaign.description}</p>
          
          {/* Campaign Image with Web3 Indicators */}
          <div className={`w-full h-64 sm:h-80 rounded-xl ${campaign.featuredImage} mb-6 flex items-center justify-center text-white relative overflow-hidden`}>
            <div className="absolute top-3 right-3 bg-black/30 text-white px-3 py-1 rounded-full text-xs font-mono">
              {campaign.contractAddress}
            </div>
            
            <div className="absolute top-3 left-3 bg-black/30 text-white px-3 py-1 rounded-full text-xs flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              {campaign.networkName}
            </div>
            
            <div className="text-center z-10">
              <div className="text-6xl font-bold mb-2">TourChain</div>
              <div className="text-xl">O futuro das viagens corporativas</div>
            </div>
            
            {/* Animated blockchain background */}
            <div className="absolute inset-0 opacity-20">
              <div className="animate-pulse absolute top-10 left-10 h-20 w-20 border-2 border-white rounded"></div>
              <div className="animate-pulse delay-100 absolute top-40 left-40 h-30 w-30 border-2 border-white rounded"></div>
              <div className="animate-pulse delay-200 absolute bottom-20 right-20 h-25 w-25 border-2 border-white rounded"></div>
              <div className="animate-pulse delay-300 absolute bottom-40 right-50 h-15 w-15 border-2 border-white rounded"></div>
            </div>
          </div>
          
          {/* Campaign Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">R$ {campaign.raised.toLocaleString()}</span>
                <span className="text-neutral-500">Meta: R$ {campaign.goal.toLocaleString()}</span>
              </div>
              <Progress value={percentComplete} className="h-2 bg-neutral-100" />
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold" data-cy="campaign-percentage">{percentComplete.toFixed(0)}%</div>
                <div className="text-sm text-neutral-500">Financiado</div>
              </div>
              <div>
                <div className="text-2xl font-bold" data-cy="campaign-backers">{campaign.backers}</div>
                <div className="text-sm text-neutral-500">Apoiadores</div>
              </div>
              <div>
                <div className="text-2xl font-bold" data-cy="campaign-days-left">{campaign.daysLeft}</div>
                <div className="text-sm text-neutral-500">Dias restantes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{campaign.tokenSymbol}</div>
                <div className="text-sm text-neutral-500">Token</div>
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
            data-cy="support-project-button"
          >
            <i className="ri-wallet-3-line mr-2"></i>
            Apoiar Este Projeto
          </Button>
          <p className="mt-2 text-neutral-500">Junte-se a outros {campaign.backers} apoiadores</p>
        </div>
        
        {/* Project Description */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Sobre o Projeto</h2>
          <div className="prose max-w-none">
            <p>TourChain é uma plataforma <strong>100% web3</strong> que revoluciona as viagens corporativas com tecnologia blockchain, algoritmos de bem-estar e contratos inteligentes para garantir sustentabilidade.</p>
            
            <p>Desenvolvemos uma solução descentralizada baseada em EVM (Ethereum Virtual Machine) que elimina intermediários, tornando as transações mais transparentes e eficientes. Com nosso protocolo exclusivo e ERC-4337 para facilitar a integração de usuários web2 com web3, estamos criando um ecossistema completo para departamentos de viagens corporativas.</p>
            
            <div className="my-8 flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="text-4xl text-blue-600 mr-4">
                  <i className="ri-information-line"></i>
                </div>
                <div>
                  <h3 className="font-bold text-blue-800 mb-1">Tecnologia Oracle</h3>
                  <p className="text-sm text-blue-700">
                    Utilizamos oracles para integrar dados off-chain (como voos e reservas de hotel) com nossa tecnologia blockchain, garantindo a veracidade dos dados e a imutabilidade dos registros.
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mt-6 mb-2">Por que investir no TourChain?</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Economia de custos de até 30% com a remoção de intermediários via smart contracts</li>
              <li>Oracles de IA para análise e otimização de gastos diretamente na blockchain</li>
              <li>NFTs exclusivos para programas de bem-estar de viajantes corporativos</li>
              <li>Certificados de carbono tokenizados para verificação e compensação transparente de emissões</li>
              <li>Staking de tokens TOUR para motoristas e empresas exemplares</li>
            </ul>
            
            <p>Seu investimento nos ajudará a finalizar o desenvolvimento dos smart contracts, expandir nossa rede de oracles e iniciar operações em mercados-chave da América Latina.</p>
          </div>
        </div>
        
        {/* Reward Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Recompensas</h2>
          <div className="space-y-4">
            {rewardTiers.map(tier => (
              <Card key={tier.id} className="p-6 border-2 border-primary/10 hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{tier.title}</h3>
                  <div className="flex flex-col items-end">
                    <div className="text-xl font-bold text-primary">R$ {tier.amount}</div>
                    <div className="text-sm text-neutral-500">ou {tier.tokenAmount} {campaign.tokenSymbol}</div>
                  </div>
                </div>
                <p className="text-neutral-700 mb-4">{tier.description}</p>
                
                <div className="bg-neutral-50 p-3 mb-4 rounded-md text-xs font-mono overflow-x-auto">
                  <div className="flex items-center text-neutral-500 mb-1">
                    <i className="ri-file-code-line mr-1"></i> Smart Contract
                  </div>
                  <div>{tier.contractId}:{campaign.contractAddress}::{tier.id}</div>
                </div>
                
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
        
        {/* Blockchain Technology Section */}
        <div className="mb-12 bg-gradient-to-r from-violet-50 to-indigo-50 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Tecnologia Blockchain</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl text-indigo-600 mb-2">
                <i className="ri-file-code-line"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">Smart Contracts</h3>
              <p className="text-sm">Contratos inteligentes baseados em EVM para garantir transparência, segurança e automação nas transações, eliminando intermediários e reduzindo custos.</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl text-indigo-600 mb-2">
                <i className="ri-database-2-line"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">Oracles</h3>
              <p className="text-sm">Integrações com sistemas off-chain para obter dados externos verificados, como preços de voos, disponibilidade de hotéis e compensações de carbono.</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl text-indigo-600 mb-2">
                <i className="ri-shield-check-line"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">ERC-4337</h3>
              <p className="text-sm">Implementação de contas abstratas para simplificar a experiência do usuário, permitindo que empresas utilizem o TourChain sem conhecimento técnico de blockchain.</p>
            </div>
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
              <p className="text-neutral-700">Utilizamos a tecnologia EVM para criar contratos inteligentes que garantem transparência e eliminam intermediários, reduzindo custos e aumentando a eficiência. Oracles conectam dados externos verificados à blockchain.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">O que são os tokens TOUR?</h3>
              <p className="text-neutral-700">Os tokens TOUR são tokens utilitários baseados no padrão ERC-20 que dão acesso à plataforma, descontos em serviços e direitos de voto em decisões de desenvolvimento. Apoiadores do crowdfunding receberão tokens proporcionais às suas contribuições.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Como os oracles são usados na plataforma?</h3>
              <p className="text-neutral-700">Utilizamos oracles para integrar dados off-chain (mundo real) com nossos smart contracts, garantindo que informações externas como preços de passagens, disponibilidade e certificados de compensação de carbono sejam verificados e registrados na blockchain.</p>
            </div>
          </div>
        </div>
        
        {/* Roadmap */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Roadmap</h2>
          <div className="relative">
            {/* Line */}
            <div className="absolute left-16 top-0 bottom-0 w-1 bg-primary/20"></div>
            
            {/* Milestones */}
            <div className="space-y-8">
              <div className="flex">
                <div className="w-16 pr-4 pt-1 flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                  <div className="font-bold text-lg">Q4 2025</div>
                  <div className="text-sm text-neutral-600">Lançamento dos Smart Contracts e MVP em Testnet</div>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-16 pr-4 pt-1 flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                  <div className="font-bold text-lg">Q1 2026</div>
                  <div className="text-sm text-neutral-600">Integração com Oracles e Implementação de ERC-4337</div>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-16 pr-4 pt-1 flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                  <div className="font-bold text-lg">Q2 2026</div>
                  <div className="text-sm text-neutral-600">Lançamento Oficial na Mainnet e Distribuição de Tokens</div>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-16 pr-4 pt-1 flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold">
                    4
                  </div>
                </div>
                <div className="flex-1 bg-neutral-50 p-4 rounded-lg shadow-sm border border-neutral-200">
                  <div className="font-bold text-lg">Q3 2026</div>
                  <div className="text-sm text-neutral-600">Expansão para América Latina e Novos Casos de Uso</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Faça Parte da Revolução Web3</h2>
          <p className="text-lg mb-6">Juntos, podemos transformar as viagens corporativas em experiências mais econômicas, saudáveis e sustentáveis, tudo com a segurança e transparência da blockchain.</p>
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg bg-primary hover:bg-primary-dark"
            onClick={() => handlePledge("100")}
          >
            <i className="ri-wallet-3-line mr-2"></i>
            Apoiar TourChain Agora
          </Button>
        </div>
      </div>
      
      {/* Pledge Dialog - Com opção de pagamento Web3 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center">
                <i className="ri-wallet-3-line mr-2 text-primary"></i>
                Complete seu apoio
              </div>
            </DialogTitle>
            <DialogDescription>
              Seu apoio ajudará a tornar o TourChain uma realidade
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="crypto" value={paymentTab} onValueChange={(v) => setPaymentTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="crypto">
                <i className="ri-coin-line mr-2"></i>
                Web3
              </TabsTrigger>
              <TabsTrigger value="traditional">
                <i className="ri-bank-card-line mr-2"></i>
                Tradicional
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="crypto" className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                <div className="flex items-center">
                  <i className="ri-information-line text-xl mr-2"></i>
                  <div>
                    Conecte sua carteira para apoiar o projeto e receber tokens TOUR automaticamente.
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Carteira</Label>
                {!walletAddress ? (
                  <Button 
                    type="button" 
                    className="w-full"
                    onClick={handleConnectWallet}
                    disabled={isWalletConnecting}
                  >
                    {isWalletConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <i className="ri-wallet-3-line mr-2"></i>
                        Conectar Carteira
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="bg-neutral-100 p-3 rounded font-mono text-sm flex items-center">
                    <i className="ri-wallet-3-line mr-2 text-green-600"></i>
                    {walletAddress}
                    <button 
                      className="ml-auto text-neutral-500 hover:text-neutral-700"
                      onClick={() => setWalletAddress("")}
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="token-amount">Quantidade Tokens ({campaign.tokenSymbol})</Label>
                <div className="flex items-center">
                  <Input
                    id="token-amount"
                    value={(parseInt(pledgeAmount || "0") * 2).toString()}
                    className="bg-neutral-50"
                    readOnly
                  />
                  <div className="ml-2 text-xs text-neutral-500">
                    2x valor
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="crypto-amount">Valor (USDC)</Label>
                <Input 
                  id="crypto-amount" 
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(e.target.value)}
                />
              </div>
              
              {selectedReward && (
                <div className="bg-neutral-50 p-3 rounded-md">
                  <div className="font-medium">Recompensa selecionada:</div>
                  <div className="flex justify-between">
                    <div>{rewardTiers.find(tier => tier.id === selectedReward)?.title}</div>
                    <div className="text-xs font-mono">{rewardTiers.find(tier => tier.id === selectedReward)?.contractId}</div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="traditional" className="space-y-4">
              <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-700">
                <div className="flex items-center">
                  <i className="ri-information-line text-xl mr-2"></i>
                  <div>
                    Em breve, a plataforma funcionará 100% via blockchain. Por enquanto, também aceitamos transações tradicionais via Oracle.
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input 
                  id="name" 
                  placeholder="Seu nome" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleCompletePledge}
              disabled={isPledgeSubmitting}
            >
              {isPledgeSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>Confirmar Apoio</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}