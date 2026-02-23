import type { Request, Response } from "express";
import { createChirp, getChrip, getChrips } from "src/db/queries/chirps.js";
import type { NewChirp } from "src/db/schema.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export function handlerChirpsValidate(chirp: string) {
	let validatedChirp = chirp;
	const maxChirpLength = 140;
	if (validatedChirp.length > maxChirpLength) {
		throw new BadRequestError("Chirp is too long. Max length is 140");
	}

	const substitute = "****";
	const bannedWords = [
		"kerfuffle",
		"sharbert",
		"fornax",
		"Kerfuffle",
		"Sharbert",
		"Fornax",
	];

	bannedWords.forEach((word) => {
		validatedChirp = validatedChirp.replaceAll(word, substitute);
	});

	return validatedChirp;
}

export async function handlerChirpsCreate(req: Request, res: Response) {
	type parameter = {
		body: string;
		userId: string;
	};

	const params: parameter = req.body;

	if (!params.body || !params.userId) {
		throw new BadRequestError("Body and UserId is required");
	}

	const validatedChrip = handlerChirpsValidate(params.body);

	if (!validatedChrip) {
		throw new Error("Something went wrong in validatedChrip.");
	}

	const result = await createChirp({
		body: validatedChrip,
		userId: params.userId,
	});

	respondWithJSON(res, 201, {
		id: result.id,
		createdAt: result.createdAt,
		updatedAt: result.updatedAt,
		body: result.body,
		userId: result.userId,
	});
}

export async function handlerChirpsGet(_: Request, res: Response) {
	const result: NewChirp[] = [];

	const chirps: NewChirp[] = await getChrips();

	for (const chirp of chirps) {
		result.push(chirp);
	}

	respondWithJSON(res, 200, result);
}

export async function handlerChirpsGetSingle(req: Request, res: Response) {
	const { chirpId } = req.params;
	if (typeof chirpId !== "string") {
		throw new BadRequestError("Invalid Chirp ID");
	}

	const chirp: NewChirp = await getChrip(chirpId);
	if (!chirp) {
		throw new Error("No Chirp found with provided ID");
	}

	respondWithJSON(res, 200, chirp);
}
