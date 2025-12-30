'use server'

import { trainSearchSchema, TrainSearchState, TrainData } from "@/lib/validators";
import { env } from "@/lib/env";
import prisma from "@/lib/db"; 

export async function trackTrain(
  prevState: TrainSearchState, 
  formData: FormData
): Promise<TrainSearchState> {
  
  // 1. Validate Input
  const rawData = { trainNumber: formData.get('trainNumber') };
  const validatedFields = trainSearchSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Validation Error',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { trainNumber } = validatedFields.data;
  
 
  const apiUrl = `https://api.railradar.in/api/v1/trains/${trainNumber}`;
  console.log("Attempting to fetch:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': env.X_API_KEY, 
          'Content-Type': 'application/json',
          // CRITICAL FIX: Mimic a real browser/Postman
          'User-Agent': 'PostmanRuntime/7.36.0', 
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        cache: 'no-store' // DISABLE CACHE to prevent sticking to 404s
      }
    );

    console.log("📡 API Status:", response.status, response.statusText);

    if (!response.ok) {
      // If 404, it means the API says this train number doesn't exist at this endpoint
      if (response.status === 404) {
        return { message: `Train ${trainNumber} not found on server.` };
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (!json.success || !json.data) {
      return { message: 'Train found, but data is unavailable.' };
    }

    // 3. Log to DB
    await prisma.searchLog.create({
      data: { query: trainNumber, type: 'TRAIN' }
    });

    // 4. Extract & Normalize Data
    const trainInfo = json.data.train;
    const liveInfo = json.data.liveData || {}; // Handle cases where liveData might be missing
    const currentLoc = liveInfo.currentLocation || {};

    // Helper: Find station name from route array
    let stationName = currentLoc.stationCode || "Unknown";
    if (json.data.route) {
        const currentStationObj = json.data.route.find(
            (s: any) => s.stationCode === currentLoc.stationCode
        );
        if (currentStationObj) stationName = currentStationObj.stationName;
    }

    const normalizedData: TrainData = {
      trainName: trainInfo.trainName,
      trainNumber: trainInfo.trainNumber,
      currentStation: stationName,
      currentStatus: currentLoc.status || "Unknown",
      delay: liveInfo.overallDelayMinutes || 0,
      lastUpdated: liveInfo.lastUpdatedAt 
        ? new Date(liveInfo.lastUpdatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : "Just now"
    };

    return {
      message: 'Train Found',
      data: normalizedData
    };

  } catch (error) {
    console.error("❌ Train API Fatal Error:", error);
    return { message: 'Failed to fetch train status. Check server logs.' };
  }
}