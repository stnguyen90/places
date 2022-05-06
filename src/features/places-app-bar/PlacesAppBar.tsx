import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  MenuItem,
  Menu,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { Search } from "./Search";
import { AuthDialog } from "../auth-dialog/AuthDialog";
import {
  useDeleteSessionMutation,
  useGetAccountQuery,
} from "../../services/appwrite";
import { useAppDispatch } from "../../app/hooks";
import { setIsAdding } from "../places/placesSlice";

export function PlacesAppBar() {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const [open, setOpen] = React.useState(false);
  const { data: account } = useGetAccountQuery();
  const [deleteSession] = useDeleteSessionMutation();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAuthDialogOpen = () => {
    setOpen(true);
  };

  const handleAddPlace = () => {
    dispatch(setIsAdding({ isAdding: true }));
    handleMenuClose();
  };

  const handleLogOut = async () => {
    deleteSession();
    handleMenuClose();
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleAddPlace}>Add a Place</MenuItem>
      <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar position="absolute" sx={{ width: "100%" }}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Places
          </Typography>
          <Search />
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex" }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={account ? handleProfileMenuOpen : handleAuthDialogOpen}
              color="inherit"
            >
              {!account ? (
                <AccountCircle />
              ) : (
                <Avatar>{account.name.substring(0, 1).toUpperCase()}</Avatar>
              )}
            </IconButton>
            <AuthDialog open={open} setOpen={setOpen}></AuthDialog>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </>
  );
}
