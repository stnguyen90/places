import { Databases, ID } from "node-appwrite";
import { Collections, databaseId } from "./common/constants.js";
import type { AppwriteContext } from "./common/types.js";
import { initializeClient } from "./common/utils.js";

async function main({ req, res }: AppwriteContext) {
  const client = initializeClient(req);

  const databases = new Databases(client);

  const data = req.bodyJson as {
    placeId: string;
    text: string;
  };

  const placeId = data.placeId;
  const text = data.text;

  const doc = await databases.createDocument(
    databaseId,
    Collections.Photos,
    ID.unique(),
    {
      place: placeId,
      fileId: "",
      user: req.headers["x-appwrite-user-id"],
      text,
    },
  );

  return res.send(doc.$id);
}

export default main;
  