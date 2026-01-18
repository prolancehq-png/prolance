import { 
  users, gigs, orders, categories, messages, reviews,
  type User,
  type Gig, type InsertGig, type UpdateGigRequest,
  type Order, type InsertOrder,
  type Category,
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or, desc, SQL, Placeholder, sql } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;

  // Gigs
  getGigs(filters?: { search?: string; categoryId?: number }): Promise<Gig[]>;
  getGig(id: number): Promise<Gig | undefined>;
  createGig(gig: InsertGig): Promise<Gig>;
  incrementGigClicks(id: number): Promise<void>;
  incrementGigImpressions(id: number): Promise<void>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Messages
  getOrderMessages(orderId: number): Promise<any[]>;
  createMessage(message: { orderId: number; senderId: string; content: string }): Promise<any>;

  // Users
  getUser(id: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getGigs(filters?: { search?: string; categoryId?: number }): Promise<Gig[]> {
    let query = db.select().from(gigs);

    const conditions = [];
    if (filters?.search) {
      conditions.push(or(
        like(gigs.title, `%${filters.search}%`),
        like(gigs.description, `%${filters.search}%`)
      ));
    }
    if (filters?.categoryId) {
      conditions.push(eq(gigs.categoryId, filters.categoryId));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      return await query.where(and(...conditions));
    }

    return await query;
  }

  async getGig(id: number): Promise<Gig | undefined> {
    const [gig] = await db.select().from(gigs).where(eq(gigs.id, id));
    return gig;
  }

  async createGig(gig: InsertGig): Promise<Gig> {
    const [newGig] = await db.insert(gigs).values(gig).returning();
    return newGig;
  }

  async incrementGigClicks(id: number): Promise<void> {
    await db.update(gigs)
      .set({ clicks: sql`${gigs.clicks} + 1` })
      .where(eq(gigs.id, id));
  }

  async incrementGigImpressions(id: number): Promise<void> {
    await db.update(gigs)
      .set({ impressions: sql`${gigs.impressions} + 1` })
      .where(eq(gigs.id, id));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const gig = await this.getGig(order.gigId);
    if (!gig) throw new Error("Gig not found");
    
    // Calculate 10% commission
    const commissionFee = Math.round(gig.price * 0.1);
    
    const [newOrder] = await db.insert(orders).values({
      ...order,
      price: gig.price,
      commissionFee,
    }).returning();
    return newOrder;
  }

  async getOrders(userId: string): Promise<Order[]> {
    // Get orders where I am the buyer
    const buyerOrders = await db.select().from(orders).where(eq(orders.buyerId, userId));
    
    // Get orders where I am the seller (via gig)
    // Drizzle doesn't support complex joins in simple select easily without relational queries, 
    // but for now let's use the relational API or raw query if needed.
    // Let's use relational query since we have relations defined.
    
    const sellerGigs = await db.select().from(gigs).where(eq(gigs.sellerId, userId));
    const sellerGigIds = sellerGigs.map(g => g.id);
    
    let sellerOrders: Order[] = [];
    if (sellerGigIds.length > 0) {
      // @ts-ignore
      sellerOrders = await db.select().from(orders).where(or(...sellerGigIds.map(id => eq(orders.gigId, id))));
    }

    return [...buyerOrders, ...sellerOrders].sort((a, b) => 
      (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async getOrderMessages(orderId: number): Promise<any[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.orderId, orderId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: { orderId: number; senderId: string; content: string }): Promise<any> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getUser(id: string): Promise<User | undefined> {
    return await authStorage.getUser(id);
  }
}

export const storage = new DatabaseStorage();
