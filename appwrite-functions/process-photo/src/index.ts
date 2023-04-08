import * as fs from "fs";
import * as sdk from "node-appwrite";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";
import { Buckets, databaseId } from "./common/constants";
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

interface PhotoDocument extends sdk.Models.Document {
  user: sdk.Models.Document;
}

module.exports = async function (req: AppwriteRequest, res: AppwriteResponse) {
  const client = initializeClient(req);

  const database = new sdk.Databases(client);
  const storage = new sdk.Storage(client);

  const eventData = req.variables["APPWRITE_FUNCTION_EVENT_DATA"];
  console.log(eventData);

  const file: sdk.Models.File = JSON.parse(eventData);
  console.log(file);

  if (file.bucketId !== Buckets.PhotoUploads) {
    res.send(`Not processing bucket ${file.bucketId}`);
    return;
  }

  const readPermissions = file.$permissions.filter((p) => p.includes("read(\"user"));

  if (readPermissions.length < 1) {
    storage.deleteFile(file.bucketId, file.$id);
    res.send(`Invalid read permission: ${file.$permissions}`);
    return;
  }

  const role = readPermissions[0].replace("read(\"", "").replace("\")", "");
  const parts = role.split(":");
  if (parts.length !== 2 || parts[0] !== "user") {
    storage.deleteFile(file.bucketId, file.$id);
    res.send(`Invalid read permission: ${file.$permissions}`);
    return;
  }

  const userId = parts[1];

  // validate user matches photo document
  let photoDoc: PhotoDocument;
  try {
    photoDoc = await database.getDocument<PhotoDocument>(databaseId, "photos", file.$id);
  } catch (e) {
    res.send(`Photo ${file.$id} does not exist`);
    return;
  }
  if (photoDoc.user.$id !== userId) {
    storage.deleteFile(file.bucketId, file.$id);
    res.send(
      `Photo user_id (${photoDoc.user.$id}) does not match file's userId (${userId})`
    );
    return;
  }

  let b = await storage.getFileDownload(file.bucketId, file.$id);

  const s = sharp(b);

  s.resize({
    width: 1080,
    withoutEnlargement: true,
  });

  b = await s.toBuffer();

  // upload new file
  let tempDir;
  let filePath = "";
  let fileId = "";
  try {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `${file.$id}-`));
    const ext = path.extname(file.name);
    filePath = path.join(tempDir, photoDoc.$id + ext);
    fs.writeFileSync(filePath, b);

    const storageFile = await storage.createFile(
      Buckets.Photos,
      sdk.ID.unique(),
      sdk.InputFile.fromPath(filePath, file.name),
    );
    fileId = storageFile.$id;
  } finally {
    if (tempDir) {
      fs.rmdir(tempDir, { recursive: true }, () => { });
    }
  }

  // update photo document file_id
  await database.updateDocument(databaseId, photoDoc.$collectionId, photoDoc.$id, {
    file_id: fileId,
  });

  storage.deleteFile(file.bucketId, file.$id);

  res.send(`Updated photo ${photoDoc.$id} file_id to ${fileId}`);
};
