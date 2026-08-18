import React from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Shield, KeyRound, QrCode, PlusCircle, Gift, Sparkles } from 'lucide-react';

export const RoleSwitcher = () => {
  const { activeRole, switchRole, currentUser, setIsScannerOpen, setIsAddSpotModalOpen, setIsReferralModalOpen } = useApp();


  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-inner z-50">
      <div className="flex items-center gap-2">
        <span className="bg-sky-500/20 text-sky-400 font-semibold px-2 py-0.5 rounded border border-sky-500/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" /> DEMO SAAS MODE
        </span>
        <span className="hidden md:inline text-slate-400">
          Alternar Nível de Acesso em Tempo Real:
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <button
          onClick={() => switchRole('CLIENTE')}
          className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1.5 ${
            activeRole === 'CLIENTE'
              ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/50'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>1. CLIENTE</span>
        </button>

        <button
          onClick={() => switchRole('PROPRIETÁRIO')}
          className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1.5 ${
            activeRole === 'PROPRIETÁRIO'
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>2. PROPRIETÁRIO</span>
        </button>

        <button
          onClick={() => switchRole('ADMINISTRADOR')}
          className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1.5 ${
            activeRole === 'ADMINISTRADOR'
              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/50'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>3. ADMINISTRADOR</span>
        </button>

      </div>

      <div className="flex items-center gap-2 ml-auto md:ml-0">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded flex items-center gap-1 border border-slate-700 transition"
          title="Simular Leitura de QR Code (Entrada/Saída)"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline font-medium">Validar QR Code</span>
        </button>

        {activeRole === 'PROPRIETÁRIO' && (
          <button
            onClick={() => setIsAddSpotModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded flex items-center gap-1 font-medium transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Alugue sua vaga</span>
          </button>
        )}

        <button
          onClick={() => setIsReferralModalOpen(true)}
          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 rounded flex items-center gap-1 border border-amber-500/40 transition"
        >
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-medium">Ganhe R$ 20</span>
        </button>
      </div>
    </div>
  );
};
