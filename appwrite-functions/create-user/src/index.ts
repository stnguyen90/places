import * as sdk from "node-appwrite";

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

interface AppwriteRequest {
  headers: { [name: string]: string };
  payload: string;
  variables: { [name: string]: string };
}

interface AppwriteResponse {
  send: (string, number?) => {};
  json: (object, number?) => {};
}

const databaseId = "default";
const usersCollectionId = "users";

module.exports = async function (req: AppwriteRequest, res: AppwriteResponse) {
  const client = new sdk.Client();

  let database = new sdk.Databases(client);

  if (
    !req.variables["APPWRITE_FUNCTION_ENDPOINT"] ||
    !req.variables["APPWRITE_FUNCTION_API_KEY"]
  ) {
    throw Error(
      "Environment variables are not set. Function cannot use Appwrite SDK."
    );
  }

  client
    .setEndpoint(req.variables["APPWRITE_FUNCTION_ENDPOINT"])
    .setProject(req.variables["APPWRITE_FUNCTION_PROJECT_ID"])
    .setKey(req.variables["APPWRITE_FUNCTION_API_KEY"]);

  const eventData = req.variables["APPWRITE_FUNCTION_EVENT_DATA"];
  console.log(eventData);

  const user: sdk.Models.User<sdk.Models.Preferences> = JSON.parse(eventData);

  console.log(user);

  await database.createDocument(databaseId, usersCollectionId, user.$id, { name: user.name });

  res.send(`Created user ${user.$id} in collection users`);
};
