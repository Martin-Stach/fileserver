import type { Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import { resetUsers } from "src/db/queries/users.js";

export async function handlerReset(_: Request, res: Response) {

	if (config.api.platform !== "dev") {
		respondWithError(res, 403, "not allowed to use that endpoint")
		return;
	}

	await resetUsers();

	config.api.fileServerHits = 0;
	res.write("Hits reset to 0");
	res.end();
}
