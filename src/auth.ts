import { randomBytes } from "node:crypto";
import * as argon2 from "argon2";
import type { Request } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./api/errors.js";
import { config } from "./config.js";

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  if (!password) return false;
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
const TOKEN_ISSUER = "chirpy";

export function makeJWT(userID: string, secret: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const payload: payload = {
    iss: TOKEN_ISSUER,
    sub: userID,
    iat: iat,
    exp: iat + config.jwt.defaultDuration,
  } satisfies payload;
  const token = jwt.sign(payload, secret, { algorithm: "HS256" });

  return token;
}

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (_) {
    throw new UserNotAuthenticatedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UserNotAuthenticatedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError("No user ID in token");
  }

  return decoded.sub;
}

export function makeRefreshToken(): string {
  return randomBytes(32).toString("hex");
}
export function getBearerToken(req: Request) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }
  return splitAuth[1];
}
