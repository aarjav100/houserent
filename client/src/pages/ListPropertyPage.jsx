import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';
import { propertyService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ListPropertyPage = ({ showToast }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
    amenities: [],
    images: []
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login to list a property");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Mock images for now since we haven't implemented full upload yet
      const submissionData = {
        ...formData,
        images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6']
      };
      await propertyService.create(submissionData);
      showToast("Property listed successfully!");
      navigate('/dashboard');
    } catch (error) {
      showToast(error || "Failed to list property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">List Your Property</h1>
        <p className="text-gray-500 mb-8">Reach thousands of potential renters and buyers</p>
        <div className="flex justify-center gap-4">
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
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Studio</option>
                    <option>Office</option>
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
              <h2 className="text-2xl font-bold mb-6">Location & Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Full Address</label>
                  <input name="address.fullAddress" type="text" value={formData.address.fullAddress} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B4FCF] transition-all" required/>
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
                <button type="button" onClick={()=>setStep(3)} className="px-10 py-4 bg-[#5B4FCF] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#4a3fb3] transition shadow-lg shadow-indigo-100">
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

              <div className="p-10 border-2 border-dashed border-[#5B4FCF] bg-indigo-50 rounded-3xl text-center group cursor-pointer hover:bg-indigo-100 transition-all">
                 <div className="flex flex-col items-center">
                    <div className="p-4 bg-white rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform"><Upload className="text-[#5B4FCF]" size={32}/></div>
                    <div className="text-[#5B4FCF] font-bold text-lg mb-1">Upload Property Photos</div>
                    <div className="text-sm text-gray-500">Drag and drop up to 5 images. (Mock implementation)</div>
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
