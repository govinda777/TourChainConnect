import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping the original table)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Demo Requests table
export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  interest: text("interest").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const demoRequestSchema = createInsertSchema(demoRequests).pick({
  firstName: true,
  lastName: true,
  email: true,
  company: true,
  interest: true,
});

export type InsertDemoRequest = z.infer<typeof demoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;

// The schema for our carbon calculator
export const calculatorInputSchema = z.object({
  annualFlights: z.number().min(1).max(10000),
  flightDistance: z.number().min(100).max(10000),
  economyPercent: z.number().min(0).max(100),
  businessPercent: z.number().min(0).max(100),
  firstPercent: z.number().min(0).max(100),
});

export type CalculatorInput = z.infer<typeof calculatorInputSchema>;

export const calculatorResultSchema = z.object({
  emissions: z.number(),
  equivalentCars: z.number(),
  offsetCosts: z.object({
    reforestation: z.number(),
    renewable: z.number(),
    ocean: z.number(),
  }),
});

export type CalculatorResult = z.infer<typeof calculatorResultSchema>;
