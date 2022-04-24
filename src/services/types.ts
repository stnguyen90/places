import { Models } from "appwrite";

export type Place = {
  latitude: number;
  longitude: number;
  status: string;
} & Models.Document;
