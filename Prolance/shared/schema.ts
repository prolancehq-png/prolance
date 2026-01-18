import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
});

export const gigs = pgTable("gigs", {
  id: serial("id").primaryKey(),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  categoryId: integer("category_id").notNull().references(() => categories.id),
  coverImage: text("cover_image").notNull(),
  deliveryTime: integer("delivery_time").notNull(), // in days
  clicks: integer("clicks").notNull().default(0),
  impressions: integer("impressions").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").notNull().references(() => gigs.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  price: integer("price").notNull(), // Snapshot of price at purchase
  commissionFee: integer("commission_fee").notNull().default(0), // 10% commission
  status: text("status").notNull().default("pending"), // pending, in_progress, delivered, completed, cancelled
  requirements: text("requirements"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  gigId: integer("gig_id").notNull().references(() => gigs.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  gigs: many(gigs),
  ordersAsBuyer: many(orders, { relationName: "buyerOrders" }),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  gigs: many(gigs),
}));

export const gigsRelations = relations(gigs, ({ one, many }) => ({
  seller: one(users, {
    fields: [gigs.sellerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [gigs.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  gig: one(gigs, {
    fields: [orders.gigId],
    references: [gigs.id],
  }),
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: "buyerOrders",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  order: one(orders, {
    fields: [messages.orderId],
    references: [orders.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  gig: one(gigs, {
    fields: [reviews.gigId],
    references: [gigs.id],
  }),
  buyer: one(users, {
    fields: [reviews.buyerId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertGigSchema = createInsertSchema(gigs).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true, price: true }); // Price is set from gig
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Gig = typeof gigs.$inferSelect;
export type InsertGig = z.infer<typeof insertGigSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Category = typeof categories.$inferSelect;

export type CreateGigRequest = InsertGig;
export type UpdateGigRequest = Partial<InsertGig>;

export type CreateOrderRequest = { gigId: number; requirements?: string };

export type CreateMessageRequest = { orderId: number; content: string };
export type CreateReviewRequest = { orderId: number; rating: number; comment?: string };

export type GigResponse = Gig & { seller?: typeof users.$inferSelect; category?: Category };
