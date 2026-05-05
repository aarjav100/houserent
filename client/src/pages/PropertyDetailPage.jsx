import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Phone, Mail, Loader2 } from 'lucide-react';
import { propertyService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const primaryColor = '#5B4FCF';

const PropertyDetailPage = ({ onSave, savedProperties }) => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getById(id);
      setProperty(data);
    } catch (error) {
      console.error('Failed to fetch property details', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#5B4FCF] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading property details...</p>
      </div>
    );
  }

  if (!property) return <div className="text-center py-20 text-2xl font-bold">Property Not Found</div>;

  const isSaved = savedProperties.includes(property._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 h-[500px]">
        <div className="md:col-span-3 rounded-2xl overflow-hidden shadow-sm relative">
          <img src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} alt="Main" className="w-full h-full object-cover" />
          <button onClick={() => onSave(property._id)} className="absolute top-6 right-6 p-4 bg-white/90 rounded-full shadow-lg hover:bg-white transition">
            <Heart size={24} className={isSaved ? "fill-red-500 text-red-500" : "text-gray-500"} />
          </button>
        </div>
        <div className="hidden md:flex flex-col gap-4 h-full">
          {property.images.slice(1,3).map((img, i) => (
            <div key={i} className="flex-1 rounded-2xl overflow-hidden shadow-sm"><img src={img} alt="Thumb" className="w-full h-full object-cover" /></div>
          ))}
          {property.images.length < 2 && (
            <div className="flex-1 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">No more images</div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <span className="bg-indigo-100 text-[#5B4FCF] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-4 inline-block">{property.type} • {property.status}</span>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{property.title}</h1>
            <div className="flex items-center text-gray-500 gap-2"><MapPin/> {property.address.fullAddress}, {property.address.city}</div>
          </div>

          <div className="flex flex-wrap gap-6 py-6 border-y border-gray-100 mb-8">
             <div className="flex items-center gap-3"><div className="p-3 bg-gray-50 rounded-xl"><Bed className="text-[#5B4FCF]"/></div><div><div className="text-sm text-gray-500">Bedrooms</div><div className="font-bold">{property.bedrooms}</div></div></div>
             <div className="flex items-center gap-3"><div className="p-3 bg-gray-50 rounded-xl"><Bath className="text-[#5B4FCF]"/></div><div><div className="text-sm text-gray-500">Bathrooms</div><div className="font-bold">{property.bathrooms}</div></div></div>
             <div className="flex items-center gap-3"><div className="p-3 bg-gray-50 rounded-xl"><Square className="text-[#5B4FCF]"/></div><div><div className="text-sm text-gray-500">Area</div><div className="font-bold">{property.area} sqft</div></div></div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="text-gray-600 leading-relaxed mb-8">{property.description}</p>

          <h2 className="text-2xl font-bold mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {property.amenities.map(a => (
              <span key={a} className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 font-medium">{a}</span>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">Location</h2>
          <div className="w-full h-80 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
             <MapPin size={48} className="text-[#5B4FCF] opacity-50 mb-4" />
             <p className="text-gray-500 font-medium">Map View for {property.address.city}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <div className="text-sm text-gray-500 mb-1">{property.status === 'For Rent' ? 'Rent Price' : 'Asking Price'}</div>
            <div className="text-4xl font-extrabold mb-8" style={{ color: primaryColor }}>₹{property.price.toLocaleString()}{property.status === 'For Rent' ? <span className="text-lg text-gray-500 font-normal">/month</span> : ''}</div>
            
            <div className="flex items-center gap-4 py-6 border-t border-gray-100 mt-2 border-b mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-[#5B4FCF]">
                {property.owner?.name?.charAt(0) || 'O'}
              </div>
              <div>
                <h4 className="font-bold text-lg">{property.owner?.name || 'Property Owner'}</h4>
                <p className="text-gray-500 text-sm">Member since 2024</p>
              </div>
            </div>

            <button className="w-full py-4 rounded-xl text-white font-bold mb-4 flex items-center justify-center gap-2 transition hover:opacity-90" style={{ backgroundColor: primaryColor }}><Phone size={20}/> Call {property.owner?.phone || 'Contact Info'}</button>
            <button className="w-full py-4 rounded-xl border-2 border-[#5B4FCF] text-[#5B4FCF] font-bold flex items-center justify-center gap-2 hover:bg-indigo-50"><Mail size={20}/> Send Message</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
