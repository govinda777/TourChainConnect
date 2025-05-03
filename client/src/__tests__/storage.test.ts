import { MemStorage } from '../../server/storage';

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
      const journey = await storage.createJourneySession('wellness');
      
      const updatedJourney = await storage.updateJourneyProgress(journey.id, 50);
      expect(updatedJourney.progress).toBe(50);
      
      const retrievedJourney = await storage.getJourneySession(journey.id);
      expect(retrievedJourney?.progress).toBe(50);
    });
    
    test('completes a journey', async () => {
      const journey = await storage.createJourneySession('wellness');
      
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