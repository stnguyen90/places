import * as sdk from "node-appwrite";
import { Collections, databaseId } from "./common/constants";
import { AppwriteRequest, AppwriteResponse } from "./common/types";
import { initializeClient } from "./common/utils";

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - object with request body data
    'variables' - object with environment variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function (req: AppwriteRequest, res: AppwriteResponse) {
  const client = initializeClient(req);

  const databases = new sdk.Databases(client);

  const data = JSON.parse(req.payload);

  const placeId = data["place_id"];
  const text = data["text"];

  const doc = await databases.createDocument(
    databaseId,
    Collections.Comments,
    sdk.ID.unique(),
    {
      place: placeId,
      user: req.variables["APPWRITE_FUNCTION_USER_ID"],
      text: text,
    }
  );

  res.send(`Created comment ${doc.$id}`);
};
