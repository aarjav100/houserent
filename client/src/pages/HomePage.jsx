import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, Filter, ArrowRight, ChevronRight, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from '../components/property/PropertyCard';
import { propertyService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AdBanner from '../components/common/AdBanner';

const HomePage = ({ onSave, savedProperties }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Rent');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Goa'];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await propertyService.getAll();
        setProperties(Array.isArray(data) ? data.slice(0, 6) : []); 
      } catch (error) {
        console.error('Failed to fetch properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] -z-10 bg-gradient-to-b from-accent/5 to-transparent rounded-full blur-3xl opacity-50"></div>
      
      {/* Hero Section */}
      <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-accent/20"
          >
            <Sparkles size={14} /> India’s #1 Property Platform
          </motion.span>
          
          <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-primary mb-6 leading-tight">
            Find Your Perfect Home <br /> Across <span className="text-accent italic underline decoration-accent/30 underline-offset-8">India</span>
          </h1>
          
          <p className="text-primary/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
            Discover a wide range of properties from luxury villas in Goa to modern apartments in Bangalore. Your dream home is just a click away.
          </p>

          {/* Search Area */}
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex justify-center mb-0 relative z-10">
              <div className="flex p-1.5 bg-white/50 backdrop-blur-sm rounded-2xl border border-accent/10 shadow-sm">
                {['Buy', 'Rent', 'Lease'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-8 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === tab ? 'text-white' : 'text-primary/60 hover:text-primary'}`}
                  >
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-xl -z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4 -mt-4 shadow-2xl shadow-accent/10 relative z-0"
            >
              <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-mint/50 rounded-2xl border border-accent/10 group focus-within:border-accent transition-all">
                <MapPin className="text-accent" size={20} />
                <input 
                  type="text" 
                  placeholder="Where do you want to live?" 
                  className="bg-transparent border-none outline-none w-full font-semibold placeholder:text-primary/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="hidden md:block w-px h-10 bg-accent/20"></div>
              
              <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-mint/50 rounded-2xl border border-accent/10 group focus-within:border-accent transition-all">
                <Building className="text-accent" size={20} />
                <select className="bg-transparent border-none outline-none w-full font-semibold text-primary/60 focus:text-primary">
                  <option>Property Type</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Studio</option>
                  <option>Office</option>
                </select>
              </div>

              <button 
                onClick={() => navigate(`/browse?location=${searchQuery}`)}
                className="w-full md:w-auto px-8 py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-light transition-all shadow-lg shadow-accent/30 btn-glow group"
              >
                <Search size={20} />
                Search
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Quick Filters */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-3 mt-10"
            >
              <span className="text-primary/40 text-xs font-black uppercase tracking-widest mr-2">Top Cities:</span>
              {cities.map((city) => (
                <button 
                  key={city} 
                  onClick={() => navigate(`/browse?location=${city}`)}
                  className="px-5 py-2 bg-white border border-accent/10 rounded-full text-sm font-bold text-primary/60 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 shadow-sm"
                >
                  {city}
                </button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Ad Banner */}
        <AdBanner />

        {/* Featured Section */}
        <div className="mt-20">
          <div className="flex justify-between items-end mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-serif font-extrabold text-primary mb-2">Featured Listings</h2>
              <p className="text-primary/50 font-medium">Handpicked homes for you</p>
            </motion.div>
            <motion.button 
              onClick={() => navigate('/browse')}
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-accent font-bold group"
            >
              View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/50 rounded-3xl h-[400px] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {properties.map((p) => (
                <motion.div key={p._id} variants={itemVariants}>
                  <PropertyCard 
                    property={{
                      id: p._id,
                      title: p.title,
                      location: `${p.address.city}, ${p.address.state}`,
                      price: p.price,
                      images: p.images || [],
                      image: p.image || (p.images && p.images[0]),
                      type: p.type,
                      listingType: p.status.toLowerCase().includes('rent') ? 'Rent' : 'Sale',
                      bedrooms: p.bedrooms,
                      bathrooms: p.bathrooms,
                      sqft: p.area
                    }} 
                    onSave={onSave}
                    isSaved={savedProperties.includes(p._id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Ad Banner */}
        <AdBanner />
      </section>
      
      {/* Footer-like section to finish the look */}
      <section className="bg-primary py-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-white text-4xl md:text-5xl font-serif font-extrabold mb-8">Ready to move in?</h2>
          <p className="text-white/60 mb-12 max-w-xl mx-auto">Join over 10,000+ happy families who found their perfect home with HouseHunt.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/browse')} className="px-10 py-4 bg-accent text-white rounded-2xl font-bold hover:bg-accent-light transition-all shadow-xl shadow-accent/20">Find Property</button>
            <button className="px-10 py-4 bg-white/10 text-white backdrop-blur-md rounded-2xl font-bold border border-white/20 hover:bg-white/20 transition-all">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
