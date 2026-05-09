import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, ChevronRight, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const PropertyCard = ({ property, isListView, onSave, isSaved }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => navigate(`/property/${property.id}`)} 
      className={`bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 cursor-pointer overflow-hidden border border-accent/5 group ${isListView ? 'flex' : 'flex-col'}`}
    >
      <div className={`relative overflow-hidden ${isListView ? 'w-1/3' : 'w-full h-64'}`}>
        <img 
          src={property.image || (property.images && property.images[0]) || "https://ik.imagekit.io/jain100/default-image.jpg"} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <span className="absolute top-4 left-4 glass text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{property.type}</span>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onSave(property.id); }} 
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-lg active:scale-90"
        >
          <Heart size={18} className={isSaved ? "fill-red-500 text-red-500" : "text-primary/40"} />
        </button>
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
           <span className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-accent/20">
             {property.listingType === 'Rent' ? 'Featured' : 'For Sale'}
           </span>
        </div>
      </div>

      <div className={`p-6 ${isListView ? 'w-2/3 flex flex-col justify-center' : ''}`}>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-accent font-bold text-[10px] uppercase tracking-widest">
            <MapPin size={14}/> {property.location}
          </div>
          {property.distanceFromWorkplace && (
            <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              <Navigation size={12}/> {property.distanceFromWorkplace} km from office
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-serif font-extrabold text-primary mb-2 line-clamp-1 group-hover:text-accent transition-colors">
          {property.title}
        </h3>
        
        <div className="flex items-end gap-1 mb-6">
          <span className="text-2xl font-black text-primary">₹{property.price.toLocaleString()}</span>
          {property.listingType === 'Rent' && <span className="text-primary/40 text-sm font-bold pb-1">/ month</span>}
        </div>
        
        <div className="flex items-center justify-between text-primary/60 text-xs font-bold border-t border-accent/5 pt-5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Bed size={16} className="text-accent/60"/> {property.bedrooms} Beds</span>
            <span className="flex items-center gap-1.5"><Bath size={16} className="text-accent/60"/> {property.bathrooms} Baths</span>
            <span className="flex items-center gap-1.5"><Square size={16} className="text-accent/60"/> {property.sqft} sqft</span>
          </div>
          <ChevronRight size={16} className="text-accent transform translate-x-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
