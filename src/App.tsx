import React from "react";
import logo from "./logo.svg";
import { Counter } from "./features/counter/Counter";
import "./App.css";
import {
  Container,
  Box,
  Typography,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Toolbar,
  ThemeOptions,
} from "@mui/material";
import { PlacesMap } from "./features/places-map/PlacesMap";
import { PlacesAppBar } from "./features/places-app-bar/PlacesAppBar";

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <Counter />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <span>
//           <span>Learn </span>
//           <a
//             className="App-link"
//             href="https://reactjs.org/"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             React
//           </a>
//           <span>, </span>
//           <a
//             className="App-link"
//             href="https://redux.js.org/"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Redux
//           </a>
//           <span>, </span>
//           <a
//             className="App-link"
//             href="https://redux-toolkit.js.org/"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Redux Toolkit
//           </a>
//           ,<span> and </span>
//           <a
//             className="App-link"
//             href="https://react-redux.js.org/"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             React Redux
//           </a>
//         </span>
//       </header>
//     </div>
//   );
// }
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
          <Toolbar />
          <PlacesMap />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
