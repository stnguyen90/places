import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Search from "./Search";
import { AuthDialog } from "../auth-dialog/AuthDialog";
import {
  sdk,
  useDeleteSessionMutation,
  useGetAccountQuery,
} from "../../services/appwrite";
import { Avatar } from "@mui/material";

export function PlacesAppBar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const [open, setOpen] = React.useState(false);
  const {
    data: account,
    isLoading: getAccountIsLoading,
    error: getAccountError,
  } = useGetAccountQuery();
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
      {/* <MenuItem onClick={handleLogOut}>Add a Place</MenuItem> */}
      <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";

  return (
    <>
      <AppBar position="absolute" sx={{ width: "100%" }}>
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
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
