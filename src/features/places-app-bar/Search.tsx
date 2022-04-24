import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import { setPosition } from "../places/placesSlice";
import { useAppDispatch } from "../../app/hooks";

const SearchInput = styled(TextField)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
  },
}));

interface OSMPlace {
  place_id: number;
  boundingbox: [
    minLat: number,
    maxLat: number,
    minLong: number,
    maxLong: number
  ];
  display_name: string;
  lat: number;
  lon: number;
}

export default function Search() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<OSMPlace[]>([]);
  const [search, setSearch] = React.useState("");
  const loading = open && options.length === 0 && search !== "";

  React.useEffect(() => {
    (async () => {
      if (!search) return;
      const params = new URLSearchParams({
        format: "json",
        q: `"${search}"`,
      });
      const res = await fetch(
        "https://nominatim.openstreetmap.org/search?" + params,
        {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
          },
          method: "GET",
        }
      );

      const places = await res.json();

      setOptions([...places]);
    })();
  }, [search]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      id="asynchronous-demo"
      sx={{
        flexGrow: { sm: 1 },
        width: { xs: "100%", sm: 300 },
        color: "white",
      }}
      size="small"
      open={open}
      filterOptions={(x) => x}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onChange={(e, v) => {
        if (!v) return;
        dispatch(
          setPosition({
            posLat: v.lat,
            posLong: v.lon,
          })
        );
      }}
      onInputChange={(_e, v) => {
        setSearch(v);
      }}
      isOptionEqualToValue={(option, value) => {
        return option.place_id === value.place_id;
      }}
      getOptionLabel={(option) => option.display_name}
      options={options}
      loading={loading}
      color="white"
      renderInput={(params) => {
        return (
          <SearchInput
            placeholder="Search..."
            {...params}
            InputProps={{
              ...params.InputProps,
              sx: {
                color: "white",
              },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "white" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                </React.Fragment>
              ),
            }}
          />
        );
      }}
    />
  );
}
