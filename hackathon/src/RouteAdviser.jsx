import useMapData from "./useMapData";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useMap } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import risk from "./assets/peligro.png";
import alert from "./assets/alertaamarilla.png";
import radar from "./assets/radar.png";

// Icons for risk, alert, and radar
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

function Routing({ userLocation, destination, setPath }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    // Eliminar rutas previas antes de dibujar una nueva
    map.eachLayer((layer) => {
      if (layer._route) map.removeLayer(layer);
    });

    const control = L.Routing.control({
      waypoints: [L.latLng(userLocation), L.latLng(destination)],
      routeWhileDragging: false,
      createMarker: () => null,
      show: false, // Ocultar instrucciones
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "#007bff", weight: 6, opacity: 0.8, dashArray: "10, 5" }],
      },
    }).addTo(map);

    control.on("routesfound", (e) => {
      const route = e.routes[0].coordinates; // Extraer coordenadas de la ruta
      setPath(route); // Guardar ruta en estado
    });

    return () => map.removeControl(control);
  }, [userLocation, destination, map, setPath]);

  return null;
}

export default function RouteAdviser() {
  const { userLocation, destination, riskZones, radars } = useMapData();

  if (!userLocation) {
    return <p>Loading location...</p>;
  }

  // Define a threshold for the accident-prone zones
  const threshold = 10; // Change this value as needed

  return (
    <div className="h-full w-full">
      <MapContainer center={userLocation} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />

        {/* Render accident-prone zones */}
        {riskZones.map((zone, index) => {
          // Each zone is expected to be in the format: [[lat, lon], count]
          const [coord, count] = zone;
          // Choose icon based on the accident count
          const icon = count >= threshold ? riskIcon : alertIcon;
          return (
            <Marker key={index} position={coord} icon={icon}>
              <Popup>
                {count >= threshold ? "Accident Risk Zone" : "Accident Alert"} – {count} accidents
              </Popup>
            </Marker>
          );
        })}

        {/* Render radar markers */}
        {radars.map((coord, index) => (
          <Marker key={index} position={coord} icon={radarIcon}>
            <Popup>Radar de velocidad</Popup>
          </Marker>
        ))}
        <Routing userLocation={userLocation} destination={destination} setPath={setPath} />
      </MapContainer>
    </div>
  );
}
