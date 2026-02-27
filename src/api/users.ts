import type { Request, Response } from "express";
import { hashPassword } from "../auth.js";
import { createUser } from "../db/queries/users.js";
import type { NewUser } from "../db/schema.js";
import { BadRequestError } from "./errors.js";
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
    email: newUser.email,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  } satisfies UserResponse);
}
