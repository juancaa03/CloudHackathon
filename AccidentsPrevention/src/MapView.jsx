import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView() {
  return (
    <div style={{ 
        margin: 0, 
        padding: 0, 
        height: "100vh",
        width: "100%",
        overflow: "hidden"
      }}>
        <MapContainer center={[41.1189, 1.2445]} zoom={13} style={{ height: "100vh", width: "100vw" }}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>
    </div>
  );
}
