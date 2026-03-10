import type { Request, Response } from "express";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { createUser, updateUser } from "../db/queries/users.js";
import type { NewUser } from "../db/schema.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export type UserResponse = Omit<NewUser, "hashed_password">;

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameter = {
    password: string;
    email: string;
  };

  const params: parameter = req.body;

  if (!params.password) {
    throw new BadRequestError("Password is required");
  }
  if (!params.email) {
    throw new BadRequestError("Email is required");
  }

  const hash = await hashPassword(params.password);

  const newUser = await createUser({
    email: params.email,
    hashed_password: hash,
  } satisfies NewUser);

  if (!newUser) {
    throw new Error("Email already exists");
  }

  respondWithJSON(res, 201, {
    id: newUser.id,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
    email: newUser.email,
  } satisfies UserResponse);
}

export async function handlerUpdateUser(req: Request, res: Response) {
  type parameter = {
    password: string;
    email: string;
  };

  const authToken = getBearerToken(req);
  if (!authToken) {
    throw new UserNotAuthenticatedError("Authorization token is required");
  }
  const user = validateJWT(authToken, config.jwt.secret);

  const params: parameter = req.body;
  if (!params.password) {
    throw new BadRequestError("Password is required");
  }
  if (!params.email) {
    throw new BadRequestError("Email is required");
  }

  const hash = await hashPassword(params.password);

  const updatedUser = await updateUser(user, params.email, hash);

  respondWithJSON(res, 200, {
    id: updatedUser.id,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
    email: updatedUser.email,
  } satisfies Omit<NewUser, "hashed_password">);
}
