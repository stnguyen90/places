import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Account, Client, Databases, Functions as FunctionsService, ID, Models, Query, Storage } from "appwrite";
import { Comment, Photo, Place } from "./types";

export const client = new Client();
const account = new Account(client);
const databases = new Databases(client);
const functions = new FunctionsService(client);
const storage = new Storage(client);

export const databaseId = "default";

export const Collections = {
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
    Place: "place",
    User: "user",
    Text: "text",
  },
  Photos: {
    Place: "place",
    User: "user",
    FileId: "file_id",
    Text: "text",
  },
} as const;

export const Buckets = {
  Photos: "photos",
  PhotoUploads: "photo-uploads",
} as const;

const Functions = {
  CreateComment: "create-comment",
  CreatePhoto: "create-photo",
} as const;

client
  .setEndpoint(process.env["REACT_APP_APPWRITE_ENDPOINT"] || "")
  .setProject(process.env["REACT_APP_APPWRITE_PROJECT_ID"] || "");

export const appwriteApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Account", "Comments", "Users", "Photos"],
  endpoints: (builder) => ({
    createAccount: builder.mutation<
      Models.Account<Models.Preferences>,
      { name: string; email: string; password: string }
    >({
      queryFn: async (args) => {
        try {
          const user = await account.create(
            ID.unique(),
            args.email,
            args.password,
            args.name
          );
          return { data: user };
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
          const session = await account.createEmailSession(
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
          await account.deleteSession("current");

          return { data: null };
        } catch (e) {
          return {
            error: e,
          };
        }
      },
    }),
    getAccount: builder.query<Models.Account<Models.Preferences> | null, void>({
      providesTags: ["Account"],
      queryFn: async () => {
        try {
          const user = await account.get();
          return { data: user };
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
          const doc = await databases.createDocument(
            databaseId,
            Collections.Places,
            ID.unique(),
            {
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
          const documentList = await databases.listDocuments<Place>(
            databaseId,
            Collections.Places,
            [
              'select(["latitude", "longitude"])',
              Query.greaterThan(Attributes.Places.Latitude, arg.minLat),
              Query.lessThan(Attributes.Places.Latitude, arg.maxLat),
              Query.greaterThan(Attributes.Places.Longitude, arg.minLong),
              Query.lessThan(Attributes.Places.Longitude, arg.maxLong),
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
    createComment: builder.mutation<
      Models.Execution,
      { place_id: string; text: string }
    >({
      invalidatesTags: ["Comments"],
      queryFn: async (args) => {
        try {
          const data = {
            'place_id': args.place_id,
            [Attributes.Comments.Text]: args.text,
          };

          const execution = await functions.createExecution(
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
          const documentList = await databases.listDocuments<Comment>(
            databaseId,
            Collections.Comments,
            [
              Query.equal(Attributes.Comments.Place, arg.place_id),
              Query.orderDesc('$createdAt'),
            ],
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
        text: string;
      }
    >({
      invalidatesTags: ["Photos"],
      queryFn: async (args) => {
        try {
          const data = {
            'place_id': args.place_id,
            [Attributes.Photos.Text]: args.text,
          };

          const execution = await functions.createExecution(
            Functions.CreatePhoto,
            JSON.stringify(data),
            false
          );

          if (execution.status !== "completed") {
            return {
              error: execution.stderr,
            };
          }

          const docId = execution.response;

          const file = await storage.createFile(
            Buckets.PhotoUploads,
            docId,
            args.file
          );

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
          const documentList = await databases.listDocuments<Photo>(
            databaseId,
            Collections.Photos,
            [
              Query.equal(Attributes.Photos.Place, arg.place_id),
              Query.notEqual(Attributes.Photos.FileId, ""),
              Query.orderDesc('$createdAt')
            ],
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
  useCreateCommentMutation,
  useGetCommentsQuery,
  useUploadPhotoMutation,
  useGetPhotosQuery,
} = appwriteApi;
