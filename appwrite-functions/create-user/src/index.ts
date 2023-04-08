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

  let database = new sdk.Databases(client);

  const eventData = req.variables["APPWRITE_FUNCTION_EVENT_DATA"];
  console.log(eventData);

  const user: sdk.Models.User<sdk.Models.Preferences> = JSON.parse(eventData);

  console.log(user);

  await database.createDocument(databaseId, Collections.Users, user.$id, { name: user.name });

  res.send(`Created user ${user.$id} in collection users`);
};
