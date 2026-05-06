import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MOCK_PROPERTIES } from './data';
import { Home } from 'lucide-react';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ListPropertyPage from './pages/ListPropertyPage';
import DashboardPage from './pages/DashboardPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

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
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50 selection:bg-accent/20 selection:text-primary">
          <Navbar savedCount={savedProperties.length} />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage onSave={handleSave} savedProperties={savedProperties} />} />
              <Route path="/browse" element={<BrowsePage onSave={handleSave} savedProperties={savedProperties} />} />
              <Route path="/property/:id" element={<PropertyDetailPage onSave={handleSave} savedProperties={savedProperties} />} />
              <Route path="/list-property" element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <ListPropertyPage showToast={showToast} />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage properties={MOCK_PROPERTIES} savedProperties={savedProperties} onSave={handleSave} showToast={showToast} />
                </ProtectedRoute>
              } />
              <Route path="/saved" element={
                <ProtectedRoute>
                  <DashboardPage properties={MOCK_PROPERTIES} savedProperties={savedProperties} onSave={handleSave} showToast={showToast} />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-accent/5 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2 text-2xl font-serif font-extrabold text-primary"><Home size={28} className="text-accent"/> HouseHunt</div>
              <div className="flex gap-8 text-sm font-bold text-primary/40 uppercase tracking-widest">
                <a href="#" className="hover:text-accent transition-colors">About</a>
                <a href="#" className="hover:text-accent transition-colors">Contact</a>
                <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
              </div>
              <div className="text-primary/30 text-xs font-bold tracking-tighter uppercase">© 2026 HouseHunt. India's #1 Property Platform.</div>
            </div>
          </footer>

          <Toast message={toast.message} isVisible={toast.isVisible} />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
