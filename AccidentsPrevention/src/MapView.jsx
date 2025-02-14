import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import PropTypes from "prop-types";

// Componente para cambiar la vista del mapa dinámicamente
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

ChangeView.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number.isRequired,
};

const MapView = () => {
  const [position, setPosition] = useState([41.1167, 1.25]); // Coordenadas por defecto (Tarragona)
  const [zoom, setZoom] = useState(13); // Zoom por defecto

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          setPosition([location.coords.latitude, location.coords.longitude]);
          setZoom(15); // Ajusta el zoom al nivel deseado
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    } else {
      console.error("Geolocalización no soportada en este navegador.");
    }
  }, []);

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      style={{ height: "100vh", width: "100%" }}
      attributionControl={false} // Asegura que no haya control de atribución
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={position} zoom={zoom} />
    </MapContainer>
  );
};

export default MapView;
