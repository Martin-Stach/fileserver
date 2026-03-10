import type { Request, Response } from "express";
import { hashPassword } from "../auth.js";
import { createUser, updateUser } from "../db/queries/users.js";
import type { NewUser } from "../db/schema.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getBearerToken } from "./auth.js";

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
    throw new BadRequestError("Authorization token is required");
  }

  const params: parameter = req.body;
  if (!params.password) {
    throw new BadRequestError("Password is required");
  }
  if (!params.email) {
    throw new BadRequestError("Email is required");
  }

  const hash = await hashPassword(params.password);

  //Todo: check here who the token belongs to to send it also to the updateUser fucnction so the right user information are changed.

  const updatedUser = await updateUser({
    id: "TODO",
    email: params.email,
    hashed_password: hash,
  } satisfies NewUser);

  respondWithJSON(res, 200, {
    id: updatedUser.id,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
    email: updatedUser.email,
  } satisfies UserResponse);
}
