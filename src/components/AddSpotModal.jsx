import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Car, ShieldCheck, DollarSign, Image, CheckCircle, Plus } from 'lucide-react';
import { geocodeAddress } from '../services/googleServices';

export const AddSpotModal = () => {
  const {
    isAddSpotModalOpen,
    setIsAddSpotModalOpen,
    editingSpot,
    setEditingSpot,
    saveParkingSpace
  } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    neighborhood: 'Centro',
    city: 'Itabuna',
    state: 'BA',
    zipCode: '45600-000',
    lat: -14.7966,
    lng: -39.2789,
    entranceLat: -14.7968,
    entranceLng: -39.2787,
    priceHourly: 6.00,
    priceDaily: 28.00,
    priceMonthly: 280.00,
    price30Min: 4.00,
    price2Hours: 11.00,
    price4Hours: 18.00,
    isCovered: true,
    heightLimit: '2.10m',
    size: 'Padrão',
    features: ['Coberta', 'Câmeras 24h', 'Portão Eletrônico', 'Iluminação LED'],
    allowedVehicles: ['Carro pequeno', 'Sedan', 'SUV'],
    photos: [
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80"
    ],
    rules: ['Favor estacionar de ré', 'Apresente o QR Code no portão']
  });

  useEffect(() => {
    if (editingSpot) {
      setFormData(editingSpot);
    } else {
      setFormData({
        title: '',
        description: 'Vaga de garagem segura e coberta no centro comercial de Itabuna.',
        address: 'Av. Cinquentenário, 800 - Centro',
        neighborhood: 'Centro',
        city: 'Itabuna',
        state: 'BA',
        zipCode: '45600-000',
        lat: -14.7966,
        lng: -39.2789,
        entranceLat: -14.7968,
        entranceLng: -39.2787,
        entranceInstructions: 'Entre pelo portão automático localizado à direita.',
        priceHourly: 6.00,
        priceDaily: 28.00,
        priceMonthly: 280.00,
        price30Min: 4.00,
        price2Hours: 11.00,
        price4Hours: 18.00,
        isCovered: true,
        heightLimit: '2.10m',
        size: 'Padrão',
        features: ['Coberta', 'Câmeras 24h', 'Portão Eletrônico', 'Iluminação LED'],
        allowedVehicles: ['Carro pequeno', 'Sedan', 'SUV'],
        photos: [
          "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80"
        ],
        rules: ['Favor estacionar de ré', 'Apresente o QR Code no portão']
      });
    }
  }, [editingSpot, isAddSpotModalOpen]);

  if (!isAddSpotModalOpen) return null;

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    
    // Geocode address dynamically to get Itabuna coordinates
    const geo = geocodeAddress(formData.address || formData.neighborhood || "Centro, Itabuna - BA");
    
    const spotPayload = {
      ...formData,
      title: formData.title || `Garagem ${formData.neighborhood || 'Itabuna'}`,
      city: 'Itabuna',
      state: 'BA',
      lat: geo.lat,
      lng: geo.lng,
      entranceLat: geo.entranceLat,
      entranceLng: geo.entranceLng,
      facadePhoto: formData.facadePhoto || formData.photos[0]
    };

    saveParkingSpace(spotPayload);
    setIsAddSpotModalOpen(false);
    setEditingSpot(null);
  };

  const toggleFeature = (feat) => {
    setFormData(prev => {
      const exists = prev.features.includes(feat);
      return {
        ...prev,
        features: exists ? prev.features.filter(f => f !== feat) : [...prev.features, feat]
      };
    });
  };

  const toggleVehicle = (veh) => {
    setFormData(prev => {
      const exists = prev.allowedVehicles.includes(veh);
      return {
        ...prev,
        allowedVehicles: exists ? prev.allowedVehicles.filter(v => v !== veh) : [...prev.allowedVehicles, veh]
      };
    });
  };

  const ALL_FEATURES = [
    "Coberta", "Descoberta", "Câmeras 24h", "Portão Eletrônico",
    "Iluminação LED", "Segurança 24h", "Acesso 24h", "Tomada Comum",
    "Lavagem de Veículos", "Carregador Elétrico (EV)"
  ];

  const ALL_VEHICLE_TYPES = ["Moto", "Carro pequeno", "Sedan", "SUV", "Caminhonete", "Van"];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
          <div>
            <h3 className="font-extrabold text-lg">
              {editingSpot ? "Editar Minha Vaga" : "Alugue sua Vaga Parada"}
            </h3>
            <p className="text-xs text-emerald-100">Transforme sua garagem em uma fonte de renda recorrente</p>
          </div>
          <button
            onClick={() => {
              setIsAddSpotModalOpen(false);
              setEditingSpot(null);
            }}
            className="p-1.5 text-emerald-100 hover:text-white hover:bg-emerald-700 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Main Specs */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900">1. Informações Básicas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Título da Garagem *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Garagem Coberta Privativa na Av. Paulista"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Endereço Completo (Convertido Automaticamente em Coordenadas) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Av. Paulista, 1578 ou Centro de Itabuna"
                  value={formData.address}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, address: val }));
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bairro *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Centro / Cinquentenário"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              {/* Advanced Geolocation: Exact Gate Entrance */}
              <div className="sm:col-span-2 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                  <span>🚪 Local Exato da Entrada / Portão da Garagem (Navegação GPS)</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  O GPS do motorista o guiará diretamente até a entrada do portão, e não apenas até a rua.
                </p>
                <input
                  type="text"
                  placeholder="Ex: Entre pelo portão verde automático à direita, logo após a guarita 02."
                  value={formData.entranceInstructions || ''}
                  onChange={(e) => setFormData({ ...formData, entranceInstructions: e.target.value })}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-semibold text-slate-500 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-[11px] font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-500 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-[11px] font-bold text-slate-800"
                />
              </div>
            </div>


            <div>
              <label className="font-bold text-slate-700 block mb-1">Descrição Geral da Garagem</label>
              <textarea
                rows={2}
                placeholder="Descreva detalhes como portão eletrônico, facilidades e proximidade de metropolitano."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>

            {/* Host Pack 2: Secret Access Instructions & Multi-Spot */}
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
              <div>
                <label className="font-extrabold text-amber-900 block mb-1 flex items-center gap-1.5">
                  <span>🔐 Instruções Secretas de Acesso (Exibidas SÓ APÓS O PAGAMENTO)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: A senha do portão eletrônico é 4821. A chave fica no cofre metálico #04."
                  value={formData.secretAccessInstructions || ''}
                  onChange={(e) => setFormData({ ...formData, secretAccessInstructions: e.target.value })}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
                <p className="text-[10px] text-amber-700 mt-1 font-semibold">
                  Esta mensagem ficará oculta e só será liberada para o motorista que efetuar o pagamento da reserva.
                </p>
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 text-xs block">
                    🏢 É um Estacionamento Multi-Vagas / Terreno (Lote de Boxes)?
                  </span>
                  <span className="text-[10px] text-slate-500">Permite gerenciar Box 01, Box 02, Box 03... no mesmo painel.</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formData.isMultiSpot)}
                  onChange={(e) => setFormData({ ...formData, isMultiSpot: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded-lg focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {formData.isMultiSpot && (
                <div className="flex items-center gap-3 pt-1">
                  <label className="text-xs font-bold text-slate-700">Quantidade de Boxes no Lote:</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={formData.totalBoxes || 5}
                    onChange={(e) => setFormData({ ...formData, totalBoxes: parseInt(e.target.value) || 5 })}
                    className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Pricing Grid */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              2. Tabela de Preços Personalizada
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Por Hora (R$) *</label>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={formData.priceHourly}
                  onChange={(e) => setFormData({ ...formData, priceHourly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-emerald-700"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Diária (R$)</label>
                <input
                  type="number"
                  step="1.00"
                  value={formData.priceDaily}
                  onChange={(e) => setFormData({ ...formData, priceDaily: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-emerald-700"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Mensal (R$)</label>
                <input
                  type="number"
                  step="10.00"
                  value={formData.priceMonthly}
                  onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-emerald-700"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">30 Minutos (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  value={formData.price30Min}
                  onChange={(e) => setFormData({ ...formData, price30Min: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Features Checkboxes */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              3. Recursos de Segurança e Conforto
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_FEATURES.map((feat) => {
                const checked = formData.features.includes(feat);
                return (
                  <button
                    type="button"
                    key={feat}
                    onClick={() => toggleFeature(feat)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                      checked
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${checked ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>{feat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allowed Vehicles */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-sky-600" />
              4. Tipos de Veículos Suportados
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_VEHICLE_TYPES.map((veh) => {
                const checked = formData.allowedVehicles.includes(veh);
                return (
                  <button
                    type="button"
                    key={veh}
                    onClick={() => toggleVehicle(veh)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                      checked
                        ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${checked ? 'text-sky-600' : 'text-slate-300'}`} />
                    <span>{veh}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            {editingSpot ? "Salvar Alterações na Vaga" : "Publicar Minha Vaga no VagaGo"}
          </button>


        </form>

      </div>
    </div>
  );
};
