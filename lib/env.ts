import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AVIATION_STACK_KEY: z.string().min(1, "API Key missing"),
  X_API_KEY: z.string().min(1, "Train API Key missing"),
  // Add other keys here later (e.g., CLOUDINARY_URL)
});

// Validate process.env
const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error("❌ Invalid environment variables:", envParsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = envParsed.data;