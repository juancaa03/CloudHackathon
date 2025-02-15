import useMapData from "./useMapData";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

export default function MapView() {
  const { userLocation, riskZones, radars } = useMapData();

  if (!userLocation) {
    return <iframe
    src="/loading.html"
    title="Loading"
    style={{ width: "100%", height: "100vh", border: "none" }}
  />;
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
      </MapContainer>
    </div>
  );
}
