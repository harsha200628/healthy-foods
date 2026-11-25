import { z } from "zod";

export type OrderStatus = "pending" | "accepted" | "declined" | "delivered";

export const DELIVERY_WINDOWS = [
  "morning-11am",
  "lunch-1230pm",
  "afternoon-230pm",
  "evening-530pm",
] as const;
export type DeliveryWindow = (typeof DELIVERY_WINDOWS)[number];

export const DELIVERY_WINDOW_LABELS: Record<DeliveryWindow, string> = {
  "morning-11am": "Morning Batch · 11:00 AM – 12:00 PM",
  "lunch-1230pm": "Lunch Rush · 12:30 PM – 1:30 PM",
  "afternoon-230pm": "Afternoon Fresh · 2:30 PM – 3:30 PM",
  "evening-530pm": "Evening Batch · 5:30 PM – 6:30 PM",
};

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
  readonly tagline: string;
  readonly pickupLocation: string;
  readonly serviceHours: string;
  readonly contactEmail: string;
  readonly contactHandle: string;
  readonly isKitchenOpen: boolean;
}

export interface SavedAddress {
  readonly id: string;
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
  readonly isDefault: boolean;
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
  readonly deliveryAddress: Omit<SavedAddress, "id" | "isDefault">;
  readonly pickupWindow: string;
  readonly items: readonly OrderLineItem[];
  readonly totalCents: number;
  readonly status: OrderStatus;
  readonly ownerNote: string;
  readonly createdAtMs: number;
}

export const AddressInputSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Address label is required (e.g., Home, Hostel).")
    .max(40, "Label must be 40 characters or fewer."),
  recipientName: z
    .string()
    .trim()
    .min(2, "Recipient name must be at least 2 characters.")
    .max(80, "Recipient name must be 80 characters or fewer."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid contact phone number.")
    .max(25, "Phone number is too long."),
  addressLine1: z
    .string()
    .trim()
    .min(4, "Please enter street, building, or room number.")
    .max(160, "Address line 1 must be 160 characters or fewer."),
  addressLine2: z.string().trim().max(160).optional().default(""),
  landmark: z.string().trim().max(120).optional().default(""),
  city: z
    .string()
    .trim()
    .min(2, "City is required.")
    .max(80, "City must be 80 characters or fewer."),
  postalCode: z
    .string()
    .trim()
    .min(2, "Postal / PIN code is required.")
    .max(20, "Postal code must be 20 characters or fewer."),
  deliveryNotes: z.string().trim().max(240).optional().default(""),
  mapsUrl: z
    .string()
    .trim()
    .max(300)
    .refine(
      (val) =>
        val === "" ||
        val.startsWith("https://") ||
        val.startsWith("http://"),
      "Map link must start with https:// or http://",
    )
    .optional()
    .default(""),
  isDefault: z.boolean().optional().default(true),
});

export const SignupFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .max(80, "Name must be 80 characters or fewer."),
    countryCode: z.string().trim().min(2).max(6),
    mobileNumber: z
      .string()
      .trim()
      .regex(/^\d{7,15}$/, "Enter 7 to 15 digits without spaces."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(72, "Password must be 72 characters or fewer."),
    confirmPassword: z.string(),
    address: AddressInputSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const PasswordLoginSchema = z.object({
  countryCode: z.string().trim().min(2).max(6),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^\d{7,15}$/, "Enter your registered mobile digits."),
  password: z.string().min(6, "Enter your password (at least 6 characters)."),
});

export type AddressInput = z.infer<typeof AddressInputSchema>;
export type SignupFormInput = z.infer<typeof SignupFormSchema>;
export type PasswordLoginInput = z.infer<typeof PasswordLoginSchema>;
