import React, { useState, useEffect } from 'react';
import { Grid, List as ListIcon, Loader2 } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import { propertyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigation, Sparkles } from 'lucide-react';

const BrowsePage = ({ onSave, savedProperties }) => {
  const [view, setView] = useState('grid');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800';
    if (url.startsWith('http')) return url;
    // For local uploads that might still exist
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    nearWorkplace: false,
    radius: user?.preferredRadius || 5
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let queryParams = { ...filters };
      
      // If Near Workplace is active, inject user coordinates
      if (filters.nearWorkplace && user?.workplaceLocation?.coordinates) {
        queryParams.lng = user.workplaceLocation.coordinates[0];
        queryParams.lat = user.workplaceLocation.coordinates[1];
        queryParams.radius = filters.radius;
      }

      const data = await propertyService.getAll(queryParams);
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-lg font-bold mb-6">Filters</h3>
        
        <div className="mb-6">
          <label className="font-semibold block mb-3">Property Type</label>
          <select 
            className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-[#5B4FCF]"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Studio">Studio</option>
            <option value="Office">Office</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="font-semibold block mb-3">City</label>
          <input 
            type="text"
            placeholder="e.g. Mumbai"
            className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-[#5B4FCF]"
            value={filters.city}
            onChange={(e) => setFilters({...filters, city: e.target.value})}
          />
        </div>

        <div className="mb-6">
          <label className="font-semibold block mb-3">Price Range</label>
          <div className="flex gap-2">
            <input 
              type="number"
              placeholder="Min"
              className="w-1/2 p-3 rounded-lg border border-gray-200 outline-none focus:border-[#5B4FCF]"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
            />
            <input 
              type="number"
              placeholder="Max"
              className="w-1/2 p-3 rounded-lg border border-gray-200 outline-none focus:border-[#5B4FCF]"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />
          </div>
        </div>

        {/* Workplace Filter */}
        <div className="pt-6 border-t border-gray-100">
           <div className={`p-4 rounded-2xl border-2 transition-all ${filters.nearWorkplace ? 'bg-accent/5 border-accent' : 'bg-white border-gray-100 opacity-60'}`}>
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                    <Navigation size={16} className={filters.nearWorkplace ? 'text-accent' : 'text-gray-400'} />
                    <span className="text-sm font-bold">Near Office</span>
                 </div>
                 <input 
                    type="checkbox" 
                    checked={filters.nearWorkplace}
                    onChange={(e) => {
                       if (!user?.workplaceLocation?.coordinates) {
                          alert("Please set your workplace location in the Dashboard first!");
                          return;
                       }
                       setFilters({...filters, nearWorkplace: e.target.checked});
                    }}
                    className="w-4 h-4 accent-accent"
                 />
              </div>
              
              {filters.nearWorkplace && (
                 <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between text-[10px] font-bold text-primary/40 uppercase mb-2">
                       <span>Radius</span>
                       <span>{filters.radius}km</span>
                    </div>
                    <input 
                       type="range" 
                       min="1" 
                       max="20" 
                       value={filters.radius}
                       onChange={(e) => setFilters({...filters, radius: parseInt(e.target.value)})}
                       className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                 </div>
              )}
              {!user?.workplaceLocation?.coordinates && (
                <p className="text-[10px] text-gray-400 italic mt-2">Set workplace in profile to use this</p>
              )}
           </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {loading ? 'Searching...' : `${properties.length} Results found`}
          </h2>
          <div className="flex items-center gap-4">
            <select className="p-2 border border-gray-200 rounded-lg outline-none text-sm">
              <option>Sort by: Newest</option>
              <option>Price: Low-High</option>
              <option>Price: High-Low</option>
            </select>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={()=>setView('grid')} className={`p-2 rounded-md ${view==='grid'?'bg-white shadow text-[#5B4FCF]':'text-gray-500'}`}><Grid size={20}/></button>
              <button onClick={()=>setView('list')} className={`p-2 rounded-md ${view==='list'?'bg-white shadow text-[#5B4FCF]':'text-gray-500'}`}><ListIcon size={20}/></button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-[#5B4FCF] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Finding properties for you...</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${view==='grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {properties.map(p => (
                <PropertyCard 
                  key={p._id} 
                  property={{
                    id: p._id,
                    title: p.title,
                    location: `${p.address.city}, ${p.address.state}`,
                    price: p.price,
                    image: p.image || (p.images && p.images.length > 0 ? p.images[0] : 'https://ik.imagekit.io/jain100/default-image.jpg'),
                    images: p.images || [],
                    type: p.type,
                    listingType: p.status.toLowerCase().includes('rent') ? 'Rent' : 'Sale',
                    bedrooms: p.bedrooms,
                    bathrooms: p.bathrooms,
                    sqft: p.area,
                    distanceFromWorkplace: p.distanceFromWorkplace ? (p.distanceFromWorkplace / 1000).toFixed(1) : null
                  }} 
                  onSave={onSave} 
                  isListView={view==='list'} 
                  isSaved={savedProperties.includes(p._id)} 
                />
              ))}
            </div>
            {properties.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">No properties match your criteria.</p>
                <button onClick={() => setFilters({type:'', city:'', minPrice:'', maxPrice:''})} className="mt-4 text-[#5B4FCF] font-bold hover:underline">Clear all filters</button>
              </div>
            )}
            <div className="mt-10 text-center">
              <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Load More</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
