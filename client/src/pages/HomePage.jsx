import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';

const primaryColor = '#5B4FCF';

const HomePage = ({ properties, onSave, savedProperties }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ location: '', type: 'All', price: 50000 });
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Goa', 'Noida'];

  const handleSearch = () => {
    navigate(`/browse?location=${search.location}&type=${search.type}`);
  };

  return (
    <div className="pb-20">
      <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B4FCF] to-purple-400">Perfect Dream Home</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">Discover the best properties across India. Rent, buy, or lease top-tier real estate with ease.</p>
          
          <div className="bg-white p-4 rounded-full shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-gray-200">
              <MapPin className="text-gray-400 mr-2" />
              <input type="text" placeholder="Location, City..." className="w-full py-2 outline-none" value={search.location} onChange={e => setSearch({...search, location: e.target.value})} />
            </div>
            <div className="flex-1 px-4 border-b md:border-b-0 md:border-r border-gray-200">
              <select className="w-full py-2 outline-none text-gray-600 bg-transparent" value={search.type} onChange={e => setSearch({...search, type: e.target.value})}>
                <option value="All">Property Type</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
            <div className="flex-1 px-4 flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">₹0 - ₹{search.price}</span>
              <input type="range" min="5000" max="500000" step="5000" className="w-full accent-[#5B4FCF]" value={search.price} onChange={e => setSearch({...search, price: e.target.value})} />
            </div>
            <button onClick={handleSearch} className="px-8 py-3 rounded-full text-white font-bold transition shadow-md w-full md:w-auto flex items-center justify-center gap-2" style={{ backgroundColor: primaryColor }}>
              <Search size={18}/> Search
            </button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {cities.map(c => (
              <button key={c} onClick={() => setSearch({...search, location: c})} className="bg-white border rounded-full px-5 py-2 text-sm font-medium text-gray-600 hover:border-[#5B4FCF] hover:text-[#5B4FCF] transition">
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-10 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex justify-around text-center divide-x divide-gray-100">
          <div className="px-4">
            <div className="text-3xl font-extrabold text-gray-900">8,000+</div>
            <div className="text-sm text-gray-500 mt-1">Properties</div>
          </div>
          <div className="px-4">
            <div className="text-3xl font-extrabold text-gray-900">50+</div>
            <div className="text-sm text-gray-500 mt-1">Cities</div>
          </div>
          <div className="px-4">
            <div className="text-3xl font-extrabold text-gray-900">10,000+</div>
            <div className="text-sm text-gray-500 mt-1">Happy Users</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
            <p className="text-gray-500">Explore our handpicked listings</p>
          </div>
          <button onClick={() => navigate('/browse')} className="text-[#5B4FCF] font-semibold hover:underline">View All →</button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {['All', 'Apartment', 'Villa', 'PG', 'Studio', 'Office'].map(f => (
            <button key={f} className="px-6 py-2 rounded-full border text-sm font-medium whitespace-nowrap bg-gray-50 text-gray-600 hover:bg-[#5B4FCF] hover:text-white hover:border-[#5B4FCF] transition">{f}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {properties.slice(0,6).map(p => (
            <PropertyCard key={p.id} property={p} onSave={onSave} isListView={false} isSaved={savedProperties.includes(p.id)} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
