import { Alert, CircularProgress } from "@mui/material";
import { LatLngBounds } from "leaflet";
import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
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
  const [open, setOpen] = useState(false);
  const [selectedPlace, selectPlace] = useState<Place | null>(null);
  const map = useMap();

  const dispatch = useAppDispatch();
  const bounds = useAppSelector(selectBounds);
  const position = useAppSelector(selectPosition);
  const { data, isLoading, error } = useGetPlacesQuery(bounds, {
    skip:
      bounds.minLat == 0 &&
      bounds.maxLat == 0 &&
      bounds.minLong == 0 &&
      bounds.maxLong == 0,
  });

  useEffect(() => {
    map.panTo([position.posLat, position.posLong]);
  }, [position.posLat, position.posLong]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    map.on("moveend", () => {
      const b = map.getBounds();
      dispatch(setBounds(getBounds(b)));
    });
  }, []);

  useEffect(() => {
    map.on("resize", () => {
      const b = map.getBounds();
      dispatch(setBounds(getBounds(b)));
    });
  }, []);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{`${error}`}</Alert>;
  }

  if (!data) {
    return null;
  }

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
    </>
  );
}
