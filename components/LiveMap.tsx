'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix broken Leaflet marker icons in Next.js/Webpack
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl, iconRetinaUrl, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Auto-center map when user moves
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center, map]);
  return null;
}

export default function LiveMap({ members, myId }: { members: any[], myId: string }) {
  const me = members.find(m => m.id === myId) || members[0] || { latitude: 20, longitude: 78 };
  
  return (
    <div className="h-[60vh] w-full rounded-xl overflow-hidden shadow-lg border border-base-300 z-0">
      <MapContainer center={[me.latitude, me.longitude]} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer 
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={[me.latitude, me.longitude]} />

        {members.map((m) => (
          <Marker 
            key={m.id} 
            position={[m.latitude, m.longitude]} 
            icon={defaultIcon}
            opacity={m.id === myId ? 1 : 0.7}
          >
            <Popup>
              <strong>{m.name}</strong> {m.id === myId ? "(You)" : ""}
              <br/>
              <span className="text-xs text-gray-500">
                Seen: {new Date(m.lastSeen).toLocaleTimeString()}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}