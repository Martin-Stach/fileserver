import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { refresh_tokens, users } from "../schema.js";

export async function saveRefreshToken(newToken: string, userId: string) {
  const [result] = await db
    .insert(refresh_tokens)
    .values({
      token: newToken,
      userId: userId,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      revokedAt: null,
    })
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function refreshToken(token: string) {
  const [result] = await db
    .select({ user: users })
    .from(users)
    .innerJoin(refresh_tokens, eq(users.id, refresh_tokens.userId))
    .where(
      and(
        eq(refresh_tokens.token, token),
        isNull(refresh_tokens.revokedAt),
        gt(refresh_tokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result;
}

export async function revokeRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refresh_tokens)
    .where(eq(refresh_tokens.token, token))
    .limit(1);

  if (!result) {
    throw new Error("No token found");
  }

  await db
    .update(refresh_tokens)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(eq(refresh_tokens.token, token));
}
