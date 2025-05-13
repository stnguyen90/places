import { Databases, type Models } from "node-appwrite";
import { Collections, databaseId } from "./common/constants.js";
import type { AppwriteContext } from "./common/types.js";
import { initializeClient } from "./common/utils.js";

async function main({ req, res, log }: AppwriteContext) {
  const client = initializeClient(req);

  const database = new Databases(client);

  const user = req.bodyJson as Models.User<Models.Preferences>;

  log(user);

  await database.createDocument(databaseId, Collections.Users, user.$id, {
    name: user.name,
  });

  return res.send(`Created user ${user.$id} in collection users`);
}

export default main;
