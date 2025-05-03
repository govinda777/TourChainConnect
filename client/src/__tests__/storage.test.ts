// Arquivo mocado para testes
class MemStorage {
  private users = new Map();
  private demoRequests = new Map();
  private journeys = new Map();
  private pledges = new Map();
  currentId = 1;
  currentDemoRequestId = 1;
  currentPledgeId = 1;
  
  constructor() {}
  
  async getUser(id) {
    return this.users.get(id);
  }
  
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async createJourneySession(type, email) {
    const id = `session-${Date.now()}`;
    const now = new Date();
    const journey = {
      id,
      type,
      email,
      progress: 0,
      stages: ['Estágio 1', 'Estágio 2', 'Estágio 3'],
      currentStage: 0,
      startedAt: now,
      lastActivityAt: now,
      completed: false
    };
    this.journeys.set(id, journey);
    return journey;
  }
  
  async getJourneySession(id) {
    return this.journeys.get(id);
  }
  
  async updateJourneyProgress(id, progress) {
    const journey = this.journeys.get(id);
    if (!journey) return undefined;
    journey.progress = progress;
    journey.lastActivityAt = new Date();
    return journey;
  }
  
  async completeJourney(id) {
    const journey = this.journeys.get(id);
    if (!journey) return undefined;
    journey.completed = true;
    journey.completedAt = new Date();
    return journey;
  }
  
  async createPledge(pledgeData) {
    const id = this.currentPledgeId++;
    const pledge = {
      ...pledgeData,
      id,
      status: 'pending',
      createdAt: new Date()
    };
    this.pledges.set(id, pledge);
    return pledge;
  }
  
  async getPledges() {
    return Array.from(this.pledges.values());
  }
  
  async getPledge(id) {
    return this.pledges.get(id);
  }
  
  async updatePledgeStatus(id, status) {
    const pledge = this.pledges.get(id);
    if (!pledge) return undefined;
    pledge.status = status;
    return pledge;
  }
}

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    // Create a fresh instance for each test
    storage = new MemStorage();
  });

  describe('User Management', () => {
    test('creates a user and retrieves it by ID', async () => {
      const user = await storage.createUser({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash123'
      });
      
      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      
      const retrievedUser = await storage.getUser(user.id);
      expect(retrievedUser).toEqual(user);
    });
    
    test('retrieves a user by username', async () => {
      const user = await storage.createUser({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash123'
      });
      
      const retrievedUser = await storage.getUserByUsername('testuser');
      expect(retrievedUser).toEqual(user);
    });
    
    test('returns undefined for non-existent user', async () => {
      const user = await storage.getUser(999);
      expect(user).toBeUndefined();
      
      const userByName = await storage.getUserByUsername('nonexistent');
      expect(userByName).toBeUndefined();
    });
  });

  describe('Journey Management', () => {
    test('creates a journey session', async () => {
      const journey = await storage.createJourneySession('wellness', 'test@example.com');
      
      expect(journey.id).toBeDefined();
      expect(journey.type).toBe('wellness');
      expect(journey.email).toBe('test@example.com');
      expect(journey.progress).toBe(0);
      expect(journey.completed).toBe(false);
    });
    
    test('updates journey progress', async () => {
      const journey = await storage.createJourneySession('wellness', undefined);
      
      const updatedJourney = await storage.updateJourneyProgress(journey.id, 50);
      expect(updatedJourney.progress).toBe(50);
      
      const retrievedJourney = await storage.getJourneySession(journey.id);
      expect(retrievedJourney?.progress).toBe(50);
    });
    
    test('completes a journey', async () => {
      const journey = await storage.createJourneySession('wellness', undefined);
      
      const completedJourney = await storage.completeJourney(journey.id);
      expect(completedJourney.completed).toBe(true);
      expect(completedJourney.completedAt).toBeDefined();
    });
  });

  describe('Crowdfunding Pledges', () => {
    test('creates a pledge', async () => {
      const pledge = await storage.createPledge({
        email: 'donor@example.com',
        amount: 100,
        isAnonymous: false
      });
      
      expect(pledge.id).toBeDefined();
      expect(pledge.amount).toBe(100);
      expect(pledge.email).toBe('donor@example.com');
      expect(pledge.status).toBe('pending');
    });
    
    test('retrieves all pledges', async () => {
      await storage.createPledge({
        email: 'donor1@example.com',
        amount: 100,
        isAnonymous: false
      });
      
      await storage.createPledge({
        email: 'donor2@example.com',
        amount: 200,
        isAnonymous: true
      });
      
      const pledges = await storage.getPledges();
      expect(pledges.length).toBe(2);
    });
    
    test('updates pledge status', async () => {
      const pledge = await storage.createPledge({
        email: 'donor@example.com',
        amount: 100,
        isAnonymous: false
      });
      
      const updatedPledge = await storage.updatePledgeStatus(pledge.id, 'completed');
      expect(updatedPledge?.status).toBe('completed');
      
      const retrievedPledge = await storage.getPledge(pledge.id);
      expect(retrievedPledge?.status).toBe('completed');
    });
  });
});