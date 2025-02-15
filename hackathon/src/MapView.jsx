import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import risk from "./assets/peligro.png";
import alert from "./assets/alertaamarilla.png";
import radar from "./assets/radar.png";

// Iconos para riesgo, alerta y radar
const riskIcon = new L.Icon({
  iconUrl: risk,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const alertIcon = new L.Icon({
  iconUrl: alert,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const radarIcon = new L.Icon({
  iconUrl: radar,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function MapView() {
  const [userLocation, setUserLocation] = useState(null);
  const [riskZones, setRiskZones] = useState([]); // Zonas de riesgo de accidentes
  const [radars, setRadars] = useState([]); // Radares

  // Obtener la ubicación real del usuario
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error);
        setUserLocation([41.1189, 1.2445]); // Ubicación por defecto en caso de error
      }
    );
  }, []);

  // Cargar las zonas de riesgo y los radares desde el backend
  useEffect(() => {
    // Cargar zonas de riesgo
    fetch("/riskZones.json")
      .then((response) => response.json())
      .then((data) => setRiskZones(data))
      .catch((error) => console.error("Error obteniendo las zonas de riesgo:", error));

    // Cargar radares
    fetch("/radars.json")
      .then((response) => response.json())
      .then((data) => setRadars(data))
      .catch((error) => console.error("Error obteniendo los radares:", error));
  }, []);

  if (!userLocation) {
    return <p>Cargando ubicación...</p>;
  }

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer center={userLocation} zoom={17} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />

        {/* Agregar los marcadores de las zonas de riesgo */}
        {riskZones.map((zone, index) => {
          const icon = zone.type === "alert" ? alertIcon : riskIcon;
          return (
            <Marker key={index} position={[zone.latitude, zone.longitude]} icon={icon}>
              <Popup>{zone.type === "alert" ? "Alerta de accidente" : "Zona de riesgo de accidentes"}</Popup>
            </Marker>
          );
        })}

        {/* Agregar los marcadores de los radares */}
        {radars.map((radar, index) => (
          <Marker key={index} position={[radar.latitude, radar.longitude]} icon={radarIcon}>
            <Popup>Radar de velocidad</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
