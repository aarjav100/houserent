import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ savedCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="bg-white/80 backdrop-blur-md border-b border-accent/10 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-serif font-extrabold text-primary group">
            <div className="p-2 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
              <Home className="text-accent" />
            </div>
            HouseHunt
          </Link>
          
          <div className="hidden md:flex items-center space-x-8 text-primary/70 font-semibold">
            <Link to="/browse" className="hover:text-accent transition-colors">Browse</Link>
            <Link to="/saved" className="hover:text-accent transition-colors flex items-center gap-1.5">
              Saved <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full">{savedCount}</span>
            </Link>
            {user ? (
              <>
                {user.role === 'owner' && (
                  <Link to="/list-property" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:shadow-lg hover:shadow-accent/20 transition-all btn-glow">
                    <PlusSquare size={18}/> List Property
                  </Link>
                )}
                <Link to="/dashboard" className="hover:text-accent transition-colors flex items-center gap-1.5"><LayoutDashboard size={18}/> Dashboard</Link>
                <div className="h-8 w-px bg-accent/20"></div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-extrabold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-primary">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="px-7 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md">Login</Link>
            )}
          </div>
          
          <button className="md:hidden p-2 text-primary hover:bg-accent/5 rounded-lg" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-accent/10 px-4 pt-2 pb-6 space-y-3 shadow-xl overflow-hidden"
          >
            <Link to="/browse" className="block py-3 text-primary/80 font-semibold" onClick={() => setIsOpen(false)}>Browse</Link>
            <Link to="/saved" className="block py-3 text-primary/80 font-semibold" onClick={() => setIsOpen(false)}>Saved ({savedCount})</Link>
            {user ? (
              <>
                {user.role === 'owner' && (
                  <Link to="/list-property" className="block py-3 text-accent font-bold" onClick={() => setIsOpen(false)}>List Property</Link>
                )}
                <Link to="/dashboard" className="block py-3 text-primary/80 font-semibold" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left py-3 text-red-500 font-bold flex items-center gap-2 border-t border-accent/10 mt-2"
                >
                  <LogOut size={20} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-3 text-accent font-extrabold" onClick={() => setIsOpen(false)}>Login</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
