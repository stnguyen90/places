import { Models } from "appwrite";

export type Place = {
  latitude: number;
  longitude: number;
  status: string;
} & Models.Document;

export type User = {
  name: string;
} & Models.Document;

export type Comment = {
  place_id: string;
  user_id: string;
  created: string;
  text: string;
} & Models.Document;

export type Photo = {
  place_id: string;
  user_id: string;
  file_id: string;
  created: string;
  text: string;
} & Models.Document;
