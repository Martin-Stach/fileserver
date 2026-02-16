import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./error.js";

export async function handlerChirpsValidate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
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
  let cleanedBody = params.body;
  bannedWords.forEach((word) => {
    cleanedBody = cleanedBody.replaceAll(word, substitute);
  });

  respondWithJSON(
    res,
    200,
    cleanedBody !== "" ? { cleanedBody: cleanedBody } : { valid: true },
  );
}
