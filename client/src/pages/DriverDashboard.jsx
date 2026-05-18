import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Play, Square, Navigation, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';

const API_BASE = `http://${window.location.hostname}:5000`;

const DriverDashboard = ({ user, onLogout }) => {
  const [buses, setBuses] = useState([]);
  const [assignedBus, setAssignedBus] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const broadcastIntervalRef = useRef(null);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_BASE}/api/buses`, { headers });
        const myBus = res.data.find(b => b.driver?._id === user.id);
        setBuses(res.data);
        setAssignedBus(myBus);
        if (myBus && myBus.status === 'active') {
          setIsBroadcasting(true);
          startTracking(myBus);
        }
      } catch (err) {
        console.error('Failed to fetch bus data', err);
      }
    };

    fetchBus();

    socketRef.current = io(API_BASE);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    };
  }, [user.id]);

  const updateBusStatus = async (status) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_BASE}/api/buses/${assignedBus._id}/status`, { status }, { headers });
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const startTracking = (bus) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    const updateLocation = (position) => {
      const { latitude, longitude } = position.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });
      
      socketRef.current.emit('driverLocationUpdate', {
        busId: bus._id,
        routeId: bus.route?._id || bus.route,
        driverId: user.id,
        lat: latitude,
        lng: longitude
      });
    };

    // Immediate initial update
    navigator.geolocation.getCurrentPosition(updateLocation, null, { enableHighAccuracy: true });

    // Active watch position updates instantly on physical movement
    watchIdRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      (error) => {
        console.error('Error getting physical GPS location:', error);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    // Continuous 1000ms high-frequency heartbeat updates
    broadcastIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        updateLocation,
        (error) => console.error('Continuous fetch error:', error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }, 1000);
  };

  const handleStartTrip = async () => {
    if (!assignedBus) return;
    setIsBroadcasting(true);
    await updateBusStatus('active');
    startTracking(assignedBus);
  };

  const handleStopTrip = async () => {
    setIsBroadcasting(false);
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (broadcastIntervalRef.current) {
      clearInterval(broadcastIntervalRef.current);
      broadcastIntervalRef.current = null;
    }
    if (assignedBus) {
      await updateBusStatus('idle');
    }
  };

  if (!assignedBus) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-card p-8 text-center max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">No Bus Assigned</h2>
            <p className="text-slate-400">Please contact the administrator to assign a bus to your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 h-[calc(100vh-100px)]">
        <div className="glass-card p-8 max-w-md w-full relative overflow-hidden text-center">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{assignedBus.registrationNumber}</h2>
            <p className="text-indigo-400 font-medium">Route: {assignedBus.route?.name || 'Unassigned'}</p>
          </div>

          <div className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center mb-8 transition-all duration-500 shadow-2xl ${isBroadcasting ? 'bg-emerald-500/20 border-4 border-emerald-500 live-indicator' : 'bg-slate-700/50 border-4 border-slate-600'}`}>
            <Navigation size={64} className={`transition-all ${isBroadcasting ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
          </div>

          {currentLocation && isBroadcasting && (
            <div className="bg-slate-900/50 rounded-xl p-4 mb-8 flex items-center justify-center gap-2 border border-slate-700">
              <MapPin size={18} className="text-indigo-400" />
              <span className="text-sm font-mono text-slate-300">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </span>
            </div>
          )}

          {!isBroadcasting ? (
            <button 
              onClick={handleStartTrip}
              className="w-full btn-primary text-lg py-4"
            >
              <Play size={24} /> Start Trip
            </button>
          ) : (
            <button 
              onClick={handleStopTrip}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-red-500/25 active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              <Square size={24} /> End Trip
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
