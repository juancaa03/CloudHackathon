import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icono personalizado para el marcador (opcional)
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';

export default function MapView() {
  const [userLocation, setUserLocation] = useState([41.1189, 1.2445]); // Coordenadas iniciales
  const [userLocationError, setUserLocationError] = useState(null);

  useEffect(() => {
    // Obtener la ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Si la ubicación se obtiene correctamente
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          // Si ocurre un error al obtener la ubicación
          setUserLocationError(error.message);
        }
      );
    } else {
      setUserLocationError("Geolocalización no es soportada en este navegador");
    }
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  return (
    <div style={{ 
        margin: 0, 
        padding: 0, 
        height: "100vh", 
        width: "100vw", 
        overflow: "hidden" 
      }}>
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }} 
        whenCreated={map => map.invalidateSize()} // Ajustar tamaño del mapa al cargarse
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={new Icon({ iconUrl: markerIconUrl, iconSize: [25, 41] })} // Icono personalizado
          >
            <Popup>Tu ubicación actual</Popup>
          </Marker>
        )}
      </MapContainer>
      {userLocationError && <div style={{ position: 'absolute', top: 20, left: 20, color: 'red' }}>Error: {userLocationError}</div>}
    </div>
  );
}
