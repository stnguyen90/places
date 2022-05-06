# Places

This app allows users to add comments and photos to locations on a map.

## Getting Started

### Appwrite

The following steps use the [Appwrite CLI](https://appwrite.io/docs/command-line) to set up Appwrite.

1. Create the project via the Appwrite Admin Console
   - ID: places
   - Name: Places
1. Copy the `appwrite.json.default` to `appwrite.json`
1. Deploy the collections
   1. `echo a | appwrite deploy collection`
1. Create an API Key
   1. `appwrite projects createKey --projectId places --name "Places Functions" --scopes documents.read documents.write files.read files.write`
   1. Take note of the `secret`
1. Deploy the functions
   1. Update variables in the `appwrite.json`:
      1. `APPWRITE_FUNCTION_ENDPOINT` - your HTTPS Appwrite endpoint
      1. `APPWRITE_FUNCTION_API_KEY` - the `secret` from the previous step
   1. Compile each of the functions in the `functions` folder:
      1. Go into the function folder
      1. Run `npm i && npm run build`
   1. Go back up to the folder with `appwrite.json` and deploy all the functions:
      1. `echo a | appwrite deploy function`
1. Create the storage buckets
   1. `appwrite storage createBucket --bucketId photo-uploads --name "Photo Uploads" --permission file --enabled true --maximumFileSize 5000000 --encryption true --antivirus true --allowedFileExtensions jpg png heic jpeg`
   1. `appwrite storage createBucket --bucketId photos --name "Photos" --permission bucket --read "role:all" --enabled true --maximumFileSize 5000000 --encryption true --antivirus true --allowedFileExtensions jpg png heic jpeg`

### Places App

1. Copy the `.env` to `.env.local`
1. Fill in the values in `.env.local`
1. Start the app:
   1. `npm i && npm start`
