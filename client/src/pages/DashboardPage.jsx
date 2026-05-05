import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2, User as UserIcon, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/property/PropertyCard';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/api';

const DashboardPage = ({ onSave, savedProperties, showToast }) => {
  const [tab, setTab] = useState('My Listings');
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (tab === 'My Listings' && user) {
      fetchMyProperties();
    }
  }, [tab, user]);

  const fetchMyProperties = async () => {
    setLoading(true);
    try {
      // In a real scenario, the backend would have a specific route for user properties
      // For now, we'll filter them if the backend supports owner populate or filter
      const data = await propertyService.getAll(); 
      if (Array.isArray(data)) {
        const filtered = data.filter(p => p.owner === user._id || p.owner?._id === user._id);
        setMyProperties(filtered);
      } else {
        setMyProperties([]);
      }
    } catch (error) {
      console.error('Failed to fetch my properties', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await propertyService.delete(id);
        if (typeof showToast === 'function') {
          showToast('Listing deleted successfully!');
        }
        fetchMyProperties();
      } catch (error) {
        if (typeof showToast === 'function') {
          showToast('Failed to delete listing');
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your dashboard</h2>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-[#5B4FCF] text-white rounded-xl font-bold">Login Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold">Welcome, {user.name}</h1>
        <button onClick={() => navigate('/list-property')} className="bg-[#5B4FCF] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#4a3fb3] transition shadow-lg shadow-indigo-100">
          <Plus size={20}/> List Property
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div className="text-gray-500 font-medium">My Listings</div><div className="text-3xl font-bold text-[#5B4FCF]">{myProperties.length}</div></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div className="text-gray-500 font-medium">Saved Properties</div><div className="text-3xl font-bold text-[#5B4FCF]">{savedProperties.length}</div></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div className="text-gray-500 font-medium">Account Type</div><div className="text-xl font-bold text-[#5B4FCF] capitalize">{user.role}</div></div>
      </div>

      <div className="flex gap-8 border-b border-gray-200 mb-8">
        {['My Listings', 'Saved Properties', 'Profile'].map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`pb-4 px-2 font-bold transition ${tab===t ? 'border-b-2 border-[#5B4FCF] text-[#5B4FCF]' : 'text-gray-500 hover:text-gray-800'}`}>{t}</button>
        ))}
      </div>

      {tab === 'My Listings' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#5B4FCF]" /></div>
          ) : (
            <>
              {myProperties.map(p => (
                <div key={p._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4 w-full md:w-auto">
                     <img src={getImageUrl(p.images[0])} alt={p.title} className="w-24 h-24 rounded-xl object-cover" />
                     <div>
                       <h4 className="font-bold text-lg mb-1">{p.title}</h4>
                       <div className="text-gray-500 text-sm mb-2">{p.address.city}</div>
                       <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                     </div>
                   </div>
                   <div className="flex gap-3 w-full md:w-auto">
                     <button onClick={() => navigate(`/list-property?edit=${p._id}`)} className="flex-1 px-4 py-2 border rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-gray-50 text-gray-700"><Edit size={18}/> Edit</button>
                     <button onClick={() => handleDelete(p._id)} className="flex-1 px-4 py-2 border border-red-100 text-red-500 bg-red-50 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-red-100"><Trash2 size={18}/> Delete</button>
                   </div>
                </div>
              ))}
              {myProperties.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">You haven't listed any properties yet.</p>
                  <button onClick={() => navigate('/list-property')} className="mt-4 text-[#5B4FCF] font-bold hover:underline">Start Listing Now</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'Saved Properties' && (
        <div className="text-center py-10 text-gray-400 font-medium">
          Saved properties integration coming soon.
        </div>
      )}

      {tab === 'Profile' && (
        <div className="max-w-2xl bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
           <div className="space-y-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-[#5B4FCF]">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user.name}</h3>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
              <div><label className="block text-sm font-semibold mb-2">Full Name</label><input type="text" readOnly value={user.name} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none" /></div>
              <div><label className="block text-sm font-semibold mb-2">Email</label><input type="email" readOnly value={user.email} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none" /></div>
              
              <div className="flex gap-4 pt-4">
                <button className="flex-1 px-8 py-3 bg-[#5B4FCF] text-white rounded-xl font-bold shadow-lg shadow-indigo-100" onClick={() => {
                  if (typeof showToast === 'function') {
                    showToast('Profile update feature coming soon!');
                  }
                }}>Update Profile</button>
                <button className="flex-1 px-8 py-3 border-2 border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50" onClick={logout}>Logout</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
