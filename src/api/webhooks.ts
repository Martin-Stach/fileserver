import type { Request, Response } from "express";
import { upgradeUser } from "../db/queries/users.js";

export async function handlerPolkaWebhook(req: Request, res: Response) {
  type parameter = {
    event: string;
    data: {
      userId: string;
    };
  };

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
