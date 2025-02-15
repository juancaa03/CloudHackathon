import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import hombre from './assets/hombre.png';
import destinatioon from './assets/destination.svg';

// Icono del usuario
const userIcon = new L.Icon({
  iconUrl: hombre,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Icono del usuario
const destinationIcon = new L.Icon({
    iconUrl: destinatioon,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

function Routing({ userLocation, destination }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    // Eliminar rutas previas antes de dibujar una nueva
    map.eachLayer((layer) => {
      if (layer._route) map.removeLayer(layer);
    });

    const control = L.Routing.control({
      waypoints: [L.latLng(userLocation), L.latLng(destination)],
      routeWhileDragging: true,
      createMarker: () => null,
      show: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#007bff', weight: 6, opacity: 0.8 }],
      },
    }).addTo(map);

    // Guardamos la referencia de la ruta para poder eliminarla después
    control.getPlan().options.waypoints[0]._route = true;

    return () => map.removeControl(control);
  }, [userLocation, destination, map]);

  return null;
}

export default function MapView() {
  const [userLocation, setUserLocation] = useState([41.1189, 1.2445]); // Tarragona
  const [destination, setDestination] = useState([41.1159, 1.2515]); // Destino de prueba
  const [watchingPosition, setWatchingPosition] = useState(false);

  useEffect(() => {
    if (!watchingPosition) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => console.error("Error obteniendo ubicación:", error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [watchingPosition]);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <button
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, padding: '10px 15px', fontSize: '16px' }}
        onClick={() => setWatchingPosition(!watchingPosition)}
      >
        {watchingPosition ? "Detener seguimiento" : "Iniciar seguimiento"}
      </button>

      <MapContainer center={userLocation} zoom={17} style={{ height: '100%', width: '100%' }}> 
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Marcador del usuario */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>Tú estás aquí</Popup>
        </Marker>

        {/* Marcador de destino */}
        <Marker position={destination} icon={destinationIcon}>
          <Popup>Destino</Popup>
        </Marker>

        {/* Dibujar la ruta */}
        <Routing userLocation={userLocation} destination={destination} />
      </MapContainer>
    </div>
  );
}
