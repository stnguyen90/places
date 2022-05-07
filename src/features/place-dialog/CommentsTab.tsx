import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { Add, Send } from "@mui/icons-material";
import {
  useCreateCommentMutation,
  useGetAccountQuery,
  useGetCommentsQuery,
  useGetUsersQuery,
} from "../../services/appwrite";
import { Place, User } from "../../services/types";

export function CommentsTab(props: { place: Place | null }) {
  const placeId = props.place?.$id || "";
  const { data: comments, isLoading: getCommentsIsLoading } =
    useGetCommentsQuery(
      {
        place_id: placeId,
      },
      { skip: placeId === "" }
    );
  const { data: account } = useGetAccountQuery();
  const [isAdding, setIsAdding] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [createComment, createCommentResult] = useCreateCommentMutation();

  const userIds = new Set<string>();
  comments?.forEach((c) => {
    userIds.add(c.user_id);
  });

  const { data: users, isLoading: getUsersIsLoading } = useGetUsersQuery(
    { user_ids: Array.from(userIds) },
    { skip: userIds.size === 0 }
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

  const submit = async () => {
    if (comment === "") return;
    try {
      await createComment({
        place_id: placeId,
        text: comment,
      }).unwrap();
      setComment("");
      setIsAdding(false);
    } catch (e) {}
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      submit();
    }
  };

  return (
    <List>
      {createCommentResult.isError && (
        <ListItem>
          <ListItemText>
            <Alert severity="error">{`${createCommentResult.error}`}</Alert>
          </ListItemText>
        </ListItem>
      )}
      {account && (
        <ListItem divider disablePadding key="add-button">
          <ListItemText sx={{ pl: 2 }}>
            {!isAdding ? (
              <Button
                startIcon={<Add />}
                onClick={() => {
                  setIsAdding(true);
                }}
              >
                Add a Comment
              </Button>
            ) : (
              <OutlinedInput
                autoFocus
                fullWidth
                size="small"
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                disabled={createCommentResult.isLoading}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton aria-label="submit" edge="end" onClick={submit}>
                      {createCommentResult.isLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Send />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
            )}
          </ListItemText>
        </ListItem>
      )}
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
