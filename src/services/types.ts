import { Models } from "appwrite";

export type Place = {
  latitude: number;
  longitude: number;
  comments: Comment[];
  photos: Photo[];
} & Models.Document;

export type User = {
  name: string;
  comments: Comment[];
  photos: Photo[];
} & Models.Document;

export type Comment = {
  place: Place;
  user: User;
  text: string;
} & Models.Document;

export type Photo = {
  place: Place;
  user: User;
  file_id: string;
  text: string;
} & Models.Document;
