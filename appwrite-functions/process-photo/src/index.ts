import { Databases, ID, type Models, Storage } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import sharp from "sharp";
import { Buckets, databaseId } from "./common/constants.js";
import type { AppwriteContext } from "./common/types.js";
import { initializeClient } from "./common/utils.js";

interface PhotoDocument extends Models.Document {
  user: Models.Document;
}

async function main({ req, res, log }: AppwriteContext) {
  const client = initializeClient(req);

  const database = new Databases(client);
  const storage = new Storage(client);

  const file = req.bodyJson as Models.File;
  log(file);

  if (file.bucketId !== Buckets.PhotoUploads) {
    return res.send(`Not processing bucket ${file.bucketId}`);
  }

  const readPermissions = file.$permissions.filter((p) =>
    p.includes('read("user'),
  );

  if (readPermissions.length < 1) {
    storage.deleteFile(file.bucketId, file.$id);
    return res.send(`Invalid read permission: ${file.$permissions}`);
  }

  const role = readPermissions[0].replace('read("', "").replace('")', "");
  const parts = role.split(":");
  if (parts.length !== 2 || parts[0] !== "user") {
    storage.deleteFile(file.bucketId, file.$id);
    return res.send(`Invalid read permission: ${file.$permissions}`);
  }

  const userId = parts[1];

  // validate user matches photo document
  let photoDoc: PhotoDocument;
  try {
    photoDoc = await database.getDocument<PhotoDocument>(
      databaseId,
      "photos",
      file.$id,
    );
  } catch (e) {
    return res.send(`Photo ${file.$id} does not exist`);
  }
  if (photoDoc.user.$id !== userId) {
    storage.deleteFile(file.bucketId, file.$id);
    return res.send(
      `Photo user_id (${photoDoc.user.$id}) does not match file's userId (${userId})`,
    );
  }

  const downloaded = await storage.getFileDownload(file.bucketId, file.$id);

  const s = sharp(downloaded);

  s.resize({
    width: 1080,
    withoutEnlargement: true,
  });

  const buf = await s.toBuffer();

  // upload new file
  let fileId = ID.unique();
  const storageFile = await storage.createFile(
    Buckets.Photos,
    fileId,
    InputFile.fromBuffer(new Blob([buf]), file.name)
  );
  fileId = storageFile.$id;

  // update photo document fileId
  await database.updateDocument(
    databaseId,
    photoDoc.$collectionId,
    photoDoc.$id,
    {
      fileId: fileId,
    },
  );

  storage.deleteFile(file.bucketId, file.$id);

  return res.send(`Updated photo ${photoDoc.$id} fileId to ${fileId}`);
}

export default main;
