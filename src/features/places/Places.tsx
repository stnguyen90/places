import { Alert, CircularProgress } from "@mui/material";
import { LatLngBounds } from "leaflet";
import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetPlacesQuery } from "../../services/appwrite";
import {
  selectBounds,
  selectPosition,
  setBounds,
  setPosition,
} from "./placesSlice";

export function Places() {
  const map = useMap();

  const dispatch = useAppDispatch();
  const bounds = useAppSelector(selectBounds);
  const position = useAppSelector(selectPosition);

  const { data, isLoading, error } = useGetPlacesQuery(bounds);

  useEffect(() => {
    map.panTo([position.posLat, position.posLong]);
  }, [position.posLat, position.posLong]);

  useEffect(() => {
    map.locate().on("locationfound", (e) => {
      dispatch(
        setBounds({
          minLat: e.bounds.getSouth(),
          maxLat: e.bounds.getNorth(),
          minLong: e.bounds.getWest(),
          maxLong: e.bounds.getEast(),
        })
      );
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
    map.on("moveend", (e) => {
      // setBounds(map.getBounds());
      const b = map.getBounds();
      dispatch(
        setBounds({
          minLat: b.getSouth(),
          maxLat: b.getNorth(),
          minLong: b.getWest(),
          maxLong: b.getEast(),
        })
      );
    });
  }, []);

  useEffect(() => {
    map.on("resize", (e) => {
      // setBounds(map.getBounds());
      const b = map.getBounds();
      dispatch(
        setBounds({
          minLat: b.getSouth(),
          maxLat: b.getNorth(),
          minLong: b.getWest(),
          maxLong: b.getEast(),
        })
      );
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
          <Marker key={place.$id} position={[place.latitude, place.longitude]}>
            <Popup>{place.status}</Popup>
          </Marker>
        );
      })}
    </>
  );
}
