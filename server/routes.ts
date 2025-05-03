import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { demoRequestSchema } from "@shared/schema";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";

// Schema para validação da criação de jornada
const journeyCreateSchema = z.object({
  type: z.string(),
  email: z.string().email().optional(),
});

// Schema para validação da atualização de progresso da jornada
const journeyUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
});

// Schema para validação da criação de um pledge
const pledgeCreateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  amount: z.number().positive(),
  rewardId: z.string().optional(),
  comment: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo request endpoint
  app.post('/api/demo-request', async (req, res) => {
    try {
      const validatedData = demoRequestSchema.parse(req.body);
      const result = await storage.createDemoRequest(validatedData);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          success: false, 
          error: validationError.message 
        });
      } else {
        console.error("Error handling demo request:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to process your request" 
        });
      }
    }
  });

  // Get all demo requests (for admin panel)
  app.get('/api/demo-requests', async (req, res) => {
    try {
      const requests = await storage.getAllDemoRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching demo requests:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch demo requests" 
      });
    }
  });

  // Rotas para Jornadas
  
  // Criar uma nova sessão de jornada
  app.post('/api/journey', async (req, res) => {
    try {
      const { type, email } = journeyCreateSchema.parse(req.body);
      const journey = await storage.createJourneySession(type, email);
      res.status(201).json(journey);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          success: false, 
          error: validationError.message 
        });
      } else {
        console.error("Error creating journey:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to create journey" 
        });
      }
    }
  });
  
  // Obter informações de uma jornada
  app.get('/api/journey/:id', async (req, res) => {
    try {
      const journey = await storage.getJourneySession(req.params.id);
      if (!journey) {
        return res.status(404).json({ 
          success: false, 
          error: "Journey not found" 
        });
      }
      res.json(journey);
    } catch (error) {
      console.error("Error fetching journey:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch journey" 
      });
    }
  });
  
  // Atualizar progresso de uma jornada
  app.put('/api/journey/:id/progress', async (req, res) => {
    try {
      const { progress } = journeyUpdateSchema.parse(req.body);
      const journey = await storage.updateJourneyProgress(req.params.id, progress);
      res.json(journey);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          success: false, 
          error: validationError.message 
        });
      } else if (error instanceof Error && error.message === "Jornada não encontrada") {
        res.status(404).json({ 
          success: false, 
          error: "Journey not found" 
        });
      } else {
        console.error("Error updating journey progress:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to update journey progress" 
        });
      }
    }
  });
  
  // Completar uma jornada
  app.put('/api/journey/:id/complete', async (req, res) => {
    try {
      const journey = await storage.completeJourney(req.params.id);
      res.json(journey);
    } catch (error) {
      if (error instanceof Error && error.message === "Jornada não encontrada") {
        res.status(404).json({ 
          success: false, 
          error: "Journey not found" 
        });
      } else {
        console.error("Error completing journey:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to complete journey" 
        });
      }
    }
  });

  // Rotas para Financiamento Coletivo
  
  // Criar um novo pledge (apoio)
  app.post('/api/pledge', async (req, res) => {
    try {
      const pledgeData = pledgeCreateSchema.parse(req.body);
      const pledge = await storage.createPledge(pledgeData);
      res.status(201).json(pledge);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          success: false, 
          error: validationError.message 
        });
      } else {
        console.error("Error creating pledge:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to create pledge" 
        });
      }
    }
  });
  
  // Obter todos os pledges
  app.get('/api/pledges', async (req, res) => {
    try {
      const pledges = await storage.getPledges();
      
      // Calcula estatísticas
      const totalAmount = pledges.reduce((sum, pledge) => sum + pledge.amount, 0);
      const completedPledges = pledges.filter(p => p.status === 'completed');
      const totalCompletedAmount = completedPledges.reduce((sum, pledge) => sum + pledge.amount, 0);
      
      res.json({
        pledges,
        stats: {
          totalPledges: pledges.length,
          completedPledges: completedPledges.length,
          totalAmount,
          totalCompletedAmount
        }
      });
    } catch (error) {
      console.error("Error fetching pledges:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch pledges" 
      });
    }
  });
  
  // Obter um pledge específico
  app.get('/api/pledge/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid pledge ID" 
        });
      }
      
      const pledge = await storage.getPledge(id);
      if (!pledge) {
        return res.status(404).json({ 
          success: false, 
          error: "Pledge not found" 
        });
      }
      
      res.json(pledge);
    } catch (error) {
      console.error("Error fetching pledge:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch pledge" 
      });
    }
  });
  
  // Atualizar status de um pledge
  app.put('/api/pledge/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid pledge ID" 
        });
      }
      
      const { status } = z.object({ 
        status: z.enum(['pending', 'completed', 'cancelled']) 
      }).parse(req.body);
      
      const pledge = await storage.updatePledgeStatus(id, status);
      if (!pledge) {
        return res.status(404).json({ 
          success: false, 
          error: "Pledge not found" 
        });
      }
      
      res.json(pledge);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          success: false, 
          error: validationError.message 
        });
      } else {
        console.error("Error updating pledge status:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to update pledge status" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
