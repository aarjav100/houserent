import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Phone, Mail, Loader2 } from 'lucide-react';
import { propertyService, contactService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const primaryColor = '#5B4FCF';

const PropertyDetailPage = ({ onSave, savedProperties }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const { user } = useAuth();

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    if (property && mapRef.current && !mapInstance.current && window.L) {
      const lat = parseFloat(property.latitude) || 29.4727;
      const lng = parseFloat(property.longitude) || 77.7085;
      
      const map = window.L.map(mapRef.current).setView([lat, lng], 13);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      window.L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${property.title}</b><br>${property.address.city}`)
        .openPopup();

      mapInstance.current = map;
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [property]);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getById(id);
      setProperty(data);
      
      // Also fetch contact status
      if (user) {
        const contactData = await contactService.getContact(id);
        setContactInfo(contactData);
      }
    } catch (error) {
      console.error('Failed to fetch property details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealContact = async () => {
    if (!user) {
      alert("Please login to see contact details");
      navigate('/login');
      return;
    }

    // If already unlocked, just show it
    if (contactInfo?.unlocked) return;

    setRevealing(true);
    try {
      // 1. Create Order on Backend (₹9 = 900 paise)
      const order = await paymentService.createOrder(900);

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "HouseHunt",
        description: `Unlock contact for ${property.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify Payment
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            const verification = await paymentService.verifyPayment(verifyData);

            if (verification.success) {
              // 4. Actually Unlock on Backend
              const unlock = await contactService.unlockContact({ 
                propertyId: id,
                paymentId: response.razorpay_payment_id,
                plan: 'single',
                amountPaid: 9
              });
              setContactInfo(unlock);
              alert("Contact unlocked successfully!");
            }
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: primaryColor
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment initiation failed', error);
      alert("Could not start payment. Please check your internet or try again later.");
    } finally {
      setRevealing(false);
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
          <img 
            src={property.images && property.images[0] ? property.images[0] : "https://ik.imagekit.io/jain100/default-image.jpg"} 
            alt="Main" 
            className="w-full h-full object-cover" 
            onLoad={() => console.log('Main image loaded:', property.images[0])}
            onError={(e) => {
              console.error('Main image failed:', property.images[0]);
              e.target.src = "https://ik.imagekit.io/jain100/default-image.jpg";
            }}
          />
          <button onClick={() => onSave(property._id)} className="absolute top-6 right-6 p-4 bg-white/90 rounded-full shadow-lg hover:bg-white transition">
            <Heart size={24} className={isSaved ? "fill-red-500 text-red-500" : "text-gray-500"} />
          </button>
        </div>
        <div className="hidden md:flex flex-col gap-4 h-full">
          {property.images.slice(1,3).map((img, i) => (
            <div key={i} className="flex-1 rounded-2xl overflow-hidden shadow-sm">
              <img 
                src={getImageUrl(img)} 
                alt="Thumb" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.src = "https://ik.imagekit.io/jain100/default-image.jpg";
                }}
              />
            </div>
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
          <div 
            ref={mapRef}
            className="w-full h-96 rounded-2xl border-2 border-gray-100 shadow-inner z-0"
          >
             {/* Map will be rendered here by Leaflet */}
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

            <div className="space-y-3">
              {contactInfo ? (
                <>
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition hover:opacity-90" 
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Phone size={20}/> {contactInfo.phone}
                  </a>
                  {contactInfo.whatsapp && (
                    <a 
                      href={`https://wa.me/${contactInfo.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 rounded-xl bg-green-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition"
                    >
                      WhatsApp Owner
                    </a>
                  )}
                </>
              ) : (
                <button 
                  onClick={handleRevealContact}
                  disabled={revealing}
                  className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-70" 
                  style={{ backgroundColor: primaryColor }}
                >
                  {revealing ? <Loader2 className="animate-spin" size={20}/> : <Phone size={20}/>}
                  {revealing ? 'Revealing...' : 'Contact Owner'}
                </button>
              )}
              <button className="w-full py-4 rounded-xl border-2 border-[#5B4FCF] text-[#5B4FCF] font-bold flex items-center justify-center gap-2 hover:bg-indigo-50">
                <Mail size={20}/> Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
