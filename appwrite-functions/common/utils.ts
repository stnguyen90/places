import { Client } from "node-appwrite";
import type { AppwriteRequest } from "./types.js";

export function initializeClient(req: AppwriteRequest): Client {
  const client = new Client();

  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const apiKey = req.headers["x-appwrite-key"] ?? "";

  if (!endpoint || !projectId) {
    throw Error(
      "Environment variables are not set. Function cannot use Appwrite SDK.",
    );
  }

  client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

  return client;
}
