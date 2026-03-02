import type { Request, Response } from "express";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { config } from "../config.js";
import { getUserByEmail } from "../db/queries/users.js";
import type { NewUser } from "../db/schema.js";
import { BadRequestError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import type { UserResponse } from "./users.js";

type LoginResponse = UserResponse & {
  token: string;
};

export async function handlerLogin(req: Request, res: Response) {
  type parameter = {
    password: string;
    email: string;
    expiresIn?: number;
  };

  const params: parameter = req.body;

  if (!params.password) {
    throw new BadRequestError("Password is required");
  }
  if (!params.email) {
    throw new BadRequestError("Email is required");
  }

  let passwordValid = false;
  const userLogin: NewUser = await getUserByEmail(params.email);

  if (!userLogin || !userLogin.id) {
    respondWithError(res, 401, "Invalid email or password");
    return;
  }

  if (!userLogin.hashed_password || userLogin.hashed_password === "unset") {
    respondWithError(res, 401, "Invalid email or password");
    return;
  }

  passwordValid = await checkPasswordHash(
    params.password,
    userLogin.hashed_password,
  );

  const DEFAULT_EXPIRE_TIME = config.jwt.defaultDuration;
  const expireTime = Math.min(
    DEFAULT_EXPIRE_TIME,
    params.expiresIn ?? config.jwt.defaultDuration,
  );

  if (passwordValid) {
    const token = makeJWT(userLogin.id, expireTime, config.jwt.secret);
    respondWithJSON(res, 200, {
      id: userLogin.id,
      createdAt: userLogin.createdAt,
      updatedAt: userLogin.updatedAt,
      email: userLogin.email,
      token: token,
    } satisfies LoginResponse);
  } else {
    respondWithError(res, 401, "Invalid email or password");
  }
}

export function getBearerToken(req: Request) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new BadRequestError("Malformed authorization header");
  }

  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new BadRequestError("Malformed authorization header");
  }
  return splitAuth[1];
}
