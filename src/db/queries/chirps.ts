import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, type NewChirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [rows] = await db.insert(chirps).values(chirp).returning();
  return rows;
}

export async function getChrips() {
  return await db.select().from(chirps).orderBy(asc(chirps.createdAt));
}

export async function getChrip(id: string) {
  const [rows] = await db.select().from(chirps).where(eq(chirps.id, id));
  return rows;
}

export async function deleteChrip(id: string) {
  await db.delete(chirps).where(eq(chirps.id, id));
}
