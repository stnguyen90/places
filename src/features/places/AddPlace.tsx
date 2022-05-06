import { Fab } from "@mui/material";
import { LatLngBounds } from "leaflet";
import { useEffect } from "react";
import { Marker, useMap } from "react-leaflet";
import { AddLocation, Cancel } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useCreatePlaceMutation } from "../../services/appwrite";
import { selectPosition, setPosition, setIsAdding } from "./placesSlice";

const getBounds = (b: LatLngBounds) => {
  return {
    minLat: b.getSouth(),
    maxLat: b.getNorth(),
    minLong: b.getWest(),
    maxLong: b.getEast(),
  };
};

export function AddPlace() {
  const map = useMap();
  const dispatch = useAppDispatch();
  const position = useAppSelector(selectPosition);
  const [createPlace] = useCreatePlaceMutation();

  useEffect(() => {
    map.panTo([position.posLat, position.posLong]);
  }, [position.posLat, position.posLong]);

  useEffect(() => {
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
      await createPlace({ lat: position.posLat, long: position.posLong });
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
        <AddLocation />
      </Fab>
    </>
  );
}
