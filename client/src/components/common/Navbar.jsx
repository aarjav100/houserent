import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, PlusSquare, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const primaryColor = '#5B4FCF';

const Navbar = ({ savedCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold" style={{ color: primaryColor }}>
            <Home /> HouseHunt
          </Link>
          <div className="hidden md:flex items-center space-x-6 text-gray-600 font-medium">
            <Link to="/browse" className="hover:text-[#5B4FCF] transition">Browse</Link>
            <Link to="/saved" className="hover:text-[#5B4FCF] transition flex items-center gap-1">
              Saved <span className="bg-[#5B4FCF] text-white text-xs px-2 py-0.5 rounded-full">{savedCount}</span>
            </Link>
            {user ? (
              <>
                <Link to="/list-property" className="hover:text-[#5B4FCF] transition flex items-center gap-1"><PlusSquare size={18}/> List Property</Link>
                <Link to="/dashboard" className="hover:text-[#5B4FCF] transition flex items-center gap-1"><LayoutDashboard size={18}/> Dashboard</Link>
                <div className="border-l pl-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#5B4FCF] font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold">{user.name}</span>
                </div>
              </>
            ) : (
              <Link to="/login" className="px-6 py-2 bg-[#5B4FCF] text-white rounded-xl font-bold hover:bg-[#4a3fb3] transition">Login</Link>
            )}
          </div>
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg absolute w-full">
          <Link to="/browse" className="block py-2 text-gray-600">Browse</Link>
          <Link to="/saved" className="block py-2 text-gray-600">Saved ({savedCount})</Link>
          <Link to="/list-property" className="block py-2 text-gray-600">List Property</Link>
          <Link to="/dashboard" className="block py-2 text-gray-600">Dashboard</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
