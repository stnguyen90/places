import React from "react";
import { MyLocation } from "@mui/icons-material";
import { Alert, CircularProgress, Fab } from "@mui/material";
import { LatLngBounds } from "leaflet";
import { Marker, useMap } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetPlacesQuery } from "../../services/appwrite";
import { Place } from "../../services/types";
import { PlaceDialog } from "../place-dialog/PlaceDialog";
import {
  selectBounds,
  selectPosition,
  setBounds,
  setPosition,
} from "./placesSlice";

const getBounds = (b: LatLngBounds) => {
  return {
    minLat: b.getSouth(),
    maxLat: b.getNorth(),
    minLong: b.getWest(),
    maxLong: b.getEast(),
  };
};

export function Places() {
  const [open, setOpen] = React.useState(false);
  const [selectedPlace, selectPlace] = React.useState<Place | null>(null);
  const map = useMap();
  const dispatch = useAppDispatch();
  const bounds = useAppSelector(selectBounds);
  const position = useAppSelector(selectPosition);
  const noBounds =
    bounds.minLat === 0 &&
    bounds.maxLat === 0 &&
    bounds.minLong === 0 &&
    bounds.maxLong === 0;
  const { data, isLoading, error } = useGetPlacesQuery(bounds, {
    skip: noBounds,
  });

  // handle selecting a location
  React.useEffect(() => {
    map.panTo([position.posLat, position.posLong]);

    // handle looping around the world going west
    if (position.posLong < -180) {
      const newlong = position.posLong + 360;
      map.setView([position.posLat, newlong]);
      dispatch(
        setPosition({
          ...position,
          posLong: newlong,
        })
      );
    }

    // handle looping around the world going east
    if (position.posLong > 180) {
      const newlong = position.posLong - 360;
      map.setView([position.posLat, newlong]);
      dispatch(
        setPosition({
          ...position,
          posLong: newlong,
        })
      );
    }
  }, [position.posLat, position.posLong]);

  React.useEffect(() => {
    const updateBounds = () => {
      const b = map.getBounds();
      dispatch(setBounds(getBounds(b)));
    };

    if (noBounds) {
      updateBounds();
    }

    map.on("moveend", () => {
      updateBounds();

      const center = map.getCenter();
      dispatch(
        setPosition({
          posLat: center.lat,
          posLong: center.lng,
        })
      );
    });

    map.on("resize", () => {
      updateBounds();
    });
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{`${error}`}</Alert>;
  }

  if (!data) {
    return null;
  }

  const fabStyle = {
    position: "absolute",
    bottom: 40,
    right: 32,
  };

  const handleClick = () => {
    map.locate().on("locationfound", (e) => {
      dispatch(setBounds(getBounds(e.bounds)));
      dispatch(
        setPosition({
          posLat: e.latlng.lat,
          posLong: e.latlng.lng,
        })
      );
      map.panTo(e.latlng);
    });
  };

  return (
    <>
      {data.map((place) => {
        return (
          <Marker
            key={place.$id}
            position={[place.latitude, place.longitude]}
            eventHandlers={{
              click: () => {
                selectPlace(place);
                setOpen(true);
              },
            }}
          ></Marker>
        );
      })}
      <PlaceDialog
        open={open}
        setOpen={setOpen}
        place={selectedPlace}
      ></PlaceDialog>
      <Fab
        size="large"
        sx={fabStyle}
        color="primary"
        aria-label="add"
        onClick={handleClick}
      >
        <MyLocation />
      </Fab>
    </>
  );
}
