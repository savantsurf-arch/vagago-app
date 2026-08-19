import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Car,
  User,
  Clock,
  LogOut,
  ShieldCheck,
  Search,
  Zap,
  Sparkles,
  Check,
  Camera,
  Radio,
  FileCheck2,
  Unlock,
  AlertTriangle
} from 'lucide-react';

export const CheckInScannerModal = () => {
  const {
    isScannerOpen,
    setIsScannerOpen,
    bookings = [],
    authorizeCheckIn,
    completeCheckOut
  } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [scannedBooking, setScannedBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' or 'manual'
  const [isScanning, setIsScanning] = useState(true);
  const [gateActionStatus, setGateActionStatus] = useState(''); // 'opening', 'authorized', 'checked_out'

  useEffect(() => {
    if (isScannerOpen && bookings.length > 0 && !scannedBooking) {
      // Auto-populate with first active booking for easy demo
      const active = bookings.find(b => b.bookingStatus === 'Confirmado' || b.bookingStatus === 'Em Andamento') || bookings[0];
      if (active) {
        setInputCode(active.bookingNumber);
        setScannedBooking(active);
      }
    }
  }, [isScannerOpen, bookings]);

  if (!isScannerOpen) return null;

  const handleSearchCode = (customCode) => {
    setMessage('');
    setGateActionStatus('');
    const clean = (customCode || inputCode).trim().toUpperCase();
    if (!clean) return;

    const found = bookings.find(b =>
      b.id === clean ||
      b.bookingNumber?.toUpperCase() === clean ||
      b.qrCodeData?.toUpperCase().includes(clean) ||
      b.vehicle?.plate?.toUpperCase().replace('-', '') === clean.replace('-', '') ||
      b.vehicle?.plate?.toUpperCase() === clean
    );

    if (found) {
      setScannedBooking(found);
      setIsScanning(false);
    } else {
      setScannedBooking(null);
      setMessage('⚠️ Nenhuma reserva localizada com este código ou placa.');
    }
  };

  const handleAuthorizeEntry = () => {
    if (!scannedBooking) return;
    setGateActionStatus('opening');
    
    setTimeout(() => {
      authorizeCheckIn(scannedBooking.id);
      setGateActionStatus('authorized');
      setMessage(`✅ ENTRADA AUTORIZADA! Portão liberado para o veículo ${scannedBooking.vehicle?.plate}.`);
      setScannedBooking(prev => ({
        ...prev,
        bookingStatus: 'Em Andamento',
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }, 1200);
  };

  const handleCheckout = () => {
    if (!scannedBooking) return;
    completeCheckOut(scannedBooking.id);
    setGateActionStatus('checked_out');
    setMessage(`🏁 CHECKOUT CONCLUÍDO! Vaga liberada no sistema para o veículo ${scannedBooking.vehicle?.plate}.`);
    setScannedBooking(prev => ({
      ...prev,
      bookingStatus: 'Concluído',
      checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  };

  const handleSimulateLaserScan = (booking) => {
    setInputCode(booking.bookingNumber);
    setScannedBooking(booking);
    setIsScanning(false);
    setMessage(`🎯 QR Code reconhecido: ${booking.bookingNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Terminal Guarita */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 ring-2 ring-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">Terminal de Acesso & Guarita</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                  SISTEMA ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-300">Validação Inteligente de Entrada & Portão Eletrônico</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsScannerOpen(false);
              setScannedBooking(null);
              setMessage('');
              setGateActionStatus('');
            }}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Mode Switcher (Camera vs Manual) */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setScannerMode('camera'); setIsScanning(true); }}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                scannerMode === 'camera'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Leitor Óptico / Câmera</span>
            </button>

            <button
              type="button"
              onClick={() => setScannerMode('manual')}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                scannerMode === 'manual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Search className="w-4 h-4 text-sky-600" />
              <span>Digitar Placa / Código</span>
            </button>
          </div>

          {/* Camera Viewfinder Simulation */}
          {scannerMode === 'camera' && (
            <div className="relative bg-slate-950 rounded-2xl p-6 text-center text-white overflow-hidden shadow-inner border border-slate-800">
              <div className="absolute inset-0 bg-radial from-emerald-950/20 to-slate-950"></div>
              
              {/* Animated Laser Sweep Line */}
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400 animate-pulse"></div>

              <div className="relative z-10 space-y-3">
                <div className="w-40 h-40 mx-auto border-2 border-dashed border-emerald-400/60 rounded-3xl p-3 flex flex-col items-center justify-center relative">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>

                  <QrCode className="w-16 h-16 text-emerald-400/80 animate-pulse" />
                  <span className="text-[10px] text-emerald-300 font-mono mt-1">Aponte o QR Code</span>
                </div>

                <div className="text-slate-400 text-xs">
                  Aproxime o celular do motorista do leitor da guarita
                </div>

                {/* Quick Scan Shortcuts */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold">Reservas Ativas:</span>
                  {bookings.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSimulateLaserScan(b)}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded-lg border border-emerald-500/30 transition cursor-pointer"
                    >
                      {b.bookingNumber} ({b.vehicle?.plate || 'ITB-2026'})
                    </button>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* Manual Search Bar */}
          {scannerMode === 'manual' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Digitar Código da Reserva ou Placa do Veículo:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: VG-84920 ou ABC-1D23"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCode()}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleSearchCode()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Verificar</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Message */}
          {message && (
            <div className={`p-3.5 rounded-2xl text-xs font-extrabold text-center animate-in fade-in flex items-center justify-center gap-2 ${
              message.includes('AUTORIZADA') || message.includes('CONCLUÍDO')
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              <span>{message}</span>
            </div>
          )}

          {/* Scanned Verification Dossier */}
          {scannedBooking && (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dossiê de Acesso</span>
                  <h4 className="text-xl font-black text-slate-900 font-mono">{scannedBooking.bookingNumber}</h4>
                  <p className="text-xs text-slate-500">{scannedBooking.spaceTitle}</p>
                </div>

                <div className="text-right space-y-1">
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase inline-block ${
                    scannedBooking.bookingStatus === 'Em Andamento'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : scannedBooking.bookingStatus === 'Concluído'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {scannedBooking.bookingStatus}
                  </span>
                  <div className="text-[10px] text-emerald-600 font-bold">✓ Pagamento Confirmado</div>
                </div>
              </div>

              {/* Security Validation Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Motorista</span>
                  <strong className="text-slate-800 truncate block">{scannedBooking.userName || 'Matheus Silva'}</strong>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Placa Autorizada</span>
                  <strong className="text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                    {scannedBooking.vehicle?.plate || 'ITB-2026'}
                  </strong>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Veículo</span>
                  <strong className="text-slate-800 truncate block">
                    {scannedBooking.vehicle?.brand || 'Honda'} {scannedBooking.vehicle?.model || 'Civic'}
                  </strong>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Horário Reservado</span>
                  <strong className="text-slate-800 block">{scannedBooking.startTime} às {scannedBooking.endTime}</strong>
                </div>
              </div>

              {/* Checkin / Checkout Timestamps */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Entrada (Check-in): <strong>{scannedBooking.checkInTime || "Pendente de validação"}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-amber-600" />
                  <span>Saída (Check-out): <strong>{scannedBooking.checkOutTime || "Pendente"}</strong></span>
                </div>
              </div>

              {/* Action Buttons for Gate Operator */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAuthorizeEntry}
                  disabled={scannedBooking.bookingStatus === 'Concluído' || gateActionStatus === 'opening'}
                  className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{gateActionStatus === 'opening' ? 'Abrindo Portão...' : '🟢 Autorizar Entrada (Portão)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={scannedBooking.bookingStatus === 'Concluído'}
                  className="bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-amber-400" />
                  <span>🔴 Registrar Saída (Checkout)</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
