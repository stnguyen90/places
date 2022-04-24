import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Appwrite, Query } from "appwrite";
import { Place } from "./types";

// Init your Web SDK
const sdk = new Appwrite();

const Collections = {
  Places: "places",
} as const;

const Attributes = {
  Places: {
    Latitude: "latitude",
    Longitude: "longitude",
  },
} as const;

sdk
  .setEndpoint("https://appwrite-dev.g33kdev.com/v1") // Your Appwrite Endpoint
  .setProject("potty-places"); // Your project ID

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
        if (!arg.minLat && !arg.maxLat && !arg.minLong && !arg.maxLong)
          return { data: [] };

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
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPlacesQuery } = appwriteApi;
