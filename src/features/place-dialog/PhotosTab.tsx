import { PhotoCamera } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  ImageListItem,
  ImageListItemBar,
  ImageList as Masonry,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Storage } from "appwrite";
import React from "react";
import {
  Buckets,
  Collections,
  client,
  databaseId,
  useGetAccountQuery,
  useGetPhotosQuery,
  useGetUsersQuery,
  useUploadPhotoMutation,
} from "../../services/appwrite";
import { Photo, Place, User } from "../../services/types";

export function PhotosTab(props: { place: Place | null }) {
  const theme = useTheme();
  const matchesSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const matchesLarge = useMediaQuery(theme.breakpoints.up("lg"));
  const placeId = props.place?.$id || "";
  const { data: account } = useGetAccountQuery();
  const {
    data: photos,
    isLoading: getPhotosIsLoading,
    refetch: refetchPhotos,
  } = useGetPhotosQuery(
    {
      place_id: placeId,
    },
    { skip: placeId === "" }
  );
  const [uploadPhoto, uploadPhotoResult] = useUploadPhotoMutation();

  const userIds = new Set<string>();
  photos?.forEach((p) => {
    userIds.add(p.user_id);
  });

  const { data: users, isLoading: getUsersIsLoading } = useGetUsersQuery(
    { user_ids: Array.from(userIds) },
    { skip: userIds.size === 0 }
  );

  React.useEffect(() => {
    const unsubscribe = client.subscribe<Photo>(
      [`databases.${databaseId}.collections.${Collections.Photos}.documents`],
      (response) => {
        // Callback will be executed on changes for documents A and all files.
        const updatedPhoto = response.payload;
        if (
          response.events[0].includes(".update") &&
          updatedPhoto.place_id === placeId &&
          updatedPhoto.file_id !== ""
        ) {
          refetchPhotos();
        }
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  if (getPhotosIsLoading || getUsersIsLoading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ pt: 4 }}
      >
        <CircularProgress />
      </Box>
    );

  const usersMap = new Map<string, User>();
  users?.forEach((u) => {
    usersMap.set(u.$id, u);
  });

  let cols = 1;
  if (matchesLarge) {
    cols = 4;
  } else if (matchesSmall) {
    cols = 2;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadPhoto({
        file: files[0],
        place_id: placeId,
        text: "",
      });
    }
  };

  let uploadButton = null;
  if (account) {
    uploadButton = (
      <Box
        sx={{ py: 8 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <label htmlFor="upload-button">
          <input
            style={{ display: "none" }}
            accept="image/*"
            id="upload-button"
            type="file"
            onChange={handleChange}
          />
          <Button
            variant="contained"
            aria-label="upload picture"
            component="span"
            startIcon={
              uploadPhotoResult.isLoading ? (
                <CircularProgress />
              ) : (
                <PhotoCamera />
              )
            }
            disabled={uploadPhotoResult.isLoading}
          >
            Upload
          </Button>
        </label>
      </Box>
    );
  }

  if (!photos || photos.length === 0) {
    return uploadButton;
  }

  return (
    <>
      {uploadPhotoResult.isError && (
        <Alert
          sx={{ mt: 1 }}
          severity="error"
        >{`${uploadPhotoResult.error}`}</Alert>
      )}

      <Masonry cols={cols} gap={4}>
        {uploadButton}

        {(photos || []).map((p) => {
          const name = usersMap.get(p.user_id)?.name || "John Doe";

          const date = new Date(p.created);
          const day = date.toLocaleDateString();
          const time = date.toLocaleTimeString();

          const storage = new Storage(client);
          const url = storage.getFileView(Buckets.Photos, p.file_id);

          return (
            <ImageListItem key={p.$id}>
              <img src={`${url}`} alt={p.text} loading="lazy" />
              <ImageListItemBar
                position="below"
                title={name}
                subtitle={`${day} ${time}`}
              />
            </ImageListItem>
          );
        })}
      </Masonry>
    </>
  );
}
