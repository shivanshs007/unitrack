"use server";

import prisma from "@/lib/db";
import { z } from "zod";

// Input Validation
const joinSchema = z.object({
  pin: z.string().length(6, "PIN must be 6 digits"),
  name: z.string().min(1, "Name is required"),
  lat: z.number(),
  lng: z.number(),
});

// 1. Create a Room
export async function createRoom(name: string, lat: number, lng: number) {
  try {
    // Generate a random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Create Room + First Participant (Host)
    const room = await prisma.room.create({
      data: {
        pin,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        members: {
          create: { name, latitude: lat, longitude: lng },
        },
      },
      include: { members: true },
    });

    return {
      success: true,
      pin,
      memberId: room.members[0].id,
      roomId: room.id,
    };
  } catch (error) {
    console.error("Create Room Error:", error);
    return { success: false, error: "Failed to create room" };
  }
}

// 2. Join a Room
export async function joinRoom(
  pin: string,
  name: string,
  lat: number,
  lng: number
) {
  const result = joinSchema.safeParse({ pin, name, lat, lng });
  if (!result.success)
    return { success: false, error: result.error.issues[0].message };

  try {
    const room = await prisma.room.findUnique({ where: { pin } });
    if (!room) return { success: false, error: "Invalid PIN or Room Expired" };

    const member = await prisma.participant.create({
      data: {
        name,
        roomId: room.id,
        latitude: lat,
        longitude: lng,
      },
    });

    return { success: true, memberId: member.id, roomId: room.id };
  } catch (error) {
    return { success: false, error: "Failed to join room" };
  }
}

// 3. Sync Pulse (Update Me & Get Others)
export async function syncLocation(memberId: string, lat: number, lng: number) {
  try {
    // A. Update my location
    const me = await prisma.participant.update({
      where: { id: memberId },
      data: { latitude: lat, longitude: lng, lastSeen: new Date() },
      include: { room: true },
    });

    // B. Get active members (seen in last 2 mins)
    const members = await prisma.participant.findMany({
      where: {
        roomId: me.roomId,
        lastSeen: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        lastSeen: true,
      },
    });

    return { success: true, members };
  } catch (error) {
    return { success: false };
  }
}
