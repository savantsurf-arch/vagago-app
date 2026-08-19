import React, { useState, Component } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';

import { LandingPage } from './components/LandingPage';
import { SearchPage } from './components/SearchPage';
import { SpotDetailsModal } from './components/SpotDetailsModal';
import { BookingFlowModal } from './components/BookingFlowModal';
import { CheckInScannerModal } from './components/CheckInScannerModal';
import { AddSpotModal } from './components/AddSpotModal';
import { ReferralModal } from './components/ReferralModal';
import { AuthModal } from './components/AuthModal';
import { LogisticsTrackerModal } from './components/LogisticsTrackerModal';
import { ExtendBookingModal } from './components/ExtendBookingModal';
import { WalletDepositModal } from './components/WalletDepositModal';
import { ClientDashboard } from './components/ClientDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AdminPanel } from './components/AdminPanel';
import { RotateCcw, Sparkles } from 'lucide-react';

// Error Boundary to prevent blank white screens on any mobile or desktop device
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error.toString() };
  }

  componentDidCatch(error, errorInfo) {
    console.error("VagaGo Error Boundary caught error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    this.setState({ hasError: false, errorInfo: null });
    window.location.href = '/';
  };



  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-400/30">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black">VagaGo - Restauração de Sistema</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Ocorreu uma atualização de estado no dispositivo. Clique no botão abaixo para reiniciar o aplicativo com as últimas garagens de Itabuna - BA.
          </p>
          <button
            onClick={this.handleReset}
            className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar & Sincronizar App</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainContent = () => {
  const { activeTab, activeRole, bookings } = useApp();
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [extendingBooking, setExtendingBooking] = useState(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar onOpenDepositModal={() => setIsDepositOpen(true)} />


      <div className="flex-1">
        {activeTab === 'landing' && <LandingPage />}
        {(activeTab === 'search' || activeTab === 'favorites') && <SearchPage />}
        {activeTab === 'client_dashboard' && (
          <ClientDashboard
            onOpenLogisticsTracker={(b) => setTrackingBooking(b)}
            onOpenExtendModal={(b) => setExtendingBooking(b)}
            onOpenDepositModal={() => setIsDepositOpen(true)}
          />
        )}
        {(activeTab === 'owner_dashboard' || activeTab === 'owner_spots' || activeTab === 'owner_finance') && <OwnerDashboard />}
        {activeTab === 'admin_dashboard' && <AdminPanel />}
      </div>

      {/* Global Modals */}
      <AuthModal />
      <SpotDetailsModal />
      <BookingFlowModal />
      <CheckInScannerModal />
      <AddSpotModal />
      <ReferralModal />

      {/* Driver Pack Modals */}
      <LogisticsTrackerModal
        booking={trackingBooking || bookings[0]}
        isOpen={Boolean(trackingBooking)}
        onClose={() => setTrackingBooking(null)}
      />

      <ExtendBookingModal
        booking={extendingBooking}
        isOpen={Boolean(extendingBooking)}
        onClose={() => setExtendingBooking(null)}
      />

      <WalletDepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />
    </main>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
