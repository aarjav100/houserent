import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Phone, Mail, Loader2, Sparkles, Star, ChevronLeft, ChevronRight, X, QrCode } from 'lucide-react';
import { propertyService, contactService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import UPIMethodModal from '../components/common/UPIMethodModal';

const primaryColor = '#0F3D3E'; // Updated to new theme primary

const PropertyDetailPage = ({ onSave, savedProperties }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('mode'); // 'mode' or 'method'
  const [activeImage, setActiveImage] = useState(0);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
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
      console.log("No user found, redirecting to login");
      navigate('/login');
      return;
    }
    if (contactInfo?.unlocked) return;

    console.log("Initiating payment for ₹10...");
    setRevealing(true);
    try {
      const order = await paymentService.createOrder(100);
      console.log("Order created:", order);
      
      // Bypass Razorpay popup if it's a mock order
      if (order.mock) {
        const verifyData = {
          razorpay_order_id: order.id,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: 'mock_signature'
        };
        const verification = await paymentService.verifyPayment(verifyData);
        if (verification.success) {
          const unlock = await contactService.unlockContact({ 
            propertyId: id,
            paymentId: verifyData.razorpay_payment_id,
            plan: 'single',
            amountPaid: 10
          });
          setContactInfo(unlock);
          setRevealing(false);
          return;
        }
      }
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
                amountPaid: 10
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
      // We don't close showBillingModal here because we might want to stay in UPI modal
    }
  };

  const handleUPISelect = async () => {
    setRevealing(true);
    try {
      const order = await paymentService.createOrder(1000);
      setCurrentOrderId(order.id);
      setShowUPIModal(true);
      setShowBillingModal(false);
    } catch (error) {
      console.error('Failed to create order for UPI', error);
    } finally {
      setRevealing(false);
    }
  };

  const handleUPISuccess = async (paymentId) => {
    setShowUPIModal(false);
    setRevealing(true);
    try {
      const verifyData = {
        razorpay_order_id: currentOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'mock_signature'
      };
      const verification = await paymentService.verifyPayment(verifyData);
      if (verification.success) {
        const unlock = await contactService.unlockContact({ 
          propertyId: id,
          paymentId: paymentId,
          plan: 'single',
          amountPaid: 10
        });
        setContactInfo(unlock);
      }
    } catch (error) {
      console.error("UPI verification failed", error);
    } finally {
      setRevealing(false);
    }
  };

  const handleOpenBilling = (e) => {
    console.log("Unlock clicked!");
    if (!user) {
      navigate('/login');
      return;
    }
    setPaymentStep('mode');
    setShowBillingModal(true);
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
          {images.slice(1, property.premiumGallery ? 15 : 3).map((img, i) => (
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
              {i === 2 && images.length > 4 && property.premiumGallery && (
                <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-serif font-bold">+{images.length - 4}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Photos</span>
                </div>
              )}
            </motion.div>
          ))}
          {!property.premiumGallery && (
             <div 
              className="flex-1 min-h-[200px] rounded-[2.5rem] bg-accent/5 border border-dashed border-accent/30 flex flex-col items-center justify-center text-primary/40 text-center p-6 group/unlock hover:bg-accent/10 transition-all cursor-pointer relative z-30" 
              onClick={handleOpenBilling}
             >
                <Sparkles size={32} className="mb-3 text-accent animate-pulse" />
                <p className="text-xs font-serif italic mb-3">More photos available</p>
                <button 
                  className="px-5 py-2.5 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-accent/20 group-hover/unlock:scale-110 transition-transform"
                >
                  Unlock for ₹10
                </button>
                <span className="absolute bottom-4 text-[8px] font-bold opacity-30 uppercase tracking-tighter">Test Mode Only</span>
             </div>
          )}
          {property.premiumGallery && images.length < 2 && (
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
      <AnimatePresence>
        {showBillingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBillingModal(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 text-left">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-primary">
                      {paymentStep === 'mode' ? 'Billing Mode' : 'Payment Method'}
                    </h3>
                    <p className="text-primary/50 text-sm">
                      {paymentStep === 'mode' ? 'Select payment environment' : 'Choose your test payment method'}
                    </p>
                  </div>
                  <button onClick={() => setShowBillingModal(false)} className="p-2 hover:bg-accent/5 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {paymentStep === 'mode' ? (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <button 
                        onClick={() => setPaymentStep('method')}
                        className="w-full p-6 bg-accent/5 border-2 border-accent rounded-3xl flex items-center justify-between group hover:bg-accent hover:text-white transition-all duration-300"
                      >
                        <div className="text-left">
                          <span className="block text-xs font-black uppercase tracking-widest opacity-60 mb-1">Recommended</span>
                          <span className="block text-lg font-bold">Test Mode (Mock)</span>
                        </div>
                        <div className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-accent transition-colors">
                           <Sparkles />
                        </div>
                      </button>

                      <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                        <div className="text-left">
                          <span className="block text-xs font-black uppercase tracking-widest opacity-40 mb-1">Production</span>
                          <span className="block text-lg font-bold">Real Razorpay</span>
                        </div>
                        <div className="text-xs font-bold bg-primary/10 px-2 py-1 rounded">Unavailable</div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      <button 
                        onClick={handleUPISelect}
                        disabled={revealing}
                        className="w-full p-5 bg-white border border-accent/20 rounded-2xl flex items-center gap-4 hover:border-accent hover:bg-accent/5 transition-all text-left"
                      >
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                          <QrCode size={20} />
                        </div>
                        <div>
                          <span className="block font-bold">UPI / GPay / PhonePe</span>
                          <span className="block text-[10px] text-primary/40 uppercase tracking-widest">QR, Deep Link, VPA</span>
                        </div>
                      </button>

                      <button 
                        onClick={handleRevealContact}
                        disabled={revealing}
                        className="w-full p-5 bg-white border border-accent/20 rounded-2xl flex items-center gap-4 hover:border-accent hover:bg-accent/5 transition-all text-left"
                      >
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <span className="block font-bold">Credit / Debit Card</span>
                          <span className="block text-[10px] text-primary/40 uppercase tracking-widest">Visa, Mastercard, RuPay</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => setPaymentStep('mode')}
                        className="w-full py-2 text-primary/40 text-[10px] font-black uppercase tracking-widest hover:text-accent transition-colors"
                      >
                        ← Back to Mode Selection
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 pt-6 border-t border-accent/10 flex justify-between items-center">
                  <span className="text-primary/60 font-medium text-sm">Amount to pay:</span>
                  <span className="text-2xl font-serif font-black text-primary">₹1</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UPIMethodModal 
        isOpen={showUPIModal}
        onClose={() => setShowUPIModal(false)}
        amount={1}
        orderId={currentOrderId}
        onPaymentSuccess={handleUPISuccess}
      />
    </motion.div>
  );
};

export default PropertyDetailPage;
