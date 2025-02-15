import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import hombre from "./assets/hombre.png";
import destinatioon from "./assets/destination.svg";

// Icono del usuario
const userIcon = new L.Icon({
  iconUrl: hombre,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Icono del destino
const destinationIcon = new L.Icon({
  iconUrl: destinatioon,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Componente para manejar la ruta y el zoom del mapa
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

// Simulación de movimiento automático siguiendo la ruta
function useSimulatedMovement(path, setUserLocation) {
  useEffect(() => {
    if (path.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < path.length) {
        setUserLocation([path[index].lat, path[index].lng]);
        index++;
      } else {
        clearInterval(interval); // Detener simulación al final del camino
      }
    }, 1000); // Mueve cada 1 segundo

    return () => clearInterval(interval);
  }, [path, setUserLocation]);
}

export default function MapView() {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState([41.1159, 1.2515]); // Destino de prueba
  const [path, setPath] = useState([]); // Ruta a seguir
  const [autoMove, setAutoMove] = useState(false);

  // Obtener ubicación real del usuario
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

  useSimulatedMovement(autoMove ? path : [], setUserLocation);

  if (!userLocation) {
    return <p>Cargando ubicación...</p>;
  }

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <button
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: "10px 15px",
          fontSize: "16px",
        }}
        onClick={() => setAutoMove(!autoMove)}
      >
        {autoMove ? "Detener simulación" : "Iniciar simulación"}
      </button>

      <MapContainer center={userLocation} zoom={17} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marcador del usuario */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>Tú estás aquí</Popup>
        </Marker>

        {/* Marcador de destino */}
        <Marker position={destination} icon={destinationIcon}>
          <Popup>Destino</Popup>
        </Marker>

        {/* Generar la ruta y capturar el camino */}
        <Routing userLocation={userLocation} destination={destination} setPath={setPath} />
      </MapContainer>
    </div>
  );
}
