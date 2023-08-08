import * as sdk from "node-appwrite";
import { AppwriteRequest } from "./types";

export function initializeClient(req: AppwriteRequest): sdk.Client {
  const client = new sdk.Client();

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
    .setKey(req.variables["APPWRITE_FUNCTION_API_KEY"])
    .setSelfSigned(req.variables["APPWRITE_FUNCTION_SELF_SIGNED"] === "true");

  return client;
}
