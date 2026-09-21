import React, { useState, Component } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';

import { LandingPage } from './components/LandingPage';
import { HostLandingPage } from './components/HostLandingPage';
import { SearchPage } from './components/SearchPage';
import { TermsPrivacyPage } from './components/TermsPrivacyPage';
import { SpotDetailsModal } from './components/SpotDetailsModal';
import { BookingFlowModal } from './components/BookingFlowModal';
import { CheckInScannerModal } from './components/CheckInScannerModal';
import { AddSpotModal } from './components/AddSpotModal';
import { ReferralModal } from './components/ReferralModal';
import { AuthModal } from './components/AuthModal';
import { ExtendBookingModal } from './components/ExtendBookingModal';
import { WalletDepositModal } from './components/WalletDepositModal';
import { EditProfileModal } from './components/EditProfileModal';
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
      localStorage.removeItem('vagago_users');
      localStorage.removeItem('vagago_parkingSpaces');
      localStorage.removeItem('vagago_bookings');
      localStorage.removeItem('vagago_coupons');
      localStorage.removeItem('vagago_daysOff');
      localStorage.removeItem('vagago_withdrawals');
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
            Ocorreu uma atualização de estado no dispositivo. Clique no botão abaixo para restaurar e sincronizar o aplicativo com o servidor.
          </p>

          {this.state.errorInfo && (
            <div className="p-3 bg-rose-950/90 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-mono max-w-lg text-left overflow-x-auto shadow-inner">
              <strong className="text-rose-400 block mb-1">Diagnóstico do Erro:</strong>
              {this.state.errorInfo}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar & Sincronizar App</span>
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorInfo: null });
                window.location.hash = '';
                window.location.href = '/';
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-5 py-3.5 rounded-2xl transition cursor-pointer"
            >
              Ir para o Início
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }


}

const MainContent = () => {
  const { activeTab, activeRole, bookings, isPageLoading } = useApp();
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [extendingBooking, setExtendingBooking] = useState(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Top Animated Progress Loading Bar for Page Transitions */}
      {isPageLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-sky-600 animate-pulse w-full transform origin-left transition-all duration-300" />
        </div>
      )}

      <Navbar onOpenDepositModal={() => setIsDepositOpen(true)} />

      <div className={`flex-1 transition-opacity duration-300 ${isPageLoading ? 'opacity-70' : 'opacity-100'}`}>
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'host_landing' && <HostLandingPage />}
        {(activeTab === 'search' || activeTab === 'favorites') && <SearchPage />}
        {activeTab === 'terms' && <TermsPrivacyPage />}
        {activeTab === 'client_dashboard' && (
          <ClientDashboard
            onOpenLogisticsTracker={(b) => setTrackingBooking(b)}
            onOpenExtendModal={(b) => setExtendingBooking(b)}
            onOpenDepositModal={() => setIsDepositOpen(true)}
          />
        )}
        {(activeTab === 'owner_dashboard' || activeTab === 'owner_spots' || activeTab === 'owner_finance' || activeTab === 'owner_reservas') && <OwnerDashboard />}

        {activeTab === 'admin_dashboard' && <AdminPanel />}
      </div>



      {/* Global Modals */}
      <AuthModal />
      <EditProfileModal />
      <SpotDetailsModal />
      <BookingFlowModal />
      <CheckInScannerModal />
      <AddSpotModal />
      <ReferralModal />


      {/* Driver Pack Modals */}
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
