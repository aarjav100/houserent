import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Save, Loader2, Sparkles } from 'lucide-react';
import { userService } from '../../services/api';

const WorkplaceSettings = ({ user, onUpdate, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(user?.preferredRadius || 5);
  const [location, setLocation] = useState(user?.workplaceLocation || { 
    address: '', 
    coordinates: [78.9629, 20.5937],
    name: ''
  });
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current && window.L) {
      const coords = location.coordinates && location.coordinates.length === 2 
        ? [location.coordinates[1], location.coordinates[0]] 
        : [20.5937, 78.9629];

      const map = window.L.map(mapRef.current).setView(coords, 13);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const marker = window.L.marker(coords, { draggable: true }).addTo(map);
      
      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        updateLocation(newPos.lat, newPos.lng);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateLocation(lat, lng);
      });

      mapInstance.current = map;
      markerRef.current = marker;
    }
  }, []);

  const updateLocation = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
      const data = await response.json();
      
      setLocation({
        address: data.display_name,
        coordinates: [lng, lat],
        name: data.name || data.address.suburb || data.address.city || 'Office'
      });
    } catch (error) {
      console.error('Geocoding error', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await userService.updateProfile({
        workplaceLocation: {
          lat: location.coordinates[1],
          lng: location.coordinates[0],
          address: location.address,
          name: location.name
        },
        preferredRadius: radius
      });
      onUpdate(updatedUser);
      showToast("Workplace settings saved!");
    } catch (error) {
      showToast("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
          <Navigation size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary">Workplace Discovery</h2>
          <p className="text-primary/50 text-sm">Find homes and food near your office</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary/60 uppercase tracking-widest mb-3">Workplace Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-accent" size={20} />
                <textarea 
                  value={location.address}
                  readOnly
                  className="w-full pl-12 pr-4 py-4 bg-primary/5 rounded-2xl border-none text-sm text-primary font-medium focus:ring-2 focus:ring-accent transition-all min-h-[100px]"
                  placeholder="Click on the map to pin your office..."
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-primary/60 uppercase tracking-widest">Commute Radius</label>
                <span className="text-accent font-black">{radius} km</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="1"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[10px] font-bold text-primary/30 uppercase mt-2">
                <span>1 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
            </div>

            <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10">
              <div className="flex gap-3 items-start">
                <Sparkles className="text-accent shrink-0" size={20} />
                <p className="text-xs text-primary/70 leading-relaxed">
                  Setting your workplace allows us to sort listings by proximity and estimate your daily commute time.
                </p>
              </div>
            </div>
          </div>

          <div className="h-[400px] rounded-3xl overflow-hidden border-2 border-primary/5 relative">
            <div ref={mapRef} className="w-full h-full z-0" />
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-primary/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">Pin Office Location</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Save Workplace Settings
        </button>
      </div>
    </div>
  );
};

export default WorkplaceSettings;
