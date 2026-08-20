import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  MapPin,
  Car,
  ShieldCheck,
  DollarSign,
  Image,
  CheckCircle2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  Lock,
  Eye,
  Info,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';
import { geocodeAddress } from '../services/geoUtils';

export const AddSpotModal = () => {
  const {
    isAddSpotModalOpen,
    setIsAddSpotModalOpen,
    editingSpot,
    setEditingSpot,
    saveParkingSpace
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [customRuleInput, setCustomRuleInput] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Localização
    zipCode: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Itabuna',
    state: 'BA',
    lat: -14.7966,
    lng: -39.2789,
    entranceInstructions: '',

    // Step 2: Características & Dimensões
    vehicleTypes: ['Carro', 'SUV'],
    isCovered: true,
    spotType: 'Livre', // 'Livre' ou 'Presa'
    features: ['Portão Eletrônico', 'Câmeras 24h', 'Iluminação LED'],
    dimensions: {
      length: '5.0m',
      width: '2.5m',
      maxHeight: '2.20m'
    },

    // Step 3: Fotos
    photos: [
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"
    ],
    coverPhotoIndex: 0,

    // Step 4: Descrição
    title: '',
    description: '',

    // Step 5: Regras
    rules: [
      'Estacionar de ré na marcação',
      'Apresentar comprovante ou QR Code na portaria',
      'Não fumar no local'
    ],

    // Step 6: Preços
    priceHourly: 6.00,
    pricePeriod: 20.00,
    priceDaily: 28.00,
    priceWeekly: 120.00,
    priceMonthly: 280.00,

    // Step 7: Disponibilidade & Tipo de Reserva
    instantBooking: true, // true = instantânea, false = aprovação manual
    availableDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    availableHours: '07:00 - 22:00',
    is24h: false,

    // Step 8: Status
    status: 'Ativa'
  });

  useEffect(() => {
    setFormError('');
    setCurrentStep(1);
    if (editingSpot) {
      setFormData({
        ...editingSpot,
        dimensions: editingSpot.dimensions || { length: '5.0m', width: '2.5m', maxHeight: editingSpot.heightLimit || '2.20m' },
        rules: editingSpot.rules || ['Estacionar de ré na marcação'],
        availableDays: editingSpot.availableDays || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        instantBooking: editingSpot.instantBooking !== false
      });
    } else {
      setFormData({
        zipCode: '45600-000',
        address: 'Av. Cinquentenário',
        number: '500',
        complement: '',
        neighborhood: 'Centro',
        city: 'Itabuna',
        state: 'BA',
        lat: -14.7966,
        lng: -39.2789,
        entranceInstructions: 'Portão eletrônico à direita, logo após a farmácia.',
        vehicleTypes: ['Carro', 'SUV'],
        isCovered: true,
        spotType: 'Livre',
        features: ['Portão Eletrônico', 'Câmeras 24h', 'Iluminação LED'],
        dimensions: { length: '5.0m', width: '2.5m', maxHeight: '2.20m' },
        photos: [
          "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"
        ],
        coverPhotoIndex: 0,
        title: '',
        description: '',
        rules: [
          'Estacionar de ré na marcação',
          'Apresentar comprovante ou QR Code na portaria',
          'Não fumar no local'
        ],
        priceHourly: 6.00,
        pricePeriod: 20.00,
        priceDaily: 28.00,
        priceWeekly: 120.00,
        priceMonthly: 280.00,
        instantBooking: true,
        availableDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        availableHours: '07:00 - 22:00',
        is24h: false,
        status: 'Ativa'
      });
    }
  }, [editingSpot, isAddSpotModalOpen]);

  if (!isAddSpotModalOpen) return null;

  // CEP Search Autofill
  const handleCepLookup = async (cep) => {
    const cleanCep = (cep || '').replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || 'Itabuna',
            state: data.uf || 'BA'
          }));
          // Geocode address
          const geo = geocodeAddress(`${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || 'Itabuna'}`);
          setFormData(prev => ({ ...prev, lat: geo.lat, lng: geo.lng }));
        }
      } catch (e) {
        console.warn('CEP lookup error:', e);
      }
    }
  };

  const toggleVehicleType = (type) => {
    setFormData(prev => {
      const exists = prev.vehicleTypes.includes(type);
      const updated = exists ? prev.vehicleTypes.filter(t => t !== type) : [...prev.vehicleTypes, type];
      return { ...prev, vehicleTypes: updated.length ? updated : ['Carro'] };
    });
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

  const toggleRule = (rule) => {
    setFormData(prev => {
      const exists = prev.rules.includes(rule);
      return {
        ...prev,
        rules: exists ? prev.rules.filter(r => r !== rule) : [...prev.rules, rule]
      };
    });
  };

  const handleAddCustomRule = () => {
    if (!customRuleInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, customRuleInput.trim()]
    }));
    setCustomRuleInput('');
  };

  const handleRemoveRule = (ruleIndex) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, idx) => idx !== ruleIndex)
    }));
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, newPhotoUrl.trim()]
    }));
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (photoIdx) => {
    setFormData(prev => {
      const updated = prev.photos.filter((_, idx) => idx !== photoIdx);
      return {
        ...prev,
        photos: updated.length ? updated : ["https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"],
        coverPhotoIndex: 0
      };
    });
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      const exists = prev.availableDays.includes(day);
      const updated = exists ? prev.availableDays.filter(d => d !== day) : [...prev.availableDays, day];
      return { ...prev, availableDays: updated.length ? updated : ['Seg'] };
    });
  };

  // Step Validation
  const validateAndNext = () => {
    setFormError('');
    if (currentStep === 1) {
      if (!formData.address.trim()) {
        setFormError('Por favor, informe o logradouro / endereço da vaga.');
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.title.trim()) {
        setFormError('Por favor, defina um título para o anúncio da garagem.');
        return;
      }
    } else if (currentStep === 6) {
      if (!formData.priceHourly || formData.priceHourly <= 0) {
        setFormError('Por favor, defina um valor por hora válido.');
        return;
      }
    }

    setCurrentStep(prev => Math.min(8, prev + 1));
  };

  const handleFinalPublish = async () => {
    setIsSubmitting(true);
    setFormError('');

    try {
      const fullAddress = `${formData.address}${formData.number ? `, ${formData.number}` : ''}${formData.complement ? ` - ${formData.complement}` : ''} - ${formData.neighborhood}, ${formData.city} - ${formData.state}`;
      
      const payload = {
        ...formData,
        address: fullAddress,
        status: 'Ativa',
        isAvailable: true,
        priceHourly: Number(formData.priceHourly || 6),
        priceDaily: Number(formData.priceDaily || 28),
        priceMonthly: Number(formData.priceMonthly || 280),
        rating: formData.rating || 5.0,
        reviewsCount: formData.reviewsCount || 0
      };

      if (typeof saveParkingSpace === 'function') {
        saveParkingSpace(payload);
      }

      setIsAddSpotModalOpen(false);
      setEditingSpot(null);
    } catch (err) {
      setFormError('Erro ao publicar garagem. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Localização' },
    { num: 2, title: 'Características' },
    { num: 3, title: 'Fotos' },
    { num: 4, title: 'Descrição' },
    { num: 5, title: 'Regras' },
    { num: 6, title: 'Preço' },
    { num: 7, title: 'Disponibilidade' },
    { num: 8, title: 'Revisão' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Top Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              🏠
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                {editingSpot ? 'Editar Anúncio de Garagem' : 'Cadastrar Vaga para Locação'}
              </h2>
              <p className="text-xs text-slate-400">
                Etapa {currentStep} de 8 — {stepsList[currentStep - 1].title}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAddSpotModalOpen(false);
              setEditingSpot(null);
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="bg-slate-100 px-5 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            {stepsList.map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-xl whitespace-nowrap transition cursor-pointer ${
                  currentStep === st.num
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : currentStep > st.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span>{st.num}.</span>
                <span>{st.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* ==================== ETAPA 1: LOCALIZAÇÃO ==================== */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Onde fica a sua garagem?</h3>
                <p className="text-xs text-slate-500">Informe o endereço completo em Itabuna para exibir no mapa.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CEP</label>
                  <input
                    type="text"
                    placeholder="45600-000"
                    value={formData.zipCode}
                    onChange={(e) => {
                      setFormData({ ...formData, zipCode: e.target.value });
                      handleCepLookup(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Logradouro / Rua / Avenida *</label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Cinquentenário"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número</label>
                  <input
                    type="text"
                    placeholder="120"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Casa / Edf."
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    placeholder="Centro"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={`${formData.city} - ${formData.state}`}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instruções de Acesso ao Portão</label>
                <textarea
                  rows="2"
                  placeholder="Ex: Entre pelo portão eletrônico azul localizado ao lado da farmácia."
                  value={formData.entranceInstructions}
                  onChange={(e) => setFormData({ ...formData, entranceInstructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                ></textarea>
                <span className="text-[11px] text-slate-400">Por privacidade, o número e instruções exatas só são revelados após confirmação da reserva.</span>
              </div>
            </div>
          )}

          {/* ==================== ETAPA 2: CARACTERÍSTICAS & DIMENSÕES ==================== */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Características e Dimensões da Vaga</h3>
                <p className="text-xs text-slate-500">Informe os tipos de veículos suportados e facilidades.</p>
              </div>

              {/* Tipos de Veículo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Veículos Permitidos</label>
                <div className="flex flex-wrap gap-2">
                  {['Carro', 'Moto', 'SUV', 'Caminhonete', 'Van'].map((type) => {
                    const isSelected = formData.vehicleTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleVehicleType(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cobertura e Tipo de Manobra */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="block text-xs font-black text-slate-800">Tipo de Cobertura</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isCovered: true })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        formData.isCovered ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      ☔ Coberta
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isCovered: false })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        !formData.isCovered ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      ☀️ Descoberta
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="block text-xs font-black text-slate-800">Disposição da Vaga</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, spotType: 'Livre' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        formData.spotType === 'Livre' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      🟢 Vaga Livre
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, spotType: 'Presa' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        formData.spotType === 'Presa' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      🟡 Vaga Presa
                    </button>
                  </div>
                </div>
              </div>

              {/* Dimensões */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-black text-slate-800">Dimensões da Vaga</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Comprimento</span>
                    <input
                      type="text"
                      value={formData.dimensions.length}
                      onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, length: e.target.value } })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-hidden"
                      placeholder="5.0m"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Largura</span>
                    <input
                      type="text"
                      value={formData.dimensions.width}
                      onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: e.target.value } })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-hidden"
                      placeholder="2.5m"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Altura Máx.</span>
                    <input
                      type="text"
                      value={formData.dimensions.maxHeight}
                      onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, maxHeight: e.target.value } })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-hidden"
                      placeholder="2.20m"
                    />
                  </div>
                </div>
              </div>

              {/* Facilidades */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Facilidades & Segurança</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Portão Eletrônico', 'Câmeras 24h', 'Iluminação LED', 'Acesso 24h', 'Tomada para Elétricos', 'Portaria / Guarita'].map((feat) => {
                    const isSelected = formData.features.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{feat}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== ETAPA 3: FOTOS ==================== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Fotos da Garagem</h3>
                <p className="text-xs text-slate-500">Adicione fotos reais da fachada, portão e área interna da vaga.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cole o link da imagem (URL https://...)"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {formData.photos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverPhotoIndex: idx })}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer ${
                          formData.coverPhotoIndex === idx ? 'bg-emerald-500 text-white' : 'bg-white text-slate-800'
                        }`}
                      >
                        {formData.coverPhotoIndex === idx ? '⭐ Capa' : 'Definir Capa'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="bg-rose-600 text-white p-1 rounded-lg cursor-pointer"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {formData.coverPhotoIndex === idx && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        Foto Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== ETAPA 4: DESCRIÇÃO ==================== */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Título e Descrição do Anúncio</h3>
                <p className="text-xs text-slate-500">Crie um título atraente e explique os diferenciais da sua vaga.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Anúncio *</label>
                <input
                  type="text"
                  placeholder="Ex: Garagem Coberta e Segura Centro de Itabuna"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Completa</label>
                <textarea
                  rows="4"
                  placeholder="Descreva a facilidade de acesso, segurança, referências próximas no bairro e diferenciais."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden leading-relaxed"
                ></textarea>
              </div>
            </div>
          )}

          {/* ==================== ETAPA 5: REGRAS DA VAGA ==================== */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Regras e Convivência da Garagem</h3>
                <p className="text-xs text-slate-500">Selecione regras pré-definidas ou adicione regras personalizadas.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Estacionar de ré na marcação',
                  'Não fumar no local',
                  'Não realizar manutenção mecânica',
                  'Não armazenar objetos na vaga',
                  'Respeitar horário de silêncio após as 22h',
                  'Trancar o portão após entrar'
                ].map((rule) => {
                  const isSelected = formData.rules.includes(rule);
                  return (
                    <button
                      key={rule}
                      type="button"
                      onClick={() => toggleRule(rule)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{rule}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Adicionar Regra Personalizada</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Manter os faróis baixos ao entrar"
                    value={customRuleInput}
                    onChange={(e) => setCustomRuleInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRule}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>

              {formData.rules.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-black text-slate-700 uppercase">Regras ativas no anúncio:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.rules.map((r, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <span>{r}</span>
                        <button type="button" onClick={() => handleRemoveRule(idx)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== ETAPA 6: PREÇO & TARIFAS ==================== */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Definição de Preços e Cobrança</h3>
                <p className="text-xs text-slate-500">Escolha os valores para cada modalidade de locação.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <label className="block text-xs font-extrabold text-emerald-900">Por Hora (R$/h) *</label>
                  <input
                    type="number"
                    step="0.50"
                    value={formData.priceHourly}
                    onChange={(e) => setFormData({ ...formData, priceHourly: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm font-black text-emerald-900 outline-hidden"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold block">Você recebe R$ {(formData.priceHourly * 0.9).toFixed(2)}/h</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="block text-xs font-extrabold text-slate-800">Por Período (Comercial)</label>
                  <input
                    type="number"
                    step="1.00"
                    value={formData.pricePeriod}
                    onChange={(e) => setFormData({ ...formData, pricePeriod: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-800 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 block">Ex: 08:00 às 18:00</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="block text-xs font-extrabold text-slate-800">Por Diária (24h)</label>
                  <input
                    type="number"
                    step="1.00"
                    value={formData.priceDaily}
                    onChange={(e) => setFormData({ ...formData, priceDaily: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-800 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 block">Você recebe R$ {(formData.priceDaily * 0.9).toFixed(2)}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="block text-xs font-extrabold text-slate-800">Por Semana</label>
                  <input
                    type="number"
                    step="5.00"
                    value={formData.priceWeekly}
                    onChange={(e) => setFormData({ ...formData, priceWeekly: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-800 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 block">7 dias corridos</span>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-1 sm:col-span-2">
                  <label className="block text-xs font-extrabold text-sky-900">Mensalista (R$/mês)</label>
                  <input
                    type="number"
                    step="10.00"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-sm font-black text-sky-900 outline-hidden"
                  />
                  <span className="text-[10px] text-sky-700 font-bold block">Renda recorrente garantida no mês!</span>
                </div>
              </div>

              {/* Informação de Taxa */}
              <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-extrabold block">Transparência Financeira:</span>
                  <span className="text-[11px] text-slate-500">Taxa de serviço VagaGo: 10% apenas quando houver locação confirmada.</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-xl text-xs">
                  90% Líquido Locador
                </span>
              </div>
            </div>
          )}

          {/* ==================== ETAPA 7: DISPONIBILIDADE ==================== */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Disponibilidade e Modo de Confirmação</h3>
                <p className="text-xs text-slate-500">Defina os dias de abertura e como deseja receber as reservas.</p>
              </div>

              {/* Dias Disponíveis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Dias da Semana Disponíveis</label>
                <div className="flex flex-wrap gap-2">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => {
                    const isSelected = formData.availableDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        className={`w-11 h-11 rounded-2xl text-xs font-black transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horário de Funcionamento</label>
                  <input
                    type="text"
                    value={formData.availableHours}
                    onChange={(e) => setFormData({ ...formData, availableHours: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden"
                    placeholder="07:00 - 22:00"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is24h: !formData.is24h, availableHours: !formData.is24h ? '24 horas' : '07:00 - 22:00' })}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      formData.is24h ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ⏰ Acesso 24 Horas
                  </button>
                </div>
              </div>

              {/* Modo de Reserva */}
              <div className="pt-2">
                <label className="block text-xs font-black text-slate-800 mb-2">Modo de Confirmação da Reserva</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, instantBooking: true })}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer space-y-1.5 ${
                      formData.instantBooking
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                      <Zap className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>Reserva Instantânea</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      A vaga é confirmada automaticamente no ato do pagamento. Ideal para faturar mais rápido.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, instantBooking: false })}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer space-y-1.5 ${
                      !formData.instantBooking
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs">
                      <Lock className="w-4 h-4 text-slate-600" />
                      <span>Aprovação Manual</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Você recebe a solicitação com os dados do motorista e decide se aceita ou recusa a reserva.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ETAPA 8: REVISÃO & PUBLICAÇÃO ==================== */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Revisar e Publicar Anúncio</h3>
                <p className="text-xs text-slate-500">Confira o resumo completo antes de disponibilizar sua garagem.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex gap-3 items-start">
                  <img
                    src={formData.photos[formData.coverPhotoIndex || 0]}
                    alt=""
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      {formData.spotType} • {formData.isCovered ? 'Coberta' : 'Descoberta'}
                    </span>
                    <h4 className="font-black text-slate-900 text-sm">{formData.title || 'Vaga de Garagem'}</h4>
                    <p className="text-xs text-slate-500">{formData.address}, {formData.neighborhood}, {formData.city}</p>
                    <div className="text-xs font-black text-emerald-700 pt-1">
                      R$ {Number(formData.priceHourly || 6).toFixed(2)}/h • R$ {Number(formData.priceDaily || 28).toFixed(2)}/dia • R$ {Number(formData.priceMonthly || 280).toFixed(2)}/mês
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <strong className="text-slate-800">Veículos:</strong> {formData.vehicleTypes.join(', ')}
                  </div>
                  <div>
                    <strong className="text-slate-800">Confirmação:</strong> {formData.instantBooking ? 'Instantânea' : 'Aprovação Manual'}
                  </div>
                  <div>
                    <strong className="text-slate-800">Dimensões:</strong> {formData.dimensions.length} × {formData.dimensions.width} (Alt. {formData.dimensions.maxHeight})
                  </div>
                  <div>
                    <strong className="text-slate-800">Horário:</strong> {formData.availableHours}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation Buttons */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={validateAndNext}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span>Avançar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalPublish}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-7 py-3 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              {isSubmitting ? (
                <span>Publicando...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PUBLICAR VAGA NO VAGAGO</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
