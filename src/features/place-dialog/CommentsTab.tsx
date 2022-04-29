import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useGetCommentsQuery, useGetUsersQuery } from "../../services/appwrite";
import { Place, User } from "../../services/types";

export function CommentsTab(props: { place: Place | null }) {
  const placeId = props.place?.$id || "";
  const {
    data: comments,
    isLoading: getCommentsIsLoading,
    error: getCommentsError,
  } = useGetCommentsQuery(
    {
      place_id: placeId,
    },
    { skip: placeId == "" }
  );

  const userIds = new Set<string>();
  comments?.forEach((c) => {
    userIds.add(c.user_id);
  });

  const {
    data: users,
    isLoading: getUsersIsLoading,
    error: getUsersError,
  } = useGetUsersQuery(
    { user_ids: Array.from(userIds) },
    { skip: userIds.size == 0 }
  );

  if (getCommentsIsLoading || getUsersIsLoading)
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

  return (
    <List>
      {(comments || []).map((c) => {
        const name = usersMap.get(c.user_id)?.name || "John Doe";

        const date = new Date(c.created);
        const day = date.toLocaleDateString();
        const time = date.toLocaleTimeString();

        return (
          <ListItem divider key={c.$id}>
            <ListItemText
              disableTypography
              primary={
                <Typography variant="h6" color="text.primary">
                  {name}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {day} {time}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {c.text}
                  </Typography>
                </>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}
