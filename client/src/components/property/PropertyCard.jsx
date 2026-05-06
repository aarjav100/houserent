import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';

const primaryColor = '#5B4FCF';

const PropertyCard = ({ property, isListView, onSave, isSaved }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/property/${property.id}`)} className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 cursor-pointer overflow-hidden border border-gray-100 ${isListView ? 'flex' : 'flex-col'}`}>
      <div className={`relative ${isListView ? 'w-1/3' : 'w-full h-60'}`}>
        <img 
          src={property.image || (property.images && property.images[0]) || "https://ik.imagekit.io/jain100/default-image.jpg"} 
          alt="Main" 
          className="w-full h-full object-cover" 
          onLoad={() => console.log('Main image loaded:', property.image || (property.images && property.images[0]))}
          onError={(e) => {
            console.error('Main image failed:', property.image || (property.images && property.images[0]));
            e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";
            e.target.onerror = null; 
          }}
        />
        <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">{property.type}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onSave(property.id); }} 
          className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition"
        >
          <Heart size={20} className={isSaved ? "fill-red-500 text-red-500" : "text-gray-500"} />
        </button>
      </div>
      <div className={`p-5 ${isListView ? 'w-2/3 flex flex-col justify-center' : ''}`}>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2"><MapPin size={14}/> {property.location}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
        <div className="text-2xl font-extrabold mb-4" style={{ color: primaryColor }}>₹{property.price.toLocaleString()}{property.listingType === 'Rent' ? '/mo' : ''}</div>
        <div className="flex items-center gap-4 text-gray-500 text-sm border-t pt-4">
          <span className="flex items-center gap-1"><Bed size={16}/> {property.bedrooms} Beds</span>
          <span className="flex items-center gap-1"><Bath size={16}/> {property.bathrooms} Baths</span>
          <span className="flex items-center gap-1"><Square size={16}/> {property.sqft} sqft</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
