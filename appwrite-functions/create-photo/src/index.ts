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
const placesCollectionId = "places";
const photosCollectionId = "photos";

module.exports = async function (req: AppwriteRequest, res: AppwriteResponse) {
  const client = new sdk.Client();

  const databases = new sdk.Databases(client);

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

  const data = JSON.parse(req.payload);

  const placeId = data["place_id"];
  const text = data["text"];

  // validate placeId
  try {
    await databases.getDocument(databaseId, placesCollectionId, placeId);
  } catch {
    res.json(
      {
        message: `Invalid place_id: ${placeId}`,
      },
      500
    );
    return;
  }

  const doc = await databases.createDocument(
    databaseId,
    photosCollectionId,
    sdk.ID.unique(),
    {
      created: new Date().toISOString(),
      place_id: placeId,
      file_id: "",
      user_id: req.variables["APPWRITE_FUNCTION_USER_ID"],
      text: text,
    }
  );

  res.send(doc.$id);
};
