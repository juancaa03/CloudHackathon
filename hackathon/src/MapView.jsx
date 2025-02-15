import { useState, useEffect } from "react";
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
  const [userLocation, setUserLocation] = useState(null);
  const [riskZones, setRiskZones] = useState([]); // Expected format: [[[lat, lon], count], ...]
  const [radars, setRadars] = useState([]); // Expected format: [[lat, lon], ...]
  const [fatality, setPercent] = useState(null);
  const [deaths, setDeaths] = useState([]);
  let riskAccidents = 0;

  // Obtain the real user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Error obtaining location:", error);
        setUserLocation([41.1189, 1.2445]); // Default location if error occurs
      }
    );
  }, []);

  // Load risk zones and radar coordinates from the backend
  useEffect(() => {
    // Fetch percentage of fatal accidents
    fetch("http://localhost:8000/percentFatality")
      .then((response) => response.json())
      .then((data) => setPercent(data))
      .catch((error) => console.error("Error obtaining fatality percentage:", error));

    // Fetch number of deaths and accident count  
    fetch("http://localhost:8000/deathCount")
      .then((response) => response.json())
      .then((data) => setDeaths(data))
      .catch((error) => console.error("Error obtaining death count:", error));

    // Fetch accident-prone zones
    fetch("http://localhost:8000/hotZones")
      .then((response) => response.json())
      .then((data) => setRiskZones(data))
      .catch((error) => console.error("Error obtaining risk zones:", error));

    // Fetch radar coordinates (each as [lat, lon])
    fetch("http://localhost:8000/radarList")
      .then((response) => response.json())
      .then((data) => setRadars(data))
      .catch((error) => console.error("Error obtaining radars:", error));
  }, []);

  if (!userLocation) {
    return <p>Loading location...</p>;
  }

  // Define a threshold for the accident-prone zones
  const threshold = 10; // Change this value as needed

  console.log(fatality + "%")// Percentage of fatal accidents, change use as needed
  console.log(deaths[0] + " - " + deaths[1])// Number of deaths and number of accidents
  for(let i = 0; i < riskZones.length; i++){
    riskAccidents += riskZones[i][1]
  }
  console.log(riskAccidents)

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer center={userLocation} zoom={17} style={{ height: "100%", width: "100%" }}>
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
