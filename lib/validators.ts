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

export const trainSearchSchema = z.object({
  trainNumber: z
    .string({ error: "Invalid type" })
    .trim()
    .regex(/^\d{5}$/, { message: "Train number must be 5 digits" }),
});

// The shape of the data we return to the UI
export type TrainData = {
  trainName: string;
  trainNumber: string;
  currentStation: string;
  currentStatus: string; // e.g. "DEPARTED"
  delay: number; // in minutes
  lastUpdated: string;
};

export type TrainSearchState = {
  message: string;
  data?: TrainData; // Use the specific type
  errors?: {
    trainNumber?: string[];
  };
};