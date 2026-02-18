import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";
import type { Request, Response } from "express";


export async function handlerUsersCreate(req: Request, res: Response) {
    type parameter = {
        email: string;
    }

    const params: parameter = req.body;

    if (!params.email) {
        throw new BadRequestError("Email is required");
    }

    const newUser = await createUser({ email: params.email });

    if (!newUser) {
        throw new BadRequestError("Email already exists");
    }

    respondWithJSON(
        res,
        201,
        {
            id: newUser.id,
            email: newUser.email,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        }
    )
}