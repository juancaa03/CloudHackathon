import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import risk from "./assets/peligro.png";
import alert from "./assets/alertaamarilla.png";
import radar from "./assets/radar.png";
import usuario from "./assets/user_location.png";
import destino from "./assets/pin-de-destino.png";
import "./bodyMargin.css";
import useMapData from "./useMapData";
import alertSound from "./assets/simple-notification.mp3";

const riskIcon = new L.Icon({ iconUrl: risk, iconSize: [30, 30], iconAnchor: [15, 30] });
const alertIcon = new L.Icon({ iconUrl: alert, iconSize: [30, 30], iconAnchor: [15, 30] });
const radarIcon = new L.Icon({ iconUrl: radar, iconSize: [30, 30], iconAnchor: [15, 30] });
const userIcon = new L.Icon({ iconUrl: usuario, iconSize: [30, 30], iconAnchor: [15, 30] });
const destIcon = new L.Icon({ iconUrl: destino, iconSize: [45, 45], iconAnchor: [10, 40] });

/**
 * Este componente centra el mapa (con setView) cada vez que 'center' cambia.
 */
function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function Routing({ userLocation, destination, setRouteInfo }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    // Se eliminan rutas previas, si las hay
    map.eachLayer((layer) => {
      if (layer._route) map.removeLayer(layer);
    });

    const control = L.Routing.control({
      waypoints: [L.latLng(userLocation), L.latLng(destination)],
      routeWhileDragging: true,
      createMarker: () => null,
      show: false,
      addWaypoints: false,
      lineOptions: { styles: [{ color: "#007bff", weight: 6, opacity: 0.8 }] },
    }).addTo(map);

    control.on("routesfound", function (e) {
      const route = e.routes[0];
      const distanceKm = (route.summary.totalDistance / 1000).toFixed(1);
      const durationMin = Math.ceil(route.summary.totalTime / 60);
      setRouteInfo({ distanceKm, durationMin });
    });

    return () => map.removeControl(control);
  }, [userLocation, destination, map]);

  return null;
}

export default function RouteAdviser() {
  // Obtenemos datos: userLocation, riskZones, radars desde nuestro hook
  let { userLocation, riskZones, radars } = useMapData();
  const [destination, setDestination] = useState(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  // Estado para la ubicación simulada (por ejemplo, cuando se teletransporta)
  const [simulatedLocation, setSimulatedLocation] = useState(null);

  // Usamos la ubicación simulada si existe; si no, la real proveniente de useMapData
  const effectiveUserLocation = simulatedLocation || userLocation;

  const handleDestinationChange = (e) => {
    setDestinationInput(e.target.value);
  };

  const handleSubmit = () => {
    try {
      const [lat, lon] = destinationInput.split(",").map((coord) => parseFloat(coord.trim()));
      if (isNaN(lat) || isNaN(lon)) throw new Error("Las coordenadas no son válidas");
      setDestination([lat, lon]);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Función para "teletransportar" al usuario a la primera zona de riesgo (o a un punto fijo de prueba)
  const teleportToRiskZone = () => {
    if (riskZones.length === 0) return;
    const randomIndex = Math.floor(Math.random() * riskZones.length);
    // Usa la coordenada de la zona de riesgo seleccionada aleatoriamente
    const riskCoord = riskZones[randomIndex][0];
    setSimulatedLocation(riskCoord);
    console.log("Teletransportado a zona de riesgo:", riskCoord);
  };

  // Este efecto se encarga de reproducir la alerta cuando el usuario (o su simulación)
  // esté a menos de 10 metros de una zona de riesgo.
  useEffect(() => {
    if (!effectiveUserLocation || riskZones.length === 0) return;
    const alertDistance = 1000; // en metros
    riskZones.forEach(([coord]) => {
      const distance = L.latLng(effectiveUserLocation).distanceTo(L.latLng(coord));
      console.log("Distancia a zona de riesgo:", distance, "metros");
      if (distance < alertDistance) {
        const audio = new Audio(alertSound);
        audio.play().catch((err) => console.error("Error al reproducir el audio:", err));
      }
    });
  }, [effectiveUserLocation, riskZones]);

  // (Opcional) Si necesitas actualizar la ruta periódicamente, este efecto se encarga de ello.
  useEffect(() => {
    if (!destination) return;
    const interval = setInterval(() => {
      if (effectiveUserLocation) setDestination(destination);
    }, 2000);
    return () => clearInterval(interval);
  }, [destination, effectiveUserLocation]);

  if (!userLocation) return <p>Loading location...</p>;

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <MapContainer center={effectiveUserLocation} zoom={17} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />

        {/* Este componente centra el mapa cada vez que effectiveUserLocation cambie */}
        <MapCenter center={effectiveUserLocation} />

        {riskZones.map((zone, index) => {
          const [coord, count] = zone;
          const icon = count >= 10 ? riskIcon : alertIcon;
          return (
            <Marker key={index} position={coord} icon={icon}>
              <Popup>{count >= 10 ? "Accident Risk Zone" : "Accident Alert"} – {count} accidents</Popup>
            </Marker>
          );
        })}

        {radars.map((coord, index) => (
          <Marker key={index} position={coord} icon={radarIcon}>
            <Popup>Radar de velocidad</Popup>
          </Marker>
        ))}

        <Marker position={effectiveUserLocation} icon={userIcon}>
          <Popup>Tu ubicación</Popup>
        </Marker>

        {destination && (
          <>
            <Marker position={destination} icon={destIcon}>
              <Popup>Destino</Popup>
            </Marker>
            <Routing userLocation={effectiveUserLocation} destination={destination} setRouteInfo={setRouteInfo} />
          </>
        )}
      </MapContainer>

      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "#333",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {routeInfo && (
          <div
            style={{
              marginBottom: "10px",
              textAlign: "center",
              fontSize: "14px",
              padding: "5px 10px",
              backgroundColor: "#444",
              borderRadius: "5px",
            }}
          >
            ⏱ {routeInfo.durationMin} min  | 📍 {routeInfo.distanceKm} km
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="text"
            value={destinationInput}
            onChange={handleDestinationChange}
            placeholder="Introduce destino (lat, lon)"
            style={{
              padding: "10px",
              width: "200px",
              marginRight: "10px",
              border: "1px solid #444",
              borderRadius: "5px",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "#555",
              color: "white",
            }}
          />
          <button onClick={handleSubmit} style={{ padding: "10px 15px", backgroundColor: "#007bff", color: "#fff" }}>
            Actualizar Destino
          </button>
        </div>
        {/* Botón extra para teletransportar al usuario a una zona de riesgo */}
        <button
          onClick={teleportToRiskZone}
          style={{ padding: "10px 15px", backgroundColor: "#28a745", color: "#fff", marginTop: "10px" }}
        >
          Teletransportar a zona de riesgo
        </button>
      </div>
    </div>
  );
}
