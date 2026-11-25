import { z } from "zod";

export type OrderStatus = "pending" | "accepted" | "declined" | "delivered";

export interface MenuItem {
  readonly id: string;
  readonly itemNumber: string;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly ingredients: readonly string[];
  readonly dressing: string;
  readonly priceCents: number;
  readonly calories: number;
  readonly proteinGrams: number;
  readonly prepMinutes: number;
  readonly dietaryTags: readonly string[];
  readonly imageUrl: string;
  readonly isAvailable: boolean;
  readonly sortOrder: number;
}

export interface StoreSettings {
  readonly brandName: string;
  readonly pickupLocation: string;
  readonly serviceHours: string;
  readonly contactEmail: string;
  readonly contactHandle: string;
  readonly isKitchenOpen: boolean;
}

export interface DeliveryAddress {
  readonly label: string;
  readonly recipientName: string;
  readonly phone: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly landmark: string;
  readonly city: string;
  readonly postalCode: string;
  readonly deliveryNotes: string;
  readonly mapsUrl: string;
}

export interface OrderLineItem {
  readonly itemId: string;
  readonly itemNumber: string;
  readonly title: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
  readonly lineTotalCents: number;
}

export interface OrderRecord {
  readonly id: string;
  readonly orderCode: string;
  readonly customerUid: string;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly deliveryAddress: DeliveryAddress;
  readonly pickupWindow: string;
  readonly items: readonly OrderLineItem[];
  readonly totalCents: number;
  readonly status: OrderStatus;
  readonly ownerNote: string;
  readonly createdAtMs: number;
}

export const MenuItemFormSchema = z.object({
  itemNumber: z.string().trim().min(1, "Item label required (e.g. Item 1)").max(30),
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(100),
  tagline: z.string().trim().max(140).optional().default(""),
  description: z.string().trim().min(4, "Description must be at least 4 characters").max(800),
  ingredientsCsv: z.string().trim().max(500).optional().default(""),
  dressing: z.string().trim().max(140).optional().default(""),
  priceDollars: z.coerce.number().min(0.5, "Price must be at least $0.50").max(5000),
  calories: z.coerce.number().int().min(0).max(5000),
  proteinGrams: z.coerce.number().int().min(0).max(500),
  prepMinutes: z.coerce.number().int().min(1).max(240),
  dietaryTagsCsv: z.string().trim().max(250).optional().default(""),
  imageUrl: z.string().trim().min(1, "Please upload an image or enter an image path").max(500000),
  isAvailable: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(1000),
});

export const StoreSettingsFormSchema = z.object({
  brandName: z.string().trim().min(1, "Brand name is required").max(100),
  pickupLocation: z.string().trim().min(1, "Service area is required").max(200),
  serviceHours: z.string().trim().min(1, "Service hours are required").max(160),
  contactEmail: z.string().trim().max(120).optional().default(""),
  contactHandle: z.string().trim().max(80).optional().default(""),
  isKitchenOpen: z.boolean(),
});

export type MenuItemFormInput = z.infer<typeof MenuItemFormSchema>;
export type StoreSettingsFormInput = z.infer<typeof StoreSettingsFormSchema>;
