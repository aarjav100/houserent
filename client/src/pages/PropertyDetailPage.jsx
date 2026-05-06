import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Phone, Mail, Loader2, Sparkles, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { propertyService, contactService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const primaryColor = '#0F3D3E'; // Updated to new theme primary

const PropertyDetailPage = ({ onSave, savedProperties }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const { user } = useAuth();

  const getImageUrl = (url) => {
    if (!url) return 'https://ik.imagekit.io/jain100/default-image.jpg';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    if (property && mapRef.current && !mapInstance.current && window.L) {
      const lat = parseFloat(property.latitude) || 20.5937;
      const lng = parseFloat(property.longitude) || 78.9629;
      
      const map = window.L.map(mapRef.current).setView([lat, lng], 13);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      window.L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${property.title}</b>`)
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
      navigate('/login');
      return;
    }
    if (contactInfo?.unlocked) return;

    setRevealing(true);
    try {
      const order = await paymentService.createOrder(900);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "HouseHunt",
        description: `Unlock contact for ${property.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            const verification = await paymentService.verifyPayment(verifyData);
            if (verification.success) {
              const unlock = await contactService.unlockContact({ 
                propertyId: id,
                paymentId: response.razorpay_payment_id,
                plan: 'single',
                amountPaid: 9
              });
              setContactInfo(unlock);
            }
          } catch (err) {
            console.error("Verification failed", err);
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#2AA198" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initiation failed', error);
    } finally {
      setRevealing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-mint/20">
        <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
        <p className="text-primary/50 font-serif italic">Curating property details...</p>
      </div>
    );
  }

  if (!property) return <div className="text-center py-20 text-2xl font-serif font-bold text-primary">Property Not Found</div>;

  const isSaved = savedProperties.includes(property._id);
  const images = property.images && property.images.length > 0 ? property.images : ["https://ik.imagekit.io/jain100/default-image.jpg"];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12"
    >
      {/* Premium Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16 h-[600px]">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 rounded-[3rem] overflow-hidden shadow-2xl relative group bg-white"
        >
          <AnimatePresence mode="wait">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              src={getImageUrl(images[activeImage])} 
              alt="Main" 
              className="w-full h-full object-cover" 
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
          
          <div className="absolute top-8 left-8 flex gap-3">
             <span className="glass px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
               <Sparkles size={14} className="text-accent" /> {property.type}
             </span>
             <span className="glass px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary">
               {property.status}
             </span>
          </div>

          <button 
            onClick={() => onSave(property._id)} 
            className="absolute top-8 right-8 p-5 bg-white rounded-3xl shadow-2xl hover:bg-white transition-all active:scale-90 group/btn"
          >
            <Heart size={28} className={isSaved ? "fill-red-500 text-red-500" : "text-primary/20 group-hover/btn:text-primary/40"} />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <div className="absolute bottom-10 right-10 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1)); }}
                className="p-3 glass rounded-2xl text-primary hover:bg-white transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1)); }}
                className="p-3 glass rounded-2xl text-primary hover:bg-white transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </motion.div>
        
        <div className="hidden lg:flex flex-col gap-6 h-full">
          {images.slice(1, 4).map((img, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              onClick={() => setActiveImage(i + 1)}
              className={`flex-1 rounded-[2.5rem] overflow-hidden shadow-lg relative cursor-pointer border-4 transition-all duration-300 ${activeImage === i + 1 ? 'border-accent' : 'border-transparent hover:border-accent/30'}`}
            >
              <img 
                src={getImageUrl(img)} 
                alt="Thumb" 
                className="w-full h-full object-cover" 
              />
              {i === 2 && images.length > 4 && (
                <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-serif font-bold">+{images.length - 4}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Photos</span>
                </div>
              )}
            </motion.div>
          ))}
          {images.length < 2 && (
             <div className="flex-1 rounded-[2.5rem] bg-accent/5 border border-dashed border-accent/20 flex flex-col items-center justify-center text-primary/20 text-center p-6">
                <Star size={32} className="mb-3 opacity-20" />
                <p className="text-xs font-serif italic">More photos <br/> available on request</p>
             </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-serif font-extrabold text-primary mb-4 leading-tight">{property.title}</h1>
            <div className="flex items-center text-primary/40 gap-2 text-sm font-bold uppercase tracking-wider mb-10">
              <MapPin size={18} className="text-accent" /> {property.address.fullAddress}, {property.address.city}
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-8 py-10 border-y border-accent/10 mb-12">
             <div className="flex flex-col gap-1">
               <div className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Bed size={14} className="text-accent" /> Bedrooms
               </div>
               <div className="text-2xl font-serif font-extrabold text-primary">{property.bedrooms}</div>
             </div>
             <div className="flex flex-col gap-1">
               <div className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Bath size={14} className="text-accent" /> Bathrooms
               </div>
               <div className="text-2xl font-serif font-extrabold text-primary">{property.bathrooms}</div>
             </div>
             <div className="flex flex-col gap-1">
               <div className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Square size={14} className="text-accent" /> Square Area
               </div>
               <div className="text-2xl font-serif font-extrabold text-primary">{property.area} <span className="text-xs font-bold text-primary/30">sqft</span></div>
             </div>
          </div>

          <h2 className="text-3xl font-serif font-extrabold text-primary mb-6">About this Property</h2>
          <p className="text-primary/60 leading-relaxed mb-12 text-lg font-medium">{property.description}</p>

          <h2 className="text-3xl font-serif font-extrabold text-primary mb-6">Amenities</h2>
          <div className="flex flex-wrap gap-3 mb-16">
            {property.amenities.map(a => (
              <span key={a} className="px-6 py-3 bg-white border border-accent/10 rounded-2xl text-primary/70 font-bold text-sm hover:border-accent transition-colors shadow-sm">{a}</span>
            ))}
          </div>

          <h2 className="text-3xl font-serif font-extrabold text-primary mb-6">Location</h2>
          <div ref={mapRef} className="w-full h-[450px] rounded-[3rem] border-8 border-white shadow-2xl z-0 mb-10 overflow-hidden"></div>
        </div>

        <div className="w-full lg:w-[450px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-10 rounded-[4rem] shadow-2xl border-white sticky top-32"
          >
            <div className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-3">
              {property.status === 'For Rent' ? 'Monthly Rent' : 'Investment Price'}
            </div>
            <div className="text-5xl font-serif font-black text-primary mb-10">
              ₹{property.price.toLocaleString()}
              {property.status === 'For Rent' && <span className="text-base font-bold text-primary/30 ml-2">/mo</span>}
            </div>
            
            <div className="bg-primary/5 rounded-[2.5rem] p-6 mb-10 flex items-center gap-5 border border-primary/5">
              <div className="w-16 h-16 rounded-3xl bg-accent text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-accent/20">
                {property.owner?.name?.charAt(0) || 'O'}
              </div>
              <div>
                <h4 className="font-serif font-extrabold text-primary text-xl">{property.owner?.name || 'Property Owner'}</h4>
                <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">Verified Owner</p>
              </div>
            </div>

            <div className="space-y-4">
              {contactInfo ? (
                <div className="space-y-4">
                  <a href={`tel:${contactInfo.phone}`} className="w-full py-5 bg-primary text-white rounded-3xl font-black flex items-center justify-center gap-3 hover:shadow-2xl transition-all shadow-xl shadow-primary/20 tracking-widest uppercase text-xs">
                    <Phone size={20}/> Call {contactInfo.phone}
                  </a>
                  {contactInfo.whatsapp && (
                    <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-[#25D366] text-white rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/20 tracking-widest uppercase text-xs">
                      WhatsApp
                    </a>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleRevealContact}
                  disabled={revealing}
                  className="w-full py-6 bg-accent text-white rounded-3xl font-black flex items-center justify-center gap-3 hover:shadow-2xl transition-all shadow-xl shadow-accent/20 btn-glow tracking-widest uppercase text-xs"
                >
                  {revealing ? <Loader2 className="animate-spin" size={20}/> : <Phone size={20}/>}
                  {revealing ? 'Unlocking...' : 'Reveal Contact'}
                </button>
              )}
              <button className="w-full py-5 bg-white border-2 border-primary/10 text-primary rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-primary/5 transition-all tracking-widest uppercase text-xs">
                <Mail size={20}/> Message Owner
              </button>
            </div>
            
            <div className="mt-8 text-center">
               <p className="text-[10px] font-bold text-primary/20 uppercase tracking-widest flex items-center justify-center gap-2">
                 <Sparkles size={12} /> Secure Transaction via HouseHunt
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyDetailPage;
