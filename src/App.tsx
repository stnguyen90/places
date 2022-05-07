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
      main: "#f02e65",
    },
  },
};

const theme = createTheme(themeOptions);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: "100%", width: "100%" }}>
        <PlacesAppBar />
        <Box
          sx={{
            width: "100%",
            height: "calc(100% - 56px)",
            position: "absolute",
            top: 56,
          }}
        >
          <PlacesMap />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
