import React from "react";
import {
  Box,
  createTheme,
  ThemeProvider,
  CssBaseline,
  ThemeOptions,
} from "@mui/material";
import "./App.css";
import { PlacesMap } from "./features/places-map/PlacesMap";
import { PlacesAppBar } from "./features/places-app-bar/PlacesAppBar";

export const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#1a5c1a",
    },
    secondary: {
      main: "#f50057",
    },
  },
};

const theme = createTheme(themeOptions);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh" }}>
        <CssBaseline />
        <PlacesAppBar />
        <Box
          component="main"
          sx={{ display: "flex", flexGrow: 1, flexFlow: "column" }}
        >
          <PlacesMap />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
