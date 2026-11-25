import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Decisions } from './pages/Decisions';
import { Planner } from './pages/Planner';
import { HomeBreath } from './pages/HomeBreath';
import { Exposure } from './pages/Exposure';
import { Assistant } from './pages/Assistant';
import { DataTransparency } from './pages/DataTransparency';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { CityModal } from './components/CityModal';
import { AuthModal } from './components/AuthModal';
import { PreferencesModal } from './components/PreferencesModal';
import { Footer } from './components/Footer';
import { EnvironmentalReadings, LocationInfo } from './types';
import { User } from './types/auth';
import { fetchCurrentEnvironmental, MANGALURU_DEFAULT } from './services/api';
import { getStoredUser, clearAuthSession, fetchMyProfile } from './services/auth';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(MANGALURU_DEFAULT);
  const [readings, setReadings] = useState<EnvironmentalReadings | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot_password' | 'verify_email'>('login');
  const [authInitialToken, setAuthInitialToken] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [showAuthPage, setShowAuthPage] = useState<boolean>(() => {
    // Show Auth Page first if user is not logged in and hasn't chosen guest mode in this session
    const stored = getStoredUser();
    const guest = sessionStorage.getItem('vayucoach_guest_mode');
    return !stored && !guest;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync / refresh session with backend profile on mount
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const profile = await fetchMyProfile();
        setCurrentUser(profile);
      } catch (err) {
        // Token invalid or expired; keep whatever is stored or cleared
      }
    };
    verifyUser();

    // Check for email verification or password reset query parameters
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verify_token');
    const resetToken = params.get('reset_token');
    const openPrefs = params.get('tab') === 'preferences';

    if (verifyToken) {
      setAuthModalTab('verify_email');
      setAuthInitialToken(verifyToken);
      setIsAuthModalOpen(true);
    } else if (resetToken) {
      setAuthModalTab('forgot_password');
      setAuthInitialToken(resetToken);
      setIsAuthModalOpen(true);
    } else if (openPrefs) {
      setIsPreferencesModalOpen(true);
    }
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    sessionStorage.removeItem('vayucoach_guest_mode');
    setShowAuthPage(true);
    if (activeTab === 'admin') {
      setActiveTab('landing');
    }
  };

  // Load telemetry data for active location
  const loadEnvironmentalData = useCallback(async (loc: LocationInfo) => {
    setIsLoading(true);
    try {
      const data = await fetchCurrentEnvironmental(loc.latitude, loc.longitude, loc.name);
      setReadings(data);
    } catch (err) {
      console.error('Error fetching environmental readings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnvironmentalData(currentLocation);
  }, [currentLocation, loadEnvironmentalData]);

  const handleSelectCity = (loc: LocationInfo) => {
    setCurrentLocation(loc);
    loadEnvironmentalData(loc);
  };

  if (showAuthPage) {
    return (
      <AuthPage
        onSuccess={(user) => {
          setCurrentUser(user);
          setShowAuthPage(false);
          if (user.role === 'admin') {
            setActiveTab('admin');
          }
        }}
        onContinueAsGuest={() => {
          sessionStorage.setItem('vayucoach_guest_mode', 'true');
          setShowAuthPage(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Top Authoritative VayuCoach Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        readings={readings}
        currentLocation={currentLocation}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        onRefresh={() => loadEnvironmentalData(currentLocation)}
        isLoading={isLoading}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthPage(true)}
        onLogout={handleLogout}
        onOpenPreferences={() => setIsPreferencesModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <Landing
            readings={readings}
            currentLocation={currentLocation}
            onNavigate={setActiveTab}
            onOpenCityModal={() => setIsCityModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && readings && (
          <Dashboard
            readings={readings}
            currentLocation={currentLocation}
            onNavigate={setActiveTab}
            onOpenCityModal={() => setIsCityModalOpen(true)}
          />
        )}

        {activeTab === 'decisions' && readings && (
          <Decisions
            readings={readings}
            currentLocation={currentLocation}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'planner' && readings && (
          <Planner
            readings={readings}
            currentLocation={currentLocation}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'homebreath' && readings && (
          <HomeBreath
            readings={readings}
          />
        )}

        {activeTab === 'exposure' && readings && (
          <Exposure
            readings={readings}
          />
        )}

        {activeTab === 'assistant' && readings && (
          <Assistant
            readings={readings}
            currentLocation={currentLocation}
          />
        )}

        {activeTab === 'transparency' && (
          <DataTransparency />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onOpenAuth={() => {
              setAuthModalTab('login');
              setAuthInitialToken('');
              setIsAuthModalOpen(true);
            }}
          />
        )}
      </main>

      {/* City & Station Selector Modal */}
      <CityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelectCity={handleSelectCity}
        currentLocation={currentLocation}
      />

      {/* Authentication Modal (Login / Register / Forgot Password / Verify) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
        initialToken={authInitialToken}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setActiveTab('admin');
          }
        }}
      />

      {/* Notification Preferences Modal */}
      <PreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        userEmail={currentUser?.email}
      />

      {/* Universal Responsive Footer */}
      <Footer
        onNavigate={setActiveTab}
        onOpenAuth={() => setShowAuthPage(true)}
        isAdmin={currentUser?.role === 'admin'}
      />

    </div>
  );
};

export default App;
