import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MOCK_PROPERTIES } from './data';
import { Home } from 'lucide-react';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import Toast from './components/common/Toast';

// Pages
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ListPropertyPage from './pages/ListPropertyPage';
import DashboardPage from './pages/DashboardPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

const primaryColor = '#5B4FCF';

const App = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [toast, setToast] = useState({ message: '', isVisible: false });

  const showToast = (message) => {
    setToast({ message, isVisible: true });
    setTimeout(() => setToast({ message: '', isVisible: false }), 3000);
  };

  const handleSave = (id) => {
    if (savedProperties.includes(id)) {
      setSavedProperties(savedProperties.filter(savedId => savedId !== id));
      showToast('Removed from saved properties');
    } else {
      setSavedProperties([...savedProperties, id]);
      showToast('Added to saved properties');
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50 selection:bg-indigo-100 selection:text-indigo-900">
          <Navbar savedCount={savedProperties.length} />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage properties={MOCK_PROPERTIES} onSave={handleSave} savedProperties={savedProperties} />} />
              <Route path="/browse" element={<BrowsePage properties={MOCK_PROPERTIES} onSave={handleSave} savedProperties={savedProperties} />} />
              <Route path="/property/:id" element={<PropertyDetailPage properties={MOCK_PROPERTIES} onSave={handleSave} savedProperties={savedProperties} />} />
              <Route path="/list-property" element={<ListPropertyPage showToast={showToast} />} />
              <Route path="/dashboard" element={<DashboardPage properties={MOCK_PROPERTIES} savedProperties={savedProperties} onSave={handleSave} showToast={showToast} />} />
              <Route path="/saved" element={<DashboardPage properties={MOCK_PROPERTIES} savedProperties={savedProperties} onSave={handleSave} showToast={showToast} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xl font-bold" style={{ color: primaryColor }}><Home size={24}/> HouseHunt</div>
              <div className="flex gap-6 text-sm font-medium text-gray-500">
                <a href="#" className="hover:text-[#5B4FCF]">About</a>
                <a href="#" className="hover:text-[#5B4FCF]">Contact</a>
                <a href="#" className="hover:text-[#5B4FCF]">Privacy Policy</a>
              </div>
              <div className="text-gray-400 text-sm">© 2026 HouseHunt. All rights reserved.</div>
            </div>
          </footer>

          <Toast message={toast.message} isVisible={toast.isVisible} />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
