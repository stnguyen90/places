import React from "react";
import { Fab } from "@mui/material";
import { Marker, useMap } from "react-leaflet";
import { Save, Cancel } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useCreatePlaceMutation } from "../../services/appwrite";
import { selectPosition, setPosition, setIsAdding } from "./placesSlice";

export function AddPlace() {
  const map = useMap();
  const dispatch = useAppDispatch();
  const position = useAppSelector(selectPosition);
  const [createPlace] = useCreatePlaceMutation();

  React.useEffect(() => {
    map.panTo([position.posLat, position.posLong]);
  }, [position.posLat, position.posLong]);

  React.useEffect(() => {
    map.on("move", () => {
      const center = map.getCenter();

      dispatch(
        setPosition({
          posLat: center.lat,
          posLong: center.lng,
        })
      );
    });
  }, []);

  const fabStyle = {
    position: "absolute",
    bottom: 40,
  };

  const cancelFabStyle = {
    ...fabStyle,
    left: 32,
  };

  const handleCancelClick = async () => {
    dispatch(setIsAdding({ isAdding: false }));
  };

  const addFabStyle = {
    ...fabStyle,
    right: 32,
  };

  const handleAddClick = async () => {
    try {
      // wrap around the longitude if too far east or west
      let newLong = position.posLong;
      while (newLong > 180) {
        newLong = newLong - 360;
      }
      while (newLong < -180) {
        newLong = newLong + 360;
      }

      await createPlace({ lat: position.posLat, long: newLong });
      dispatch(setIsAdding({ isAdding: false }));
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Marker position={[position.posLat, position.posLong]}></Marker>

      <Fab
        key="cancel"
        size="large"
        sx={cancelFabStyle}
        color="primary"
        aria-label="cancel"
        onClick={handleCancelClick}
      >
        <Cancel />
      </Fab>
      <Fab
        key="add"
        size="large"
        sx={addFabStyle}
        color="primary"
        aria-label="add"
        onClick={handleAddClick}
      >
        <Save />
      </Fab>
    </>
  );
}
