import React, { useState, Component, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';

import { LandingPage } from './components/LandingPage';
import { HostLandingPage } from './components/HostLandingPage';
import { SearchPage } from './components/SearchPage';
import { TermsPrivacyPage } from './components/TermsPrivacyPage';
import { NotificationToast } from './components/NotificationToast';
import { Footer } from './components/Footer';
import { LiveChatWidget } from './components/LiveChatWidget';
import { MobileBottomNav } from './components/MobileBottomNav';
import { RotateCcw, Sparkles } from 'lucide-react';

const SpotDetailsModal = lazy(() => import('./components/SpotDetailsModal').then(m => ({ default: m.SpotDetailsModal })));
const BookingFlowModal = lazy(() => import('./components/BookingFlowModal').then(m => ({ default: m.BookingFlowModal })));
const CheckInScannerModal = lazy(() => import('./components/CheckInScannerModal').then(m => ({ default: m.CheckInScannerModal })));
const AddSpotModal = lazy(() => import('./components/AddSpotModal').then(m => ({ default: m.AddSpotModal })));
const ReferralModal = lazy(() => import('./components/ReferralModal').then(m => ({ default: m.ReferralModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const ExtendBookingModal = lazy(() => import('./components/ExtendBookingModal').then(m => ({ default: m.ExtendBookingModal })));
const WalletDepositModal = lazy(() => import('./components/WalletDepositModal').then(m => ({ default: m.WalletDepositModal })));
const EditProfileModal = lazy(() => import('./components/EditProfileModal').then(m => ({ default: m.EditProfileModal })));
const LogisticsTrackerModal = lazy(() => import('./components/LogisticsTrackerModal').then(m => ({ default: m.LogisticsTrackerModal })));
const ClientDashboard = lazy(() => import('./components/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const OwnerDashboard = lazy(() => import('./components/OwnerDashboard').then(m => ({ default: m.OwnerDashboard })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const NotificationsPage = lazy(() => import('./components/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

const PageSkeletonFallback = () => (
  <div className="max-w-6xl mx-auto px-4 py-10 space-y-4 animate-pulse" aria-busy="true" aria-label="Carregando conteúdo">
    <div className="h-28 bg-slate-200 rounded-3xl w-full" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 bg-slate-200 rounded-2xl" />
      <div className="h-32 bg-slate-200 rounded-2xl" />
      <div className="h-32 bg-slate-200 rounded-2xl" />
    </div>
  </div>
);




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
  const { activeTab, isPageLoading } = useApp();
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [extendingBooking, setExtendingBooking] = useState(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

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
        {activeTab === 'landing' && (
          <LandingPage onOpenDepositModal={() => setIsDepositOpen(true)} />
        )}
        {activeTab === 'host_landing' && <HostLandingPage />}
        {(activeTab === 'search' || activeTab === 'favorites') && <SearchPage />}
        {activeTab === 'terms' && <TermsPrivacyPage />}
        <Suspense fallback={<PageSkeletonFallback />}>
          {activeTab === 'client_dashboard' && (
            <ClientDashboard
              onOpenLogisticsTracker={(b) => setTrackingBooking(b)}
              onOpenExtendModal={(b) => setExtendingBooking(b)}
              onOpenDepositModal={() => setIsDepositOpen(true)}
            />
          )}
          {(activeTab === 'owner_dashboard' || activeTab === 'owner_spots' || activeTab === 'owner_finance' || activeTab === 'owner_reservas') && <OwnerDashboard />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'notifications' && <NotificationsPage />}
          {activeTab === 'admin_dashboard' && <AdminPanel />}
        </Suspense>
      </div>

      {/* Global Real-Time Notification Toast Alert */}
      <NotificationToast />

      {/* Mobile Floating Pill Navigation (Estilo 99) */}
      <MobileBottomNav onOpenDepositModal={() => setIsDepositOpen(true)} />

      {/* Rodapé Global Completo + Chat Integrado (Oculto no mapa tela cheia e admin) */}
      {activeTab !== 'admin_dashboard' && activeTab !== 'search' && activeTab !== 'favorites' && (
        <Footer onOpenChatHelp={() => setIsLiveChatOpen(true)} />
      )}
      <LiveChatWidget
        isOpen={isLiveChatOpen}
        onToggle={setIsLiveChatOpen}
      />

      {/* Global Modals (Code-Split) */}
      <Suspense fallback={null}>
        <AuthModal />
        <EditProfileModal />
        <SpotDetailsModal />
        <BookingFlowModal />
        <CheckInScannerModal />
        <AddSpotModal />
        <ReferralModal />
        <LogisticsTrackerModal
          booking={trackingBooking}
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
      </Suspense>
    </main>
  );
};

export default function App({ initialRoute = '' }) {
  return (
    <ErrorBoundary>
      <AppProvider initialRoute={initialRoute}>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
