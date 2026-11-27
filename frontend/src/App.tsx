import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
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
import { fetchCurrentEnvironmental } from './services/api';
import { getStoredUser, clearAuthSession, fetchMyProfile } from './services/auth';
import { useTheme } from './hooks/useTheme';

export const App: React.FC = () => {
  useTheme(); // Initialize theme on document root
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(null);
  const [readings, setReadings] = useState<EnvironmentalReadings | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot_password' | 'verify_email'>('login');
  const [authInitialToken, setAuthInitialToken] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [showAuthPage, setShowAuthPage] = useState<boolean>(() => !getStoredUser());
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
    setShowAuthPage(true);
    if (activeTab === 'admin') {
      setActiveTab('landing');
    }
  };

  // Load telemetry data for active location
  const loadEnvironmentalData = useCallback(async (loc: LocationInfo | null) => {
    if (!loc) {
      setReadings(null);
      setIsLoading(false);
      return;
    }
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
    if (currentLocation) {
      loadEnvironmentalData(currentLocation);
    } else {
      setIsLoading(false);
    }
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

      {/* Main View Container (pb-20 on mobile to clear fixed bottom nav) */}
      <main className="flex-1 pb-20 md:pb-0">
        {activeTab === 'landing' && (
          <Landing
            readings={readings}
            currentLocation={currentLocation}
            onNavigate={setActiveTab}
            onOpenCityModal={() => setIsCityModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            readings={readings}
            currentLocation={currentLocation}
            onNavigate={setActiveTab}
            onOpenCityModal={() => setIsCityModalOpen(true)}
          />
        )}

        {activeTab === 'decisions' && (
          <Decisions
            readings={readings}
            currentLocation={currentLocation}
            onNavigate={setActiveTab}
            onOpenCityModal={() => setIsCityModalOpen(true)}
          />
        )}

        {activeTab === 'planner' && (
          <Planner
            readings={readings}
            currentLocation={currentLocation}
            onNavigate={setActiveTab}
            onOpenCityModal={() => setIsCityModalOpen(true)}
          />
        )}

        {activeTab === 'homebreath' && (
          <HomeBreath
            readings={readings}
          />
        )}

        {activeTab === 'exposure' && (
          <Exposure
            readings={readings}
          />
        )}

        {activeTab === 'assistant' && (
          <Assistant
            readings={readings}
            currentLocation={currentLocation}
            onOpenCityModal={() => setIsCityModalOpen(true)}
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

      {/* Mobile Bottom Navigation (< 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthPage(true)}
        onLogout={handleLogout}
        onOpenPreferences={() => setIsPreferencesModalOpen(true)}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        currentLocation={currentLocation}
        readings={readings}
        isAdmin={currentUser?.role === 'admin'}
      />

    </div>
  );
};

export default App;
