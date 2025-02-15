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

const riskIcon = new L.Icon({ iconUrl: risk, iconSize: [30, 30], iconAnchor: [15, 30] });
const alertIcon = new L.Icon({ iconUrl: alert, iconSize: [30, 30], iconAnchor: [15, 30] });
const radarIcon = new L.Icon({ iconUrl: radar, iconSize: [30, 30], iconAnchor: [15, 30] });
const userIcon = new L.Icon({ iconUrl: usuario, iconSize: [30, 30], iconAnchor: [15, 30] });
const destIcon = new L.Icon({ iconUrl: destino, iconSize: [45, 45], iconAnchor: [10, 40] });

function Routing({ userLocation, destination, setRouteInfo }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    map.eachLayer((layer) => {
      if (layer._route) map.removeLayer(layer);
    });

    const control = L.Routing.control({
      waypoints: [L.latLng(userLocation), L.latLng(destination)],
      routeWhileDragging: true,
      createMarker: () => null,
      show: false,
      addWaypoints: false,
      lineOptions: { styles: [{ color: '#007bff', weight: 6, opacity: 0.8 }] },
    }).addTo(map);

    control.on("routesfound", function (e) {
      const route = e.routes[0];
      const distanceKm = (route.summary.totalDistance / 1000).toFixed(1); // Convertir metros a km
      const durationMin = Math.ceil(route.summary.totalTime / 60); // Convertir segundos a minutos
      setRouteInfo({ distanceKm, durationMin });
    });

    return () => map.removeControl(control);
  }, [userLocation, destination, map]);

  return null;
}

export default function RouteAdviser() {
  const { userLocation, riskZones, radars } = useMapData();
  const [destination, setDestination] = useState(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);

  const handleDestinationChange = (e) => {
    setDestinationInput(e.target.value);
  };

  const handleSubmit = () => {
    try {
      const [lat, lon] = destinationInput.split(',').map(coord => parseFloat(coord.trim()));
      if (isNaN(lat) || isNaN(lon)) throw new Error("Las coordenadas no son válidas");
      setDestination([lat, lon]);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    if (!destination) return;
    const interval = setInterval(() => {
      if (userLocation) setDestination(destination);
    }, 2000);

    return () => clearInterval(interval);
  }, [destination, userLocation]);

  if (!userLocation) return <p>Loading location...</p>;

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <MapContainer center={userLocation} zoom={17} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />

        {riskZones.map((zone, index) => {
          const [coord, count] = zone;
          const icon = count >= 10 ? riskIcon : alertIcon;
          return <Marker key={index} position={coord} icon={icon}><Popup>{count >= 10 ? "Accident Risk Zone" : "Accident Alert"} – {count} accidents</Popup></Marker>;
        })}

        {radars.map((coord, index) => (
          <Marker key={index} position={coord} icon={radarIcon}>
            <Popup>Radar de velocidad</Popup>
          </Marker>
        ))}

        <Marker position={userLocation} icon={userIcon}>
          <Popup>Tu ubicación</Popup>
        </Marker>

        {destination && (
          <>
            <Marker position={destination} icon={destIcon}>
              <Popup>Destino</Popup>
            </Marker>
            <Routing userLocation={userLocation} destination={destination} setRouteInfo={setRouteInfo} />
          </>
        )}
      </MapContainer>

      <div style={{
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
      }}>
        {routeInfo && (
          <div style={{
            marginBottom: "10px",
            textAlign: "center",
            fontSize: "14px",
            padding: "5px 10px",
            backgroundColor: "#444",
            borderRadius: "5px"
          }}>
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
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 15px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
          >
            Actualizar Destino
          </button>
        </div>
      </div>
    </div>
  );
}
