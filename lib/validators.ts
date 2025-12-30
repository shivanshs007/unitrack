import { z } from "zod";

export const flightSearchSchema = z.object({
  flightNumber: z
    .string({ error: "Invalid type" }) // Zod 4 syntax
    .trim()
    .toUpperCase()
    .min(3, { message: "Flight number too short" }) // Standard Zod
    .regex(/^[A-Z0-9]{2,3}\d{1,4}$/, { message: "Invalid format (e.g. AI102)" }),
});

export type FlightSearchState = {
  message: string;
  data?: any; 
  errors?: {
    flightNumber?: string[];
  };
};