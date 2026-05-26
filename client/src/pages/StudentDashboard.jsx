import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Clock, Map as MapIcon, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import LiveMap from '../components/LiveMap';

const API_BASE = localStorage.getItem('custom_api_base') || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;

const getNearestCheckpointName = (lat, lng, route) => {
  if (!lat || !lng) {
    return route?.stops?.[0]?.name || 'Starting Stop';
  }

  const landmarks = [
    { name: 'Siddharoodha Math / CBT', lat: 15.3340, lng: 75.1460 },
    { name: 'Keshwapur / Sub-Jail', lat: 15.3580, lng: 75.1520 },
    { name: 'Unkal Lake / Unkal Cross', lat: 15.3712, lng: 75.1221 },
    { name: 'Bairidevarakoppa / APMC', lat: 15.3850, lng: 75.1050 },
    { name: 'Navanagar / Income Tax', lat: 15.3990, lng: 75.0800 },
    { name: 'Rayapur / Sattur / SDM Medical', lat: 15.4180, lng: 75.0350 },
    { name: 'SDMCET Dharwad (Campus)', lat: 15.4293, lng: 75.0063 }
  ];

  let minDistance = Infinity;
  let nearestName = 'On Route';

  landmarks.forEach(lm => {
    const dLat = lm.lat - lat;
    const dLng = lm.lng - lng;
    const distance = dLat * dLat + dLng * dLng;
    if (distance < minDistance) {
      minDistance = distance;
      nearestName = lm.name;
    }
  });

  return nearestName;
};

const StudentDashboard = ({ user, onLogout }) => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedBusId, setSelectedBusId] = useState(null);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [busRes, routeRes] = await Promise.all([
          axios.get(`${API_BASE}/api/buses`, { headers }),
          axios.get(`${API_BASE}/api/routes`, { headers })
        ]);
        setBuses(busRes.data);
        setRoutes(routeRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };

    fetchInitialData();

    // Socket Connection
    const socket = io(API_BASE);
    socket.on('busLocationUpdated', (data) => {
      setBuses((prevBuses) => prevBuses.map(bus => 
        bus._id === data.busId 
          ? { ...bus, status: 'active', currentLocation: { lat: data.lat, lng: data.lng, updatedAt: new Date() } }
          : bus
      ));
    });

    return () => socket.disconnect();
  }, []);

  const activeBuses = buses.filter(b => b.status === 'active' && (!selectedRoute || b.route?._id === selectedRoute));

  let routePathToDisplay = [];
  if (selectedRoute) {
    const routeObj = routes.find(r => r._id === selectedRoute);
    if (routeObj && routeObj.optimizedPath) {
      routePathToDisplay = routeObj.optimizedPath.map(p => [p.lat, p.lng]);
    }
  } else if (selectedBusId) {
    const busObj = activeBuses.find(b => b._id === selectedBusId);
    if (busObj && busObj.route) {
      const routeObj = routes.find(r => r._id === busObj.route._id);
      if (routeObj && routeObj.optimizedPath) {
        routePathToDisplay = routeObj.optimizedPath.map(p => [p.lat, p.lng]);
      }
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="flex flex-col md:flex-row flex-1 md:p-4 gap-4 h-[calc(100vh-100px)] relative overflow-hidden">
        
        {/* Info Panel Overlay Container */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 z-10 pointer-events-none md:h-full h-auto absolute md:relative inset-x-0 bottom-4 top-4 md:inset-auto px-4 md:px-0 justify-between md:justify-start">
          
          {/* Route Selector (Floats at the top on mobile) */}
          <div className="glass-card p-4 md:p-6 pointer-events-auto md:relative absolute top-0 left-4 right-4 md:inset-auto shadow-2xl">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <MapIcon className="text-indigo-400" size={18} /> Track Your Bus
            </h2>
            
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Route</label>
            <select 
              className="glass-input w-full appearance-none py-2 text-sm"
              value={selectedRoute}
              onChange={(e) => {
                setSelectedRoute(e.target.value);
                setSelectedBusId(null);
              }}
            >
              <option value="" className="text-slate-800">All Routes</option>
              {routes.map(r => (
                <option key={r._id} value={r._id} className="text-slate-800">{r.name}</option>
              ))}
            </select>
          </div>

          {/* Active Buses (Floats at the bottom on mobile) */}
          <div className="glass-card p-4 md:p-6 pointer-events-auto md:relative absolute bottom-0 left-4 right-4 md:inset-auto max-h-[35vh] md:max-h-none overflow-y-auto flex-1 flex flex-col shadow-2xl md:mt-4">
            <h3 className="text-md md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2 sticky top-0 bg-slate-900/10 backdrop-blur-md py-1 z-10">
              <Clock className="text-emerald-400" size={18} /> Active Buses
            </h3>
            
            {activeBuses.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-400 py-6 text-center opacity-70">
                <Info size={24} className="mb-2" />
                <p className="text-sm">No active buses on this route.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {activeBuses.map(bus => (
                  <div key={bus._id} className="flex flex-col gap-2">
                    <div 
                      onClick={() => setSelectedBusId(bus._id)}
                      className={`p-3 md:p-4 rounded-xl border transition-all cursor-pointer shadow-lg ${
                        selectedBusId === bus._id 
                          ? 'bg-indigo-500/20 border-indigo-400/50 ring-1 ring-indigo-400' 
                          : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/60 hover:border-slate-500/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-md text-white">{bus.registrationNumber}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-indicator"></span> Live
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 truncate">{bus.route?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full-Screen Map (Occupies entire background on mobile) */}
        <div className="w-full h-full md:w-2/3 glass-card md:p-2 absolute md:relative inset-0 z-0 border-none md:border md:border-slate-800">
          <LiveMap buses={activeBuses} selectedBusId={selectedBusId} routePath={routePathToDisplay} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
