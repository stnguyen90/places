import {
  Box,
  CircularProgress,
  ImageList as Masonry,
  ImageListItem,
  ImageListItemBar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  sdk,
  useGetPhotosQuery,
  useGetUsersQuery,
} from "../../services/appwrite";
import { Place, User } from "../../services/types";

export function PhotosTab(props: { place: Place | null }) {
  const theme = useTheme();
  const matchesSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const matchesLarge = useMediaQuery(theme.breakpoints.up("lg"));
  const placeId = props.place?.$id || "";
  const {
    data: photos,
    isLoading: getPhotosIsLoading,
    error: getPhotosError,
  } = useGetPhotosQuery(
    {
      place_id: placeId,
    },
    { skip: placeId == "" }
  );

  const userIds = new Set<string>();
  photos?.forEach((p) => {
    userIds.add(p.user_id);
  });

  const {
    data: users,
    isLoading: getUsersIsLoading,
    error: getUsersError,
  } = useGetUsersQuery(
    { user_ids: Array.from(userIds) },
    { skip: userIds.size == 0 }
  );

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

  return (
    <Masonry cols={cols} gap={4}>
      {(photos || []).map((p) => {
        const name = usersMap.get(p.user_id)?.name || "John Doe";

        const date = new Date(p.created);
        const day = date.toLocaleDateString();
        const time = date.toLocaleTimeString();

        const url = sdk.storage.getFileView("photos", p.file_id);

        return (
          <ImageListItem key={p.$id}>
            <img
              src={`${url}`}
              // srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
              alt={p.text}
              loading="lazy"
            />
            <ImageListItemBar
              position="below"
              title={name}
              subtitle={`${day} ${time}`}
            />
          </ImageListItem>
        );
      })}
    </Masonry>
  );
}
