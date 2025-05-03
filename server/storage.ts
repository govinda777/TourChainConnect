import { users, type User, type InsertUser, 
  type DemoRequest, type InsertDemoRequest } from "@shared/schema";

// Interfaces para nossas estruturas de dados em memória
interface JourneySession {
  id: string;
  type: string;
  email?: string;
  progress: number;
  stages: string[];
  currentStage: number;
  startedAt: Date;
  lastActivityAt: Date;
  completed: boolean;
  completedAt?: Date;
}

interface CrowdfundingPledge {
  id: number;
  name?: string;
  email: string;
  amount: number;
  rewardId?: string;
  comment?: string;
  isAnonymous: boolean;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest>;
  getAllDemoRequests(): Promise<DemoRequest[]>;
  
  // Métodos para jornadas
  createJourneySession(type: string, email?: string): Promise<JourneySession>;
  getJourneySession(id: string): Promise<JourneySession | undefined>;
  updateJourneyProgress(id: string, progress: number): Promise<JourneySession>;
  completeJourney(id: string): Promise<JourneySession>;
  
  // Métodos para financiamento coletivo
  createPledge(pledge: Omit<CrowdfundingPledge, 'id' | 'createdAt' | 'status'>): Promise<CrowdfundingPledge>;
  getPledges(): Promise<CrowdfundingPledge[]>;
  getPledge(id: number): Promise<CrowdfundingPledge | undefined>;
  updatePledgeStatus(id: number, status: 'pending' | 'completed' | 'cancelled'): Promise<CrowdfundingPledge | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private demoRequests: Map<number, DemoRequest>;
  private journeys: Map<string, JourneySession>;
  private pledges: Map<number, CrowdfundingPledge>;
  
  currentId: number;
  currentDemoRequestId: number;
  currentPledgeId: number;

  constructor() {
    this.users = new Map();
    this.demoRequests = new Map();
    this.journeys = new Map();
    this.pledges = new Map();
    
    this.currentId = 1;
    this.currentDemoRequestId = 1;
    this.currentPledgeId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest> {
    const id = this.currentDemoRequestId++;
    const createdAt = new Date();
    const demoRequest: DemoRequest = { ...request, id, createdAt };
    this.demoRequests.set(id, demoRequest);
    return demoRequest;
  }
  
  async getAllDemoRequests(): Promise<DemoRequest[]> {
    return Array.from(this.demoRequests.values());
  }
  
  // Implementação de métodos para jornadas
  async createJourneySession(type: string, email?: string): Promise<JourneySession> {
    // Gerar um ID único para a sessão (na vida real, usaríamos algo como UUID)
    const id = `journey_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Definir estágios padrão baseados no tipo
    let stages: string[] = [];
    switch (type) {
      case 'wellness':
        stages = [
          "Analisando perfis de viajantes e padrões de bem-estar...",
          "Calculando métricas de saúde e satisfação...",
          "Preparando recomendações personalizadas..."
        ];
        break;
      case 'sustainability':
        stages = [
          "Calculando emissões de carbono das viagens corporativas...",
          "Analisando alternativas sustentáveis...",
          "Preparando plano de compensação ambiental..."
        ];
        break;
      case 'optimization':
        stages = [
          "Analisando padrões de gastos e reservas...",
          "Identificando oportunidades de economia...",
          "Calculando projeções de redução de custos..."
        ];
        break;
      case 'blockchain':
        stages = [
          "Verificando tecnologia blockchain...",
          "Integrando contratos inteligentes...",
          "Configurando protocolos descentralizados..."
        ];
        break;
      default:
        stages = [
          "Iniciando verificação do sistema...",
          "Processando dados de entrada...",
          "Preparando resultados..."
        ];
    }
    
    const journey: JourneySession = {
      id,
      type,
      email,
      progress: 0,
      stages,
      currentStage: 0,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      completed: false
    };
    
    this.journeys.set(id, journey);
    return journey;
  }
  
  async getJourneySession(id: string): Promise<JourneySession | undefined> {
    return this.journeys.get(id);
  }
  
  async updateJourneyProgress(id: string, progress: number): Promise<JourneySession> {
    const journey = this.journeys.get(id);
    if (!journey) {
      throw new Error("Jornada não encontrada");
    }
    
    journey.progress = Math.min(100, Math.max(0, progress));
    journey.lastActivityAt = new Date();
    
    // Atualizar estágio atual com base no progresso
    if (progress < 33) {
      journey.currentStage = 0;
    } else if (progress < 66) {
      journey.currentStage = 1;
    } else if (progress < 100) {
      journey.currentStage = 2;
    } else {
      journey.currentStage = 3;
    }
    
    this.journeys.set(id, journey);
    return journey;
  }
  
  async completeJourney(id: string): Promise<JourneySession> {
    const journey = this.journeys.get(id);
    if (!journey) {
      throw new Error("Jornada não encontrada");
    }
    
    journey.progress = 100;
    journey.completed = true;
    journey.completedAt = new Date();
    journey.lastActivityAt = new Date();
    
    this.journeys.set(id, journey);
    return journey;
  }
  
  // Implementação de métodos para financiamento coletivo
  async createPledge(pledgeData: Omit<CrowdfundingPledge, 'id' | 'createdAt' | 'status'>): Promise<CrowdfundingPledge> {
    const id = this.currentPledgeId++;
    const pledge: CrowdfundingPledge = {
      ...pledgeData,
      id,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.pledges.set(id, pledge);
    return pledge;
  }
  
  async getPledges(): Promise<CrowdfundingPledge[]> {
    return Array.from(this.pledges.values());
  }
  
  async getPledge(id: number): Promise<CrowdfundingPledge | undefined> {
    return this.pledges.get(id);
  }
  
  async updatePledgeStatus(id: number, status: 'pending' | 'completed' | 'cancelled'): Promise<CrowdfundingPledge | undefined> {
    const pledge = this.pledges.get(id);
    if (!pledge) {
      return undefined;
    }
    
    pledge.status = status;
    this.pledges.set(id, pledge);
    return pledge;
  }
}

export const storage = new MemStorage();
