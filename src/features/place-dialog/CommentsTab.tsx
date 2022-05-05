import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  useCreateCommentMutation,
  useGetAccountQuery,
  useGetCommentsQuery,
  useGetUsersQuery,
} from "../../services/appwrite";
import { Place, User } from "../../services/types";

export function CommentsTab(props: { place: Place | null }) {
  const placeId = props.place?.$id || "";
  const {
    data: account,
    isLoading: getAccountIsLoading,
    error: getAccountError,
  } = useGetAccountQuery();
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
  const [isAdding, setIsAdding] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [createComment] = useCreateCommentMutation();

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsAdding(false);

      createComment({
        place_id: placeId,
        text: comment,
        user_id: account?.$id || "",
      });

      setComment("");
    }
  };

  return (
    <List>
      <ListItem divider disablePadding key="add-button">
        <ListItemText sx={{ pl: 2 }}>
          {!isAdding ? (
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setIsAdding(true);
              }}
            >
              Add a Comment
            </Button>
          ) : (
            <TextField
              autoFocus
              fullWidth
              size="small"
              onKeyDown={handleKeyDown}
              onChange={handleChange}
            />
          )}
        </ListItemText>
      </ListItem>
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
