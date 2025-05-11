# Places

This app allows users to add comments and photos to locations on a map.

## Getting Started

### Appwrite

The following steps use the [Appwrite CLI](https://appwrite.io/docs/command-line) to set up Appwrite.

1. Create the project via the Appwrite Admin Console
   - Name: Places
1. Copy the `appwrite.json.default` to `appwrite.json`
1. Replace the `projectId` with your project ID
1. Push the collections
   - `appwrite push collection`
1. Push the functions
   - `appwrite push function`
1. Push the storage buckets
   - `appwrite push bucket`

### Places App

1. Copy the `.env` to `.env.local`
1. Fill in the values in `.env.local`
1. Start the app:
   - `npm i && npm start`
