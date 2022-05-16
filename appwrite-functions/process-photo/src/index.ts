import * as sdk from "node-appwrite";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as sharp from "sharp";

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - object with request body data
    'env' - object with environment variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

interface AppwriteRequest {
  headers: { [name: string]: string };
  payload: string;
  env: { [name: string]: string };
}

interface AppwriteResponse {
  send: (string, number?) => {};
  json: (object, number?) => {};
}

interface PhotoDocument extends sdk.Models.Document {
  user_id: string;
}

const Buckets = {
  Photos: "photos",
  PhotoUploads: "photo-uploads",
} as const;

module.exports = async function (req: AppwriteRequest, res: AppwriteResponse) {
  const client = new sdk.Client();

  const database = new sdk.Database(client);
  const storage = new sdk.Storage(client);

  if (
    !req.env["APPWRITE_FUNCTION_ENDPOINT"] ||
    !req.env["APPWRITE_FUNCTION_API_KEY"]
  ) {
    throw Error(
      "Environment variables are not set. Function cannot use Appwrite SDK."
    );
  }

  client
    .setEndpoint(req.env["APPWRITE_FUNCTION_ENDPOINT"])
    .setProject(req.env["APPWRITE_FUNCTION_PROJECT_ID"])
    .setKey(req.env["APPWRITE_FUNCTION_API_KEY"]);

  const eventData = req.env["APPWRITE_FUNCTION_EVENT_DATA"];
  console.log(eventData);

  const file: sdk.Models.File = JSON.parse(eventData);
  console.log(file);

  if (file.bucketId !== Buckets.PhotoUploads) {
    res.send(`Not processing bucket ${file.bucketId}`);
    return;
  }

  if (file.$read.length < 1) {
    storage.deleteFile(file.bucketId, file.$id);
    res.send(`Invalid read permission: ${file.$read}`);
    return;
  }

  const readParts = file.$read[0].split(":");
  if (readParts.length !== 2 || readParts[0] !== "user") {
    storage.deleteFile(file.bucketId, file.$id);
    res.send(`Invalid read permission: ${file.$read}`);
    return;
  }

  const userId = readParts[1];

  // validate user matches photo document
  let photoDoc: PhotoDocument;
  try {
    photoDoc = await database.getDocument<PhotoDocument>("photos", file.$id);
  } catch (e) {
    res.send(`Photo ${file.$id} does not exist`);
    return;
  }
  if (photoDoc.user_id !== userId) {
    storage.deleteFile(file.bucketId, file.$id);
    res.send(
      `Photo user_id (${photoDoc.user_id}) does not match file's userId (${userId})`
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
      "unique()",
      filePath
    );
    fileId = storageFile.$id;
  } finally {
    if (tempDir) {
      fs.rmdir(tempDir, { recursive: true }, () => {});
    }
  }

  // update photo document file_id
  await database.updateDocument(photoDoc.$collection, photoDoc.$id, {
    file_id: fileId,
  });

  storage.deleteFile(file.bucketId, file.$id);

  res.send(`Updated photo ${photoDoc.$id} file_id to ${fileId}`);
};
