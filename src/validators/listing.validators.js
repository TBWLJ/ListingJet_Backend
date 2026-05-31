import { z } from "zod";

const listEnum = z.enum(["property", "hotel_room", "event_center", "vehicle", "job", "product", "service"]);
const statusEnum = z.enum(["draft", "active", "paused", "archived"]);
const visibilityEnum = z.enum(["public", "private"]);
const stringArray = z.preprocess((value) => {
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return value;
}, z.array(z.string()).optional());

export const listingSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    slug: z.string().optional(),
    category: z.string().optional(),
    listingType: listEnum,
    price: z.coerce.number().optional(),
    currency: z.string().default("NGN"),
    location: z.string().optional(),
    description: z.string().optional(),
    features: stringArray,
    amenities: stringArray,
    videoUrl: z.string().url().optional().or(z.literal("")),
    contactPerson: z.string().optional(),
    contactPhone: z.string().optional(),
    whatsapp: z.string().optional(),
    status: statusEnum.default("draft"),
    visibility: visibilityEnum.default("public"),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional()
  })
});
