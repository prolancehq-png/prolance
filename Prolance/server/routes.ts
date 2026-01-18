import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { categories, gigs, users } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Categories ===
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // === Gigs ===
  app.get(api.gigs.list.path, async (req, res) => {
    const query = api.gigs.list.input.optional().parse(req.query);
    const gigs = await storage.getGigs(query);
    
    // Enrich with seller and category
    const enrichedGigs = await Promise.all(gigs.map(async (gig) => {
      const seller = await storage.getUser(gig.sellerId);
      const category = await storage.getCategory(gig.categoryId);
      return { ...gig, seller, category };
    }));

    res.json(enrichedGigs);
  });

  app.get(api.gigs.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const gig = await storage.getGig(id);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }
    
    // Increment clicks when gig is viewed
    await storage.incrementGigClicks(id);
    
    const seller = await storage.getUser(gig.sellerId);
    const category = await storage.getCategory(gig.categoryId);
    // Mock reviews for now or fetch if implemented
    res.json({ ...gig, seller, category, reviews: [] });
  });

  app.post(api.gigs.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const input = api.gigs.create.input.parse(req.body);
      const gig = await storage.createGig({
        ...input,
        sellerId: (req.user as any).claims.sub
      });
      res.status(201).json(gig);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Orders ===
  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    
    const orders = await storage.getOrders(userId);
    
    // Enrich with gig details
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const gig = await storage.getGig(order.gigId);
      return { ...order, gig };
    }));

    res.json(enrichedOrders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    // Verify access
    const userId = (req.user as any).claims.sub;
    const gig = await storage.getGig(order.gigId);
    
    if (order.buyerId !== userId && gig?.sellerId !== userId) {
      return res.sendStatus(403);
    }

    const messages = await storage.getOrderMessages(orderId);
    // Enrich messages with sender info
    const enrichedMessages = await Promise.all(messages.map(async (msg) => {
        const sender = await storage.getUser(msg.senderId);
        return { ...msg, sender };
    }));

    res.json({ ...order, gig, messages: enrichedMessages });
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { gigId, requirements } = api.orders.create.input.parse(req.body);
      const gig = await storage.getGig(gigId);
      if (!gig) return res.status(404).json({ message: "Gig not found" });

      const order = await storage.createOrder({
        gigId,
        buyerId: (req.user as any).claims.sub,
        requirements,
      });
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.orders.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const orderId = Number(req.params.id);
    const { status } = api.orders.updateStatus.input.parse(req.body);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // In a real app, implement state machine checks (e.g. only seller can mark delivered, only buyer can complete)
    const updated = await storage.updateOrderStatus(orderId, status);
    res.json(updated);
  });

  // === Messages ===
  app.post(api.messages.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { orderId, content } = api.messages.create.input.parse(req.body);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Verify access
    const userId = (req.user as any).claims.sub;
    const gig = await storage.getGig(order.gigId);
    if (order.buyerId !== userId && gig?.sellerId !== userId) {
      return res.sendStatus(403);
    }

    const message = await storage.createMessage({
      orderId,
      senderId: userId,
      content,
    });
    res.status(201).json(message);
  });

  return httpServer;
}

export async function seedDatabase() {
  const existingCats = await storage.getCategories();
  if (existingCats.length === 0) {
    await db.insert(categories).values([
      { name: "Graphics & Design", slug: "graphics-design", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799314346d?w=800&q=80" },
      { name: "Digital Marketing", slug: "digital-marketing", imageUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80" },
      { name: "Writing & Translation", slug: "writing-translation", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80" },
      { name: "Video & Animation", slug: "video-animation", imageUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80" },
      { name: "Programming & Tech", slug: "programming-tech", imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80" },
    ]);
  }
}
