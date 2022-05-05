import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Alert, Button, Typography } from "@mui/material";
import {
  useCreateAccountMutation,
  useCreateSessionMutation,
} from "../../services/appwrite";

interface State {
  email: string;
  password1: string;
  showPassword1: boolean;
  password2: string;
  showPassword2: boolean;
  name: string;
}

export default function AuthForm(props: { onComplete: Function }) {
  const [isSignUp, setSignUp] = React.useState(false);
  const [error, setError] = React.useState("");
  const [values, setValues] = React.useState<State>({
    email: "",
    password1: "",
    showPassword1: false,
    password2: "",
    showPassword2: false,
    name: "",
  });
  const [createAccount] = useCreateAccountMutation();
  const [createSession] = useCreateSessionMutation();

  const handleChange =
    (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [prop]: event.target.value });
    };

  const handleClickShowPassword1 = () => {
    setValues({
      ...values,
      showPassword1: !values.showPassword1,
    });
  };

  const handleClickShowPassword2 = () => {
    setValues({
      ...values,
      showPassword2: !values.showPassword2,
    });
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleSubmit = async () => {
    setError("");
    if (isSignUp) {
      if (values.password1 !== values.password2) {
        setError("Passwords must match");
        return;
      }
      if (values.name.length === 0) {
        setError("Name is required");
        return;
      }
      try {
        await createAccount({
          name: values.name,
          email: values.email,
          password: values.password1,
        });
        await createSession({
          email: values.email,
          password: values.password1,
        });
        props.onComplete();
      } catch (e) {
        let message = (e as any).message || String(e);
        setError(message);
      }
    } else {
      try {
        await createSession({
          email: values.email,
          password: values.password1,
        });
        props.onComplete();
      } catch (e) {
        let message = (e as any).message || String(e);
        setError(message);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      {/* <Box>
        <TextField id="email" label="Email"></TextField>
      </Box>
      <Box>
        <TextField id="password" label="Password"></TextField>
      </Box> */}
      <Typography variant="h5" sx={{ my: 2, mx: 1 }}>
        {isSignUp ? "Sign Up" : "Log In"}
      </Typography>
      {isSignUp && (
        <Box>
          <FormControl sx={{ m: 1, width: "50ch" }} variant="outlined">
            <InputLabel htmlFor="name">Name</InputLabel>
            <OutlinedInput
              id="name"
              value={values.name}
              onChange={handleChange("name")}
              onKeyDown={handleKeyDown}
              label="Name"
              inputProps={{
                "aria-label": "name",
              }}
            />
          </FormControl>
        </Box>
      )}
      <Box>
        <FormControl sx={{ m: 1, width: "50ch" }} variant="outlined">
          <InputLabel htmlFor="email">Email</InputLabel>
          <OutlinedInput
            id="email"
            value={values.email}
            onChange={handleChange("email")}
            onKeyDown={handleKeyDown}
            label="Email"
            inputProps={{
              "aria-label": "email",
            }}
          />
        </FormControl>
      </Box>
      <Box>
        <FormControl sx={{ m: 1, width: "50ch" }} variant="outlined">
          <InputLabel htmlFor="password1">Password</InputLabel>
          <OutlinedInput
            id="password1"
            type={values.showPassword1 ? "text" : "password"}
            value={values.password1}
            onChange={handleChange("password1")}
            onKeyDown={handleKeyDown}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword1}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {values.showPassword1 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>
      </Box>
      {isSignUp && (
        <Box>
          <FormControl sx={{ m: 1, width: "50ch" }} variant="outlined">
            <InputLabel htmlFor="password2">Password Confirmation</InputLabel>
            <OutlinedInput
              id="password2"
              type={values.showPassword2 ? "text" : "password"}
              value={values.password2}
              onChange={handleChange("password2")}
              onKeyDown={handleKeyDown}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword2}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {values.showPassword2 ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password Confirmation"
            />
          </FormControl>
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Box display="flex" justifyContent="center">
        <Button
          sx={{ m: 2 }}
          variant="outlined"
          onClick={() => {
            setSignUp(!isSignUp);
          }}
        >
          {isSignUp ? "Log In" : "Sign Up"}
        </Button>
        <Button sx={{ m: 2 }} variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </>
  );
}
