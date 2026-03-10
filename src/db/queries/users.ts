import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { type NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function resetUsers() {
  await db.delete(users);
}

export async function getUsers() {
  return await db.select().from(users);
}

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

export async function updateUser(id: string, email: string, hashed_password: string) {
  const [result] = await db
    .update(users)
    .set({ email: email, hashed_password: hashed_password })
    .where(eq(users.id, id))
    .returning();
  return result;
}
