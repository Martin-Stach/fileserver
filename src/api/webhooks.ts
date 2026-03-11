import type { Request, Response } from "express";
import { getAPIKey } from "src/auth.js";
import { config } from "../config.js";
import { upgradeUser } from "../db/queries/users.js";
import { UserNotAuthenticatedError } from "./errors.js";

export async function handlerPolkaWebhook(req: Request, res: Response) {
  type parameter = {
    event: string;
    data: {
      userId: string;
    };
  };

  const apiKey = getAPIKey(req);
  if (apiKey !== config.api.polkaKey) {
    throw new UserNotAuthenticatedError("invalid api key");
  }

  const params: parameter = req.body;

  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  if (await upgradeUser(params.data.userId)) {
    res.status(204).send();
    return;
  }

  res.status(404).send();
}
