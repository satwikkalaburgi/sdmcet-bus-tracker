import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Realistic Bus Icon
const busIcon = new L.DivIcon({
  className: 'custom-bus-icon',
  html: `<div style="background-color: #10b981; color: white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); border: 2px solid white; font-size: 20px; transform: translateY(-5px);">🚌</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20]
});

// SDMCET Hubli Coordinates
const DEFAULT_CENTER = [15.4293, 75.0063];

const MapUpdater = ({ selectedBusId, buses }) => {
  const map = useMap();
  const lastFlownBusIdRef = useRef(null);

  useEffect(() => {
    if (selectedBusId) {
      const bus = buses.find(b => b._id === selectedBusId);
      if (bus && bus.currentLocation && bus.currentLocation.lat) {
        if (lastFlownBusIdRef.current !== selectedBusId) {
          map.setView([bus.currentLocation.lat, bus.currentLocation.lng], 15);
          lastFlownBusIdRef.current = selectedBusId;
        }
      }
    } else {
      lastFlownBusIdRef.current = null;
    }
  }, [selectedBusId, buses, map]);
  return null;
};

const LiveMap = ({ buses, routePath, selectedBusId }) => {
  return (
    <MapContainer 
      center={DEFAULT_CENTER} 
      zoom={12} 
      className="w-full h-full rounded-2xl z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      <MapUpdater selectedBusId={selectedBusId} buses={buses} />

      {buses.map((bus) => {
        if (!bus.currentLocation || !bus.currentLocation.lat) return null;

        return (
          <Marker 
            key={bus._id} 
            position={[bus.currentLocation.lat, bus.currentLocation.lng]}
            icon={busIcon}
          >
            <Popup className="glass-popup">
              <div className="font-semibold text-slate-800">{bus.registrationNumber}</div>
              <div className="text-sm text-slate-600">Route: {bus.route?.name}</div>
              <div className="text-xs text-emerald-600 mt-1 font-medium">● Live</div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LiveMap;
