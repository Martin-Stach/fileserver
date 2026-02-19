import { db } from "../index.js";
import { chirps, type NewChirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
	const [rows] = await db.insert(chirps).values(chirp).returning();
	return rows;
}
