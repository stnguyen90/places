import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Appwrite, Query } from "appwrite";
import { Comment, Photo, Place, User } from "./types";

// Init your Web SDK
export const sdk = new Appwrite();

const Collections = {
  Places: "places",
  Users: "users",
  Comments: "comments",
  Photos: "photos",
} as const;

const Attributes = {
  Places: {
    Latitude: "latitude",
    Longitude: "longitude",
  },
  Users: {
    Name: "name",
  },
  Comments: {
    Created: "created",
    PlaceId: "place_id",
    UserId: "user_id",
    Text: "text",
  },
  Photos: {
    Created: "created",
    PlaceId: "place_id",
    UserId: "user_id",
    FileId: "file_id",
    Text: "text",
  },
} as const;

sdk
  .setEndpoint(process.env["REACT_APP_APPWRITE_ENDPOINT"] || "")
  .setProject(process.env["REACT_APP_APPWRITE_PROJECT_ID"] || "");

export const appwriteApi = createApi({
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getPlaces: builder.query<
      Place[],
      {
        minLat: number;
        maxLat: number;
        minLong: number;
        maxLong: number;
      }
    >({
      queryFn: async (arg) => {
        try {
          const documentList = await sdk.database.listDocuments<Place>(
            Collections.Places,
            [
              Query.greater(Attributes.Places.Latitude, arg.minLat),
              Query.lesser(Attributes.Places.Latitude, arg.maxLat),
              Query.greater(Attributes.Places.Longitude, arg.minLong),
              Query.lesser(Attributes.Places.Longitude, arg.maxLong),
            ]
          );
          return { data: documentList.documents };
        } catch (e) {
          return {
            error: e,
          };
        }
      },
    }),
    getUsers: builder.query<
      User[],
      {
        user_ids: string[];
      }
    >({
      queryFn: async (arg) => {
        try {
          const documentList = await sdk.database.listDocuments<User>(
            Collections.Users,
            [Query.equal("$id", arg.user_ids)]
          );
          return { data: documentList.documents };
        } catch (e) {
          return {
            error: e,
          };
        }
      },
    }),
    getComments: builder.query<
      Comment[],
      {
        place_id: string;
      }
    >({
      queryFn: async (arg) => {
        try {
          const documentList = await sdk.database.listDocuments<Comment>(
            Collections.Comments,
            [Query.equal(Attributes.Comments.PlaceId, arg.place_id)],
            undefined, // limit
            undefined, // offset
            undefined, // cursor
            undefined, // cursorDirection
            ["created"], // orderAttributes
            ["DESC"] // orderTypes
          );
          return { data: documentList.documents };
        } catch (e) {
          return {
            error: e,
          };
        }
      },
    }),
    getPhotos: builder.query<
      Photo[],
      {
        place_id: string;
      }
    >({
      queryFn: async (arg) => {
        try {
          const documentList = await sdk.database.listDocuments<Photo>(
            Collections.Photos,
            [Query.equal(Attributes.Comments.PlaceId, arg.place_id)],
            undefined, // limit
            undefined, // offset
            undefined, // cursor
            undefined, // cursorDirection
            ["created"], // orderAttributes
            ["DESC"] // orderTypes
          );
          return { data: documentList.documents };
        } catch (e) {
          return {
            error: e,
          };
        }
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetPlacesQuery,
  useGetUsersQuery,
  useGetCommentsQuery,
  useGetPhotosQuery,
} = appwriteApi;
