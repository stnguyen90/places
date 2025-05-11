import { Databases, ID } from "node-appwrite";
import { Collections, databaseId } from "./common/constants.js";
import type { AppwriteContext } from "./common/types.js";
import { initializeClient } from "./common/utils.js";

async function main({ req, res, log }: AppwriteContext) {
  const client = initializeClient(req);

  const databases = new Databases(client);

  const data = req.bodyJson as {
    placeId: string;
    text: string;
  };

  log(data);

  const placeId = data.placeId;
  const text = data.text;

  const doc = await databases.createDocument(
    databaseId,
    Collections.Comments,
    ID.unique(),
    {
      place: placeId,
      user: req.headers["x-appwrite-user-id"],
      text,
    },
  );

  return res.send(`Created comment ${doc.$id}`);
}

export default main;
