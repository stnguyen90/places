import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Appwrite, Models, Query } from "appwrite";
import { Comment, Photo, Place, User } from "./types";

export const sdk = new Appwrite();

const Collections = {
  Places: "places",
  Users: "users",
  Comments: "comments",
  Photos: "photos",
} as const;

const Attributes = {
  Places: {
    Status: "status",
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

const UNIQUE_ID = "unique()";

export const Buckets = {
  Photos: "photos",
} as const;

const Functions = {
  CreateComment: "create-comment",
} as const;

sdk
  .setEndpoint(process.env["REACT_APP_APPWRITE_ENDPOINT"] || "")
  .setProject(process.env["REACT_APP_APPWRITE_PROJECT_ID"] || "");

export const appwriteApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Account", "Comments", "Users", "Photos"],
  endpoints: (builder) => ({
    createAccount: builder.mutation<
      Models.User<Models.Preferences>,
      { name: string; email: string; password: string }
    >({
      queryFn: async (args) => {
        try {
          const account = await sdk.account.create(
            UNIQUE_ID,
            args.email,
            args.password,
            args.name
          );
          return { data: account };
        } catch (e) {
          return {
            error: e,
          };
        }
      },
    }),
    createSession: builder.mutation<
      Models.Session,
      { email: string; password: string }
    >({
      invalidatesTags: ["Account"],
      queryFn: async (args) => {
        try {
          const session = await sdk.account.createSession(
            args.email,
            args.password
          );

          return { data: session };
        } catch (e) {
          return {
            error: e,
          };
        }
      },
    }),
    deleteSession: builder.mutation<null, void>({
      invalidatesTags: ["Account"],
      queryFn: async () => {
        try {
          await sdk.account.deleteSession("current");

          return { data: null };
        } catch (e) {
          return {
            error: e,
          };
        }
      },
    }),
    getAccount: builder.query<Models.User<Models.Preferences> | null, void>({
      providesTags: ["Account"],
      queryFn: async () => {
        try {
          const account = await sdk.account.get();
          return { data: account };
        } catch (e) {
          return {
            data: null,
          };
        }
      },
    }),
    createPlace: builder.mutation<
      Models.Document,
      { lat: number; long: number }
    >({
      queryFn: async (args) => {
        try {
          const doc = await sdk.database.createDocument(
            Collections.Places,
            UNIQUE_ID,
            {
              [Attributes.Places.Status]: "submitted",
              [Attributes.Places.Latitude]: args.lat,
              [Attributes.Places.Longitude]: args.long,
            }
          );
          return { data: doc };
        } catch (e) {
          return {
            error: e,
          };
        }
      },
    }),
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
    createComment: builder.mutation<
      Models.Execution,
      { place_id: string; text: string }
    >({
      invalidatesTags: ["Comments"],
      queryFn: async (args) => {
        try {
          const data = {
            [Attributes.Comments.PlaceId]: args.place_id,
            [Attributes.Comments.Text]: args.text,
          };

          const execution = await sdk.functions.createExecution(
            Functions.CreateComment,
            JSON.stringify(data),
            false
          );

          if (execution.status === "completed") {
            return { data: execution };
          }

          return {
            error: execution.stderr,
          };
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
      providesTags: ["Comments"],
      queryFn: async (arg) => {
        try {
          const documentList = await sdk.database.listDocuments<Comment>(
            Collections.Comments,
            [Query.equal(Attributes.Comments.PlaceId, arg.place_id)],
            undefined, // limit
            undefined, // offset
            undefined, // cursor
            undefined, // cursorDirection
            [Attributes.Comments.Created], // orderAttributes
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
    uploadPhoto: builder.mutation<
      Models.File,
      {
        file: File;
        place_id: string;
        user_id: string;
        text: string;
      }
    >({
      invalidatesTags: ["Photos"],
      queryFn: async (args) => {
        try {
          const file = await sdk.storage.createFile(
            Buckets.Photos,
            UNIQUE_ID,
            args.file
          );

          await sdk.database.createDocument(Collections.Photos, UNIQUE_ID, {
            [Attributes.Photos.Created]: new Date().toISOString(),
            [Attributes.Photos.FileId]: file.$id,
            [Attributes.Photos.PlaceId]: args.place_id,
            [Attributes.Photos.UserId]: args.user_id,
            [Attributes.Photos.Text]: args.text,
          });
          return { data: file };
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
      providesTags: ["Photos"],
      queryFn: async (arg) => {
        try {
          const documentList = await sdk.database.listDocuments<Photo>(
            Collections.Photos,
            [Query.equal(Attributes.Comments.PlaceId, arg.place_id)],
            undefined, // limit
            undefined, // offset
            undefined, // cursor
            undefined, // cursorDirection
            [Attributes.Photos.Created], // orderAttributes
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
  useCreateAccountMutation,
  useCreateSessionMutation,
  useDeleteSessionMutation,
  useGetAccountQuery,
  useCreatePlaceMutation,
  useGetPlacesQuery,
  useGetUsersQuery,
  useCreateCommentMutation,
  useGetCommentsQuery,
  useUploadPhotoMutation,
  useGetPhotosQuery,
} = appwriteApi;
