import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Asegúrate de que Leaflet esté importado
import 'leaflet-routing-machine'; // Importar Routing Machine
import hombre from './assets/hombre.png'; // Ruta correcta a tu imagen

// Usamos un icono para la ubicación del usuario
const userIcon = new Icon({
  iconUrl: hombre,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Componente para actualizar el mapa cuando la ubicación cambia
function LocationSetter({ location, zoom }) {
  const map = useMap(); // Usamos el hook de React-Leaflet para acceder al mapa

  useEffect(() => {
    // Si la ubicación cambia, ajustamos el centro y el zoom
    map.setView(location, zoom);
  }, [location, zoom, map]);

  return null;
}

export default function MapView() {
  const [userLocation, setUserLocation] = useState([41.1189, 1.2445]);
  const [userLocationError, setUserLocationError] = useState(null);
  const [zoom, setZoom] = useState(13); // Zoom inicial

  useEffect(() => {
    // Obtener la ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setZoom(16); // Ajustar el zoom al obtener la ubicación
        },
        (error) => {
          setUserLocationError(error.message);
        }
      );
    } else {
      setUserLocationError("Geolocalización no es soportada en este navegador");
    }
  }, []); // Solo se ejecuta cuando el componente se monta

  return (
    <div style={{ margin: 0, padding: 0, height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <MapContainer
        center={userLocation}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => map.invalidateSize()} // Ajustar tamaño del mapa cuando se cree
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        <LocationSetter location={userLocation} zoom={zoom} /> {/* Actualizamos el mapa al cambiar la ubicación */}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
        )}
      </MapContainer>
      {userLocationError && <div style={{ position: 'absolute', top: 20, left: 20, color: 'red' }}>Error: {userLocationError}</div>}
    </div>
  );
}
