'use server'

import { flightSearchSchema, FlightSearchState } from "@/lib/validators";
import { env } from "@/lib/env"; // Import the secure env
import prisma from "@/lib/db"; 

export async function trackFlight(
  prevState: FlightSearchState, 
  formData: FormData
): Promise<FlightSearchState> {
  
  // 1. Validation (Same as before)
  const rawData = { flightNumber: formData.get('flightNumber') };
  const validatedFields = flightSearchSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Validation Error',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { flightNumber } = validatedFields.data; // e.g., "6E204"

  try {
    // 2. Real API Call
    // Note: Most APIs split "6E204" into Airline (6E) and Number (204).
    // For simplicity, we assume the user types the IATA code. 
    // AviationStack allows searching by `flight_iata`.
    
    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${env.AVIATION_STACK_KEY}&flight_iata=${flightNumber}&limit=1`,
      { next: { revalidate: 60 } } // Cache for 60 seconds (Save API quota)
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const json = await response.json();

    // 3. Handle "Flight Not Found" from API logic
    if (!json.data || json.data.length === 0) {
      return { 
        message: 'Flight not found or not active today.' 
      };
    }

    const flightData = json.data[0];

    // 4. Log to DB (SaaS Moat)
    await prisma.searchLog.create({
      data: {
        query: flightNumber,
        type: 'FLIGHT',
      }
    });

    // 5. Return Clean Data to UI
    return {
      message: 'Flight Found',
      data: {
        flight: flightData.flight.iata,
        status: flightData.flight_status, // e.g. "active", "scheduled"
        departure: flightData.departure.airport,
        arrival: flightData.arrival.airport,
        eta: flightData.arrival.scheduled, // ISO Time string
      }
    };

  } catch (error) {
    console.error(error); // Log to server console
    return { message: 'Failed to fetch flight data. Please try again.' };
  }
}