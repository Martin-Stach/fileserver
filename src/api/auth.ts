import type { Request, Response } from "express";
import {
  checkPasswordHash,
  getBearerToken,
  makeJWT,
  makeRefreshToken,
} from "../auth.js";
import { config } from "../config.js";
import {
  refreshToken,
  revokeRefreshToken,
  saveRefreshToken,
} from "../db/queries/saveRefreshToken.js";
import { getUserByEmail } from "../db/queries/users.js";
import type { NewUser } from "../db/schema.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import type { UserResponse } from "./users.js";

type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string;
};

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

  if (!passwordValid) {
    respondWithError(res, 401, "Invalid email or password");
    return;
  }

  const token = makeJWT(userLogin.id, config.jwt.secret);

  const refreshToken = makeRefreshToken();
  const saved = await saveRefreshToken(refreshToken, userLogin.id);
  if (!saved) {
    throw new UserNotAuthenticatedError("Unable to save refresh token");
  }

  respondWithJSON(res, 200, {
    id: userLogin.id,
    createdAt: userLogin.createdAt,
    updatedAt: userLogin.updatedAt,
    email: userLogin.email,
    token: token,
    refreshToken: refreshToken,
    isChirpyRed: userLogin.isChirpyRed,
  } satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
  const bearerToken = getBearerToken(req);

  const result = await refreshToken(bearerToken);

  if (!result) {
    throw new UserNotAuthenticatedError("No Token found");
  }

  const newJWT = makeJWT(result.user.id, config.jwt.secret);

  respondWithJSON(res, 200, { token: newJWT } satisfies { token: string });
}

export async function handlerRevoke(req: Request, res: Response) {
  const bearerToken = getBearerToken(req);

  await revokeRefreshToken(bearerToken);

  res.status(204).send();
}
