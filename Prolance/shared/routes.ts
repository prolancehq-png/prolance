import { z } from 'zod';
import { insertGigSchema, gigs, orders, categories, messages, reviews } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
  },
  gigs: {
    list: {
      method: 'GET' as const,
      path: '/api/gigs',
      input: z.object({
        search: z.string().optional(),
        categoryId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof gigs.$inferSelect & { seller: any; category: any }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/gigs/:id',
      responses: {
        200: z.custom<typeof gigs.$inferSelect & { seller: any; category: any; reviews: any[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/gigs',
      input: insertGigSchema,
      responses: {
        201: z.custom<typeof gigs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders', // Filtered by user context (buyer or seller)
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect & { gig: any }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id',
      responses: {
        200: z.custom<typeof orders.$inferSelect & { gig: any; messages: any[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: z.object({ gigId: z.number(), requirements: z.string().optional() }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status',
      input: z.object({ status: z.enum(['pending', 'in_progress', 'delivered', 'completed', 'cancelled']) }),
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  messages: {
    create: {
      method: 'POST' as const,
      path: '/api/messages',
      input: z.object({ orderId: z.number(), content: z.string() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
