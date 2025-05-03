import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { demoRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

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

  const httpServer = createServer(app);
  return httpServer;
}
