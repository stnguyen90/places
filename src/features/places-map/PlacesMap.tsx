import { MapContainer, TileLayer } from "react-leaflet";
import { useAppSelector } from "../../app/hooks";
import { AddPlace } from "../places/AddPlace";
import { Places } from "../places/Places";
import { placesSlice, selectIsAdding } from "../places/placesSlice";

export function PlacesMap() {
  const { posLat, posLong } = placesSlice.getInitialState();
  const isAdding = useAppSelector(selectIsAdding);

  return (
    <MapContainer
      center={[posLat, posLong]}
      zoom={13}
      scrollWheelZoom={false}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {isAdding ? <AddPlace /> : <Places />}
    </MapContainer>
  );
}
