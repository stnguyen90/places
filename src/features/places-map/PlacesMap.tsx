import { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useAppSelector } from "../../app/hooks";
import { Places } from "../places/Places";
import { placesSlice, selectPosition } from "../places/placesSlice";

export function PlacesMap() {
  const { posLat, posLong } = placesSlice.getInitialState();

  return (
    <MapContainer
      center={[posLat, posLong]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ display: "flex", flex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Places />
    </MapContainer>
  );
}
