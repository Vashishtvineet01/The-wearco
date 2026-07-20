import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email().max(200)
});

export const orderItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().positive(),
  qty: z.number().int().positive().max(50),
  size: z.string().min(1),
  color: z.string().min(1),
  custom: z
    .object({
      text: z.string().optional(),
      textColor: z.string().optional(),
      font: z.string().optional(),
      imageUrl: z.string().optional(),
      imageDataUrl: z.string().optional(),
      posX: z.number(),
      posY: z.number(),
      scale: z.number(),
      rotation: z.number()
    })
    .optional()
});

export const orderSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(30),
  gst: z.string().max(30).optional().nullable(),
  paymentMethod: z.enum(["upi", "card", "cod"]).default("upi"),
  address: z.object({
    line1: z.string().min(2),
    line2: z.string().optional().nullable(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4).max(12),
    country: z.string().min(2).default("India")
  }),
  items: z.array(orderItemSchema).min(1)
});

export const productFormSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  tagline: z.string().min(2).max(200),
  category: z.enum(["tee", "hoodie", "cap", "sleeve"]),
  price: z.number().int().positive(),
  drop: z.string().min(2).max(120),
  description: z.string().min(2),
  details: z.array(z.string()).default([]),
  printArea: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number()
  }),
  customizable: z.boolean().default(true),
  active: z.boolean().default(true),
  colors: z
    .array(
      z.object({
        name: z.string().min(1),
        hex: z.string().min(4),
        fabric: z.string().min(4),
        printDefault: z.string().min(4)
      })
    )
    .min(1),
  sizes: z.array(z.string().min(1)).min(1)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(4),
  newPassword: z.string().min(6)
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"])
});
