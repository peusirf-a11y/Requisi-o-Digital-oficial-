import React, { useState, useEffect } from 'react';
import { User } from './types';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
    // Simulate initial loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleUpdateLogo = (newLogoUrl: string | null) => {
    setLogoUrl(newLogoUrl);
    if (newLogoUrl) {
      localStorage.setItem('companyLogo', newLogoUrl);
    } else {
      localStorage.removeItem('companyLogo');
    }
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-xl font-semibold text-gray-700">Carregando...</div>
          </div>
      );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} logoUrl={logoUrl} />;
  }

  return <Dashboard 
            user={currentUser} 
            onLogout={handleLogout} 
            onUpdateUser={handleUpdateUser} 
            logoUrl={logoUrl}
            onUpdateLogo={handleUpdateLogo}
          />;
}