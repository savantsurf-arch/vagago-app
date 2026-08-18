import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  Car,
  Calendar,
  DollarSign,
  Gift,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Lock,
  Search,
  Check,
  X
} from 'lucide-react';

export const AdminPanel = () => {
  const {
    users,
    setUsers,
    parkingSpaces,
    setParkingSpaces,
    bookings,
    withdrawals,
    approveWithdrawal,
    coupons,
    addCoupon
  } = useApp();

  const [adminTab, setAdminTab] = useState('visãogeral'); // visãogeral, usuarios, vagas, saques, cupons
  const [newCouponCode, setNewCouponCode] = useState('DESCONTO15');
  const [newCouponPercent, setNewCouponPercent] = useState('15');

  const safeUsers = Array.isArray(users) ? users : [];
  const safeSpaces = Array.isArray(parkingSpaces) ? parkingSpaces : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeWithdrawals = Array.isArray(withdrawals) ? withdrawals : [];

  // Aggregation metrics
  const totalUsersCount = safeUsers.length;
  const ownersCount = safeUsers.filter(u => u && u.role === 'PROPRIETÁRIO').length;
  const totalVolume = safeBookings.reduce((sum, b) => sum + Number(b.subtotal || b.totalPrice || 0), 0);
  const totalVagaGoCommissions = safeBookings.reduce((sum, b) => sum + Number(b.platformFee || 0), 0);
  const pendingWithdrawalsCount = safeWithdrawals.filter(w => w && w.status === 'Pendente').length;


  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Ativo' ? 'Bloqueado' : 'Ativo' };
      }
      return u;
    }));
  };

  const toggleSpotStatus = (id) => {
    setParkingSpaces(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'Aprovado' ? 'Pendente' : 'Aprovado' };
      }
      return s;
    }));
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode) return;
    addCoupon({
      code: newCouponCode.toUpperCase(),
      discountPercent: Number(newCouponPercent),
      validUntil: '2026-12-31'
    });
    setNewCouponCode('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-400/30">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <span className="bg-purple-500/30 text-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-400/30 uppercase">
              Painel Administrativo Master
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">Gestão Global VagaGo</h1>
            <p className="text-xs text-purple-200">Monitoramento de usuários, comissões, saques e cupons da plataforma</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Usuários Cadastrados</span>
          <div className="text-2xl font-black text-slate-900">{totalUsersCount}</div>
          <div className="text-[11px] text-slate-500">{ownersCount} Proprietários ativos</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Volume de Transações</span>
          <div className="text-2xl font-black text-sky-600">R$ {totalVolume.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500">{bookings.length} reservas no total</div>
        </div>

        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-purple-800 uppercase">Receita VagaGo (10%)</span>
          <div className="text-2xl font-black text-purple-700">R$ {totalVagaGoCommissions.toFixed(2)}</div>
          <div className="text-[11px] text-purple-600 font-bold">Lucro líquido acumulado</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Saques Pendentes</span>
          <div className="text-2xl font-black text-amber-500">{pendingWithdrawalsCount}</div>
          <div className="text-[11px] text-slate-500">Aguardando aprovação</div>
        </div>

      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'visãogeral', label: 'Visão Geral & Métricas' },
          { id: 'usuarios', label: `Usuários & Proprietários (${users.length})` },
          { id: 'vagas', label: `Gestão de Vagas (${parkingSpaces.length})` },
          { id: 'saques', label: `Solicitações de Saque (${withdrawals.length})` },
          { id: 'cupons', label: `Cupons de Desconto (${coupons.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 ${
              adminTab === tab.id
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Usuários */}
      {adminTab === 'usuarios' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Controle de Usuários</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3">Perfil</th>
                  <th className="p-3">Telefone</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                      {u.name}
                    </td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 font-bold">{u.role}</td>
                    <td className="p-3">{u.phone}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        u.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded text-[11px]"
                      >
                        {u.status === 'Ativo' ? 'Bloquear' : 'Desbloquear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Gestão & Moderação de Vagas */}
      {adminTab === 'vagas' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Moderação e Autorização de Garagens</h3>
            <p className="text-xs text-slate-500">Aprovação de novos anúncios de garagens em Itabuna - BA</p>
          </div>

          <div className="space-y-3">
            {parkingSpaces.map((spot) => (
              <div
                key={spot.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={spot.facadePhoto || spot.photos?.[0] || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=300&q=80"}
                    alt=""
                    className="w-16 h-14 rounded-xl object-cover ring-1 ring-slate-300 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-sm">{spot.title}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        spot.status === 'Aprovado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {spot.status || 'Aprovado'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{spot.address} • Anfitrião: <strong className="text-slate-700">{spot.ownerName || 'Juliana Santos'}</strong></p>
                    <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                      R$ {Number(spot.priceHourly || 6).toFixed(2)}/h • R$ {Number(spot.priceMonthly || 280).toFixed(2)}/mês
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleSpotStatus(spot.id)}
                    className={`text-xs font-extrabold px-3.5 py-2 rounded-xl transition cursor-pointer ${
                      spot.status === 'Aprovado'
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                    }`}
                  >
                    {spot.status === 'Aprovado' ? '⏸️ Pausar Anúncio' : '✅ Autorizar Garagem'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Saques */}
      {adminTab === 'saques' && (

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Aprovação de Saques PIX aos Proprietários</h3>

          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{w.ownerName}</h4>
                  <p className="text-xs text-slate-500">Chave PIX: {w.pixKey} • Data: {w.requestedAt}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-emerald-600">R$ {w.amount.toFixed(2)}</span>
                  {w.status === 'Pendente' ? (
                    <button
                      onClick={() => approveWithdrawal(w.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition"
                    >
                      Aprovar Saque PIX
                    </button>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                      ✓ Pago
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Cupons */}
      {adminTab === 'cupons' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Criar Novo Cupom de Desconto</h3>
            <p className="text-xs text-slate-500">Cupons atômicos para campanhas de marketing</p>
          </div>

          <form onSubmit={handleCreateCoupon} className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder="Código Ex: VAGA20"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
            />
            <input
              type="number"
              placeholder="% Desc"
              value={newCouponPercent}
              onChange={(e) => setNewCouponPercent(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
            />
            <button type="submit" className="bg-purple-700 hover:bg-purple-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl">
              Criar
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-black text-purple-700">{c.code}</span>
                  <p className="text-xs text-slate-500">Desconto: {c.discountPercent}% • Usos: {c.usageCount}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
