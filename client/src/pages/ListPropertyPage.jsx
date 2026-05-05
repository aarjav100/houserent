import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';
import { propertyService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ListPropertyPage = ({ showToast }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Apartment',
    status: 'For Rent',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    address: {
      fullAddress: '',
      city: '',
      state: '',
      zipCode: ''
    },
    latitude: null,
    longitude: null,
    amenities: [],
    images: []
  });

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (step === 2 && mapRef.current && !mapInstance.current && window.L) {
      const defaultLat = 20.5937; // Center of India
      const defaultLng = 78.9629;
      
      const map = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 5);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng, map);
      });

      mapInstance.current = map;
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [step]);

  const updateLocation = async (lat, lng, map) => {
    // Add/Move Marker
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = window.L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', (event) => {
        const newPos = event.target.getLatLng();
        updateLocation(newPos.lat, newPos.lng, map);
      });
    }

    // Reverse Geocode
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data.address) {
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: {
            fullAddress: data.display_name,
            city: data.address.city || data.address.town || data.address.village || '',
            state: data.address.state || '',
            zipCode: data.address.postcode || ''
          }
        }));
        if (typeof showToast === 'function') {
           showToast(`Location Selected: ${data.address.city || 'Success'}`);
        }
      }
    } catch (error) {
      console.error('Geocoding error', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&countrycodes=in&limit=5`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error', error);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 15);
          updateLocation(latitude, longitude, mapInstance.current);
        }
      }, (error) => {
        showToast("Permission denied for location");
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAmenities = (amenity) => {
    const current = [...formData.amenities];
    if (current.includes(amenity)) {
      setFormData({ ...formData, amenities: current.filter(a => a !== amenity) });
    } else {
      setFormData({ ...formData, amenities: [...current, amenity] });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    setUploading(true);
    try {
      const imageUrl = await propertyService.uploadImage(uploadFormData);
      // Ensure the URL is absolute for the image preview
      const fullUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${import.meta.env.VITE_API_URL.replace('/api', '')}${imageUrl}`;
        
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, fullUrl]
      }));
      if (typeof showToast === 'function') {
        showToast("Image uploaded successfully!");
      }
    } catch (error) {
      console.error('Upload Error:', error);
      if (typeof showToast === 'function') {
        showToast("Failed to upload image");
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  const handlePayment = async () => {
    try {
      const order = await paymentService.createOrder();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'your_razorpay_key_id',
        amount: order.amount,
        currency: order.currency,
        name: "HouseHunt",
        description: "Listing Fee for Property",
        order_id: order.id,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Proceed to final submission
            await finalSubmit();
          } catch (err) {
            showToast("Payment verification failed");
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: { color: "#5B4FCF" },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment Error:', error);
      showToast("Failed to initiate payment");
      setLoading(false);
    }
  };

  const finalSubmit = async () => {
    try {
      const formattedData = {
        ...formData,
        description: formData.description || `Beautiful ${formData.type} in ${formData.address.city}`,
        type: formData.type.toLowerCase(),
        status: formData.status.toLowerCase().replace(' ', '-'),
        latitude: formData.latitude,
        longitude: formData.longitude,
        images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6']
      };
      
      await propertyService.create(formattedData);
      showToast("Property listed successfully!");
      navigate('/dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || error.message || "Failed to list property");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login to list a property");
      navigate('/login');
      return;
    }

    setLoading(true);
    
    // Check if payment is needed (listingCount > 0)
    if (user.listingCount > 0) {
      await handlePayment();
    } else {
      await finalSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">List Your Property</h1>
        <p className="text-gray-500 mb-4">Reach thousands of potential renters and buyers</p>
        
        {user?.listingCount === 0 ? (
          <div className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100">
            ✨ Your first listing is FREE!
          </div>
        ) : (
          <div className="inline-block px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold border border-amber-100">
            💰 Listing Fee: ₹10 (Subsequent Listing)
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8">
           {[1,2,3].map(s => (
             <div key={s} className="flex flex-col items-center gap-2">
               <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step >= s ? 'bg-[#5B4FCF] border-[#5B4FCF] text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-200 text-gray-400'}`}>
                 {step > s ? <Check size={20}/> : s}
               </div>
               <span className={`text-xs font-bold ${step >= s ? 'text-[#5B4FCF]' : 'text-gray-400'}`}>
                 {s === 1 ? 'Basic Info' : s === 2 ? 'Location' : 'Amenities'}
               </span>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-6">Property Basics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Property Title</label>
                  <input name="title" type="text" value={formData.title} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all" placeholder="e.g. Modern 3BHK Apartment with Sea View" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Property Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all">
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Listing Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all">
                    <option value="For Rent">For Rent</option>
                    <option value="For Sale">For Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (₹)</label>
                  <input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all" placeholder="e.g. 45000" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Area (sqft)</label>
                  <input name="area" type="number" value={formData.area} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all" placeholder="e.g. 1200" required/>
                </div>
              </div>
              <div className="flex justify-end pt-8">
                <button type="button" onClick={()=>setStep(2)} className="px-10 py-4 bg-[#5B4FCF] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#4a3fb3] transition shadow-lg shadow-indigo-100">
                  Next Step <ArrowRight size={20}/>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-4">Select Location on Map</h2>
              
              {/* Search & Locate Bar */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF]" 
                    placeholder="Search city or area in India..."
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl z-50 overflow-hidden">
                      {searchResults.map((res, i) => (
                        <div 
                          key={i} 
                          onClick={() => {
                            const lat = parseFloat(res.lat);
                            const lon = parseFloat(res.lon);
                            mapInstance.current.setView([lat, lon], 15);
                            updateLocation(lat, lon, mapInstance.current);
                            setSearchResults([]);
                            setSearchQuery(res.display_name);
                          }}
                          className="p-3 hover:bg-indigo-50 cursor-pointer text-sm border-b last:border-0 border-gray-100"
                        >
                          {res.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" onClick={handleSearch} className="px-6 bg-[#5B4FCF] text-white rounded-xl font-bold hover:bg-[#4a3fb3]">Search</button>
                <button type="button" onClick={useCurrentLocation} className="px-6 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600">Locate Me</button>
              </div>

              <div ref={mapRef} className="w-full h-80 rounded-2xl border-2 border-gray-100 shadow-inner mb-8 z-0"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Verified Address (Fetched from Map)</label>
                  <input name="address.fullAddress" type="text" readOnly value={formData.address.fullAddress} className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 outline-none text-gray-600 italic" placeholder="Click on map to set address..." required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">City</label>
                  <input name="address.city" type="text" value={formData.address.city} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">State</label>
                  <input name="address.state" type="text" value={formData.address.state} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bedrooms</label>
                  <input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bathrooms</label>
                  <input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all" required/>
                </div>
              </div>
              <div className="flex justify-between pt-8">
                <button type="button" onClick={()=>setStep(1)} className="px-10 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-200 transition">
                  <ArrowLeft size={20}/> Back
                </button>
                <button type="button" onClick={()=>{
                  if (!formData.latitude) {
                    showToast("Please pin your location on the map first!");
                    return;
                  }
                  setStep(3);
                }} className="px-10 py-4 bg-[#5B4FCF] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#4a3fb3] transition shadow-lg shadow-indigo-100">
                  Next Step <ArrowRight size={20}/>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-6">Amenities & Images</h2>
              
              <label className="block text-sm font-semibold mb-4">Select Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {['Wifi', 'Parking', 'Pool', 'Gym', 'Security', 'AC', 'Elevator', 'Garden'].map(a => (
                  <button 
                    key={a}
                    type="button"
                    onClick={() => handleAmenities(a)}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${formData.amenities.includes(a) ? 'bg-indigo-50 border-[#5B4FCF] text-[#5B4FCF]' : 'bg-white border-gray-100 text-gray-500'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    <img src={img} alt="Property" className="w-full h-full object-cover rounded-2xl border" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14}/>
                    </button>
                  </div>
                ))}
              </div>

              <div 
                onClick={() => document.getElementById('imageInput').click()}
                className="p-10 border-2 border-dashed border-[#5B4FCF] bg-indigo-50 rounded-3xl text-center group cursor-pointer hover:bg-indigo-100 transition-all"
              >
                 <input 
                   id="imageInput"
                   type="file" 
                   className="hidden" 
                   accept="image/*"
                   onChange={handleImageUpload}
                 />
                 <div className="flex flex-col items-center">
                    {uploading ? (
                      <Loader2 className="animate-spin text-[#5B4FCF]" size={32}/>
                    ) : (
                      <div className="p-4 bg-white rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform"><Upload className="text-[#5B4FCF]" size={32}/></div>
                    )}
                    <div className="text-[#5B4FCF] font-bold text-lg mb-1">
                      {uploading ? 'Uploading...' : 'Upload Property Photos'}
                    </div>
                    <div className="text-sm text-gray-500">Click to select an image from your device</div>
                 </div>
              </div>

              <div className="flex justify-between pt-10">
                <button type="button" onClick={()=>setStep(2)} className="px-10 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-200 transition">
                  <ArrowLeft size={20}/> Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-12 py-4 bg-green-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition shadow-lg shadow-green-100 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>List Property Now <Check size={20}/></>}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ListPropertyPage;
