import type { Request, Response } from "express";
import { checkPasswordHash } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import type { NewUser } from "../db/schema.js";
import { BadRequestError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import type { UserResponse } from "./users.js";

export async function handlerLogin(req: Request, res: Response) {
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

	let passwordValid = false;
	const userLogin: NewUser = await getUserByEmail(params.email);

	if (!userLogin) {
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

	if (passwordValid) {
		respondWithJSON(res, 200, {
			id: userLogin.id,
			email: userLogin.email,
			createdAt: userLogin.createdAt,
			updatedAt: userLogin.updatedAt,
		} satisfies UserResponse);
	} else {
		respondWithError(res, 401, "Invalid email or password");
	}
}
