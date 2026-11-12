import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { ShareGarageModal } from './ShareGarageModal';
import { GaragePhotoCarousel } from './GaragePhotoCarousel';
import {
  Search,
  Star,
  MapPin,
  ChevronRight,
  SlidersHorizontal,
  X,
  Heart,
  Navigation,
  Share2,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const SearchPage = () => {
  const {
    parkingSpaces,
    openSpotDetails,
    searchLocation,
    setSearchLocation,
    searchFilters,
    setSearchFilters,
    favorites,
    toggleFavorite,
    userLocation,
    requestUserLocation,
    distanceRadius,
    setDistanceRadius,
    activeTab,
    setActiveTab,
    isPageLoading
  } = useApp();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('BEST'); // 'BEST' | 'NEAREST' | 'CHEAPEST' | 'TOP_RATED'
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [hoveredSpotId, setHoveredSpotId] = useState(null);
  const [focusedSpot, setFocusedSpot] = useState(null);
  const [sheetState, setSheetState] = useState('list'); // 'peek' | 'list' | 'focused'
  const [sharingSpot, setSharingSpot] = useState(null);

  const safeFilters = useMemo(() => searchFilters || {}, [searchFilters]);
  const isFavoritesMode = activeTab === 'favorites';
  const safeFavorites = useMemo(
    () => (Array.isArray(favorites) ? favorites : []),
    [favorites]
  );

  const billingType = safeFilters.billingType || 'hora';

  const getSpotPriceByPeriod = (spot, period = billingType) => {
    if (!spot) return 6;
    if (period === 'diaria') return Number(spot.priceDaily || (Number(spot.priceHourly || 6) * 5));
    if (period === 'mensal') return Number(spot.priceMonthly || (Number(spot.priceHourly || 6) * 45));
    return Number(spot.priceHourly || 6);
  };

  const getPeriodSuffix = (period = billingType) => {
    if (period === 'diaria') return '/dia';
    if (period === 'mensal') return '/mês';
    return '/h';
  };

  const displayQueryValue =
    !searchLocation || searchLocation.trim().toLowerCase() === 'itabuna, ba'
      ? ''
      : searchLocation;

  // Filtragem completa com limpeza segura para termos genéricos de Itabuna
  const filteredSpots = useMemo(() => {
    return (parkingSpaces || []).filter((spot) => {
      if (!spot) return false;
      if (spot.status === 'Pausada' || spot.isAvailable === false) return false;

      if (isFavoritesMode && !safeFavorites.includes(spot.id)) {
        return false;
      }

      if (displayQueryValue && displayQueryValue.trim()) {
        const cleanQuery = displayQueryValue
          .toLowerCase()
          .replace(/,?\s*itabuna\s*-?\s*ba/gi, '')
          .replace(/\bitabuna\b/gi, '')
          .trim();

        if (cleanQuery.length > 1) {
          const spotText = `${spot.title || ''} ${spot.address || ''} ${spot.neighborhood || ''} ${spot.description || ''}`.toLowerCase();
          const queryTerms = cleanQuery.split(/[\s,-]+/).filter((t) => t.length > 1);
          if (queryTerms.length > 0) {
            const matchesQuery = queryTerms.some((term) => spotText.includes(term));
            if (!matchesQuery) return false;
          }
        }
      }

      const dist = spot.calculatedDistKm ?? 0.5;
      if (distanceRadius === '500m' && dist > 0.5) return false;
      if (distanceRadius === '1km' && dist > 1.0) return false;
      if (distanceRadius === '2km' && dist > 2.0) return false;
      if (distanceRadius === '5km' && dist > 5.0) return false;

      const is24hSpot =
        spot.is24h === true ||
        spot.availableHours?.includes('24') ||
        (spot.features || []).some((f) => (f || '').toLowerCase().includes('24'));
      if (safeFilters.accessHours === '24H' && !is24hSpot) return false;
      if (safeFilters.accessHours === 'COMMERCIAL' && is24hSpot) return false;

      const spotPrice = getSpotPriceByPeriod(spot, 'hora');
      if (safeFilters.maxPrice && spotPrice > safeFilters.maxPrice) return false;

      const featuresList = (spot.features || []).map((f) => (f || '').toLowerCase());
      if (safeFilters.coveredOnly && !spot.isCovered && !featuresList.some((f) => f.includes('cobert'))) return false;
      if (safeFilters.hasCamera && !featuresList.some((f) => f.includes('câmera') || f.includes('camera'))) return false;
      if (
        safeFilters.hasEVCharger &&
        !featuresList.some(
          (f) => f.includes('elétric') || f.includes('eletric') || f.includes('ev') || f.includes('carregador')
        )
      ) {
        return false;
      }
      if (
        safeFilters.hasGate &&
        !featuresList.some(
          (f) => f.includes('portão') || f.includes('portao') || f.includes('tag') || f.includes('eletrônic') || f.includes('eletronic')
        )
      ) {
        return false;
      }

      if (safeFilters.vehicleType && safeFilters.vehicleType !== 'Todos') {
        const targetType = safeFilters.vehicleType.toLowerCase();
        const allowedList = (spot.allowedVehicles || ['Todos', 'Carro', 'Moto', 'SUV']).map((v) =>
          (v || '').toLowerCase()
        );

        const isCompatible = allowedList.some((v) => {
          if (v.includes('todos')) return true;
          if (targetType === 'carro' && (v.includes('carro') || v.includes('sedan') || v.includes('hatch') || v.includes('pequeno'))) return true;
          if (targetType === 'moto' && v.includes('moto')) return true;
          if (targetType === 'suv' && (v.includes('suv') || v.includes('caminhonete') || v.includes('pickup'))) return true;
          if (targetType === 'caminhonete' && (v.includes('caminhonete') || v.includes('pickup') || v.includes('suv'))) return true;
          return v.includes(targetType);
        });

        if (!isCompatible) return false;
      }

      return true;
    });
  }, [parkingSpaces, isFavoritesMode, safeFavorites, displayQueryValue, distanceRadius, safeFilters]);

  const sortedSpots = useMemo(() => {
    const priceFor = (s) => {
      if (billingType === 'diaria') return Number(s?.priceDaily || Number(s?.priceHourly || 6) * 5);
      if (billingType === 'mensal') return Number(s?.priceMonthly || Number(s?.priceHourly || 6) * 45);
      return Number(s?.priceHourly || 6);
    };
    return [...filteredSpots].sort((a, b) => {
      if (sortBy === 'NEAREST') return (a.calculatedDistKm || 0.5) - (b.calculatedDistKm || 0.5);
      if (sortBy === 'CHEAPEST') return priceFor(a) - priceFor(b);
      if (sortBy === 'TOP_RATED') return (b.rating || 5) - (a.rating || 5);
      return (b.rating || 5) / priceFor(b) - (a.rating || 5) / priceFor(a);
    });
  }, [filteredSpots, sortBy, billingType]);

  const activeFiltersCount = [
    distanceRadius !== 'all',
    billingType !== 'hora',
    safeFilters.vehicleType && safeFilters.vehicleType !== 'Todos',
    safeFilters.accessHours && safeFilters.accessHours !== 'ALL',
    safeFilters.coveredOnly,
    safeFilters.hasCamera,
    safeFilters.hasGate,
    safeFilters.hasEVCharger,
    safeFilters.maxPrice && safeFilters.maxPrice < 50
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setDistanceRadius('all');
    setSearchLocation('');
    setSearchFilters({
      dateType: 'hoje',
      billingType: 'hora',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '18:00',
      vehicleType: 'Todos',
      accessHours: 'ALL',
      coveredOnly: false,
      hasCamera: false,
      hasEVCharger: false,
      hasGate: false,
      has24h: false,
      maxPrice: 50
    });
  };

  const handleSpotSelectFromMap = (spot) => {
    if (!spot) return;
    setSelectedSpotId(spot.id);
    setFocusedSpot(spot);
    setSheetState('focused');
  };

  const handleToggleSheetHandle = () => {
    if (sheetState === 'focused') {
      setFocusedSpot(null);
      setSheetState('list');
    } else if (sheetState === 'list') {
      setSheetState('peek');
    } else {
      setSheetState('list');
    }
  };

  const formatPriceParts = (val) => {
    const fixed = Number(val || 6).toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    return { intPart, decPart };
  };

  const cheapestPrice = useMemo(() => {
    if (sortedSpots.length === 0) return 0;
    const priceFor = (s) => {
      if (billingType === 'diaria') return Number(s?.priceDaily || Number(s?.priceHourly || 6) * 5);
      if (billingType === 'mensal') return Number(s?.priceMonthly || Number(s?.priceHourly || 6) * 45);
      return Number(s?.priceHourly || 6);
    };
    return Math.min(...sortedSpots.map(priceFor));
  }, [sortedSpots, billingType]);

  return (
    <div className="relative h-[calc(100dvh-72px)] sm:h-[calc(100dvh-80px)] w-full bg-slate-100 overflow-hidden font-sans">
      {/* 1. MAPA EM TELA CHEIA (FUNDO PRINCIPAL) */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap
          eagerLoad={true}
          fullScreen={true}
          disablePopupOnSelect={true}
          billingType={billingType}
          className="w-full h-full min-h-0 relative"
          spots={sortedSpots}
          userLocation={userLocation}
          favorites={favorites}
          selectedSpotId={selectedSpotId}
          hoveredSpotId={hoveredSpotId}
          onSelectSpot={handleSpotSelectFromMap}
        />
      </div>

      {/* 2. BARRA DE BUSCA SUPERIOR FLUTUANTE (ESTILO 99) */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3 sm:p-4 pointer-events-none">
        <div className="max-w-2xl mx-auto lg:mx-0 lg:max-w-[440px] space-y-2 pointer-events-auto">
          {/* Search Input Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex items-center p-2 gap-2 border border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('landing')}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
              aria-label="Voltar para o início"
              title="Voltar para o início"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <input
                type="text"
                aria-label="Buscar vaga por endereço ou bairro em Itabuna"
                placeholder="Para onde vamos? (Centro, Shopping...)"
                value={displayQueryValue}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-bold text-sm py-2"
              />
              {displayQueryValue && (
                <button
                  type="button"
                  onClick={() => setSearchLocation('')}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer shrink-0"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`relative min-w-[44px] min-h-[44px] px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-extrabold transition cursor-pointer shrink-0 ${
                activeFiltersCount > 0 || isFilterOpen
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              aria-label="Abrir filtros de busca"
              title="Filtros"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={requestUserLocation}
              className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                userLocation?.isLive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-sky-100 hover:bg-sky-200 text-sky-700'
              }`}
              aria-label="Usar minha localização atual"
              title="Usar minha localização GPS"
            >
              <Navigation className={`w-5 h-5 ${userLocation?.isLive ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Quick Sort & Filter Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <select
              aria-label="Filtrar por período de cobrança"
              value={billingType}
              onChange={(e) => setSearchFilters({ ...safeFilters, billingType: e.target.value })}
              className="px-3 py-2 rounded-full text-xs font-extrabold shadow-sm border border-sky-700 bg-sky-600 text-white shrink-0 cursor-pointer outline-none"
            >
              <option value="hora">⏱️ Por hora</option>
              <option value="diaria">📅 Diária</option>
              <option value="mensal">🗓️ Mensal</option>
            </select>
            {[
              { id: 'BEST', label: '🏆 Melhor' },
              { id: 'NEAREST', label: '📍 Mais próxima' },
              { id: 'CHEAPEST', label: '💰 Menor preço' },
              { id: 'TOP_RATED', label: '⭐ Melhor nota' }
            ].map((item) => {
              const active = sortBy === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSortBy(item.id)}
                  className={`px-3 py-2 rounded-full text-xs font-extrabold shadow-sm border transition shrink-0 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setSearchFilters({ ...safeFilters, coveredOnly: !safeFilters.coveredOnly })}
              className={`px-3 py-2 rounded-full text-xs font-extrabold shadow-sm border transition shrink-0 cursor-pointer ${
                safeFilters.coveredOnly
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
              }`}
            >
              🛡️ Coberta
            </button>

            <button
              type="button"
              onClick={() =>
                setSearchFilters({
                  ...safeFilters,
                  accessHours: safeFilters.accessHours === '24H' ? 'ALL' : '24H'
                })
              }
              className={`px-3 py-2 rounded-full text-xs font-extrabold shadow-sm border transition shrink-0 cursor-pointer ${
                safeFilters.accessHours === '24H'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
              }`}
            >
              ⚡ 24 Horas
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(isFavoritesMode ? 'search' : 'favorites')}
              className={`px-3 py-2 rounded-full text-xs font-extrabold shadow-sm border transition shrink-0 cursor-pointer ${
                isFavoritesMode
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
              }`}
            >
              ❤️ Favoritas ({safeFavorites.length})
            </button>
          </div>
          {/* Feedback amigável se GPS for negado ou ativo */}
          {userLocation?.error && (
            <div className="bg-amber-50/95 border border-amber-200 text-amber-900 text-xs font-bold px-3 py-2 rounded-xl shadow-sm">
              {userLocation.error}
            </div>
          )}
        </div>
      </div>

      {/* DRAWER DE FILTROS DETALHADOS */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros detalhados de vagas"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFilterOpen(false);
          }}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Filtros da Busca</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-sky-600 hover:underline px-2 py-1 cursor-pointer"
                >
                  Limpar tudo
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 cursor-pointer"
                  aria-label="Fechar filtros"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Período de Cobrança */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 block">Período</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'hora', label: 'Por hora' },
                  { id: 'diaria', label: 'Diária' },
                  { id: 'mensal', label: 'Mensal' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSearchFilters({ ...safeFilters, billingType: p.id })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      billingType === p.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Raio de Distância */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 block">Raio de distância</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Qualquer' },
                  { id: '500m', label: 'Até 500m' },
                  { id: '1km', label: 'Até 1 km' },
                  { id: '2km', label: 'Até 2 km' },
                  { id: '5km', label: 'Até 5 km' }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setDistanceRadius(r.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      distanceRadius === r.id
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Veículo */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 block">Tipo de veículo</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Todos', 'Carro', 'Moto', 'SUV', 'Caminhonete'].map((vt) => (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => setSearchFilters({ ...safeFilters, vehicleType: vt })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      (safeFilters.vehicleType || 'Todos') === vt
                        ? 'bg-sky-50 border-sky-500 text-sky-700 font-extrabold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </div>

            {/* Preço Máximo */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Preço máximo por hora</span>
                <span className="text-sky-700 font-black">Até R$ {safeFilters.maxPrice || 50}/h</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                step="1"
                value={safeFilters.maxPrice || 50}
                onChange={(e) => setSearchFilters({ ...safeFilters, maxPrice: Number(e.target.value) })}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Segurança & Comodidades */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <span className="font-extrabold text-slate-800 block">Segurança e comodidades</span>
              {[
                { key: 'coveredOnly', label: '🛡️ Vaga coberta' },
                { key: 'hasCamera', label: '📹 Câmeras de segurança' },
                { key: 'hasGate', label: '🚪 Portão eletrônico / Tag' },
                { key: 'hasEVCharger', label: '⚡ Recarga para carro elétrico' }
              ].map((feat) => (
                <label key={feat.key} className="flex items-center justify-between py-2 cursor-pointer">
                  <span>{feat.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(safeFilters[feat.key])}
                    onChange={(e) => setSearchFilters({ ...safeFilters, [feat.key]: e.target.checked })}
                    className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="w-full min-h-[48px] bg-sky-600 hover:bg-sky-500 text-white font-black text-sm rounded-2xl shadow-lg cursor-pointer transition"
            >
              Ver {sortedSpots.length} {sortedSpots.length === 1 ? 'vaga' : 'vagas'} no mapa
            </button>
          </div>
        </div>
      )}

      {/* 3. BOTTOM SHEET DESLIZANTE (ESTILO 99) */}
      <section
        aria-label="Vagas disponíveis no mapa"
        className="absolute bottom-0 left-0 right-0 z-20 lg:left-4 lg:bottom-4 lg:right-auto lg:w-[440px] bg-white rounded-t-3xl lg:rounded-3xl shadow-[0_-8px_30px_rgba(15,23,42,0.14)] border border-slate-200/80 transition-all duration-300 flex flex-col"
      >
        {/* Alça de puxar para cima/baixo */}
        <button
          type="button"
          onClick={handleToggleSheetHandle}
          className="w-full flex flex-col items-center pt-2.5 pb-2 cursor-pointer focus:outline-none"
          aria-label={sheetState === 'peek' ? 'Expandir lista de vagas' : 'Recolher painel de vagas'}
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </button>

        {/* Estado FOCUSED: Vaga selecionada diretamente ao tocar no pino do mapa */}
        {sheetState === 'focused' && focusedSpot ? (
          <div className="px-4 sm:px-5 pb-5 space-y-3.5 max-h-[68vh] overflow-y-auto animate-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setFocusedSpot(null);
                  setSheetState('list');
                }}
                className="text-xs font-extrabold text-sky-700 hover:text-sky-800 flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-sky-50 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Todas ({sortedSpots.length})</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleFavorite && toggleFavorite(focusedSpot.id)}
                  className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border transition cursor-pointer ${
                    safeFavorites.includes(focusedSpot.id)
                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                  aria-label="Favoritar vaga"
                >
                  <Heart className={`w-4 h-4 ${safeFavorites.includes(focusedSpot.id) ? 'fill-rose-500' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setSharingSpot(focusedSpot)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border bg-slate-50 border-slate-200 text-slate-600 cursor-pointer"
                  aria-label="Compartilhar vaga"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFocusedSpot(null);
                    setSheetState('peek');
                  }}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 cursor-pointer"
                  aria-label="Minimizar painel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <GaragePhotoCarousel
              photos={focusedSpot.photos}
              captions={focusedSpot.photoCaptions}
              fallbackPhoto={focusedSpot.facadePhoto}
              altPrefix={focusedSpot.title}
              heightClass="h-40"
              topLeftSlot={
                <span className="bg-slate-900/85 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {focusedSpot.isCovered ? 'Coberta' : 'Privativa'}
                </span>
              }
              topRightSlot={
                <span className="bg-slate-900/85 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {Number(focusedSpot.rating || 4.8).toFixed(1)}
                </span>
              }
            />

            {/* Hierarquia Visual Estilo 99: Preço em destaque + Distância/Tempo a pé */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h2 className="text-lg font-black text-slate-900 leading-tight truncate">
                  {focusedSpot.title}
                </h2>
                <p className="text-xs text-slate-600 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">{focusedSpot.address || focusedSpot.neighborhood || 'Itabuna - BA'}</span>
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {focusedSpot.distFormatted || focusedSpot.distance || '300 m'} • {focusedSpot.walkTime || '4 min a pé'}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  {billingType === 'diaria' ? 'Diária' : billingType === 'mensal' ? 'Mensal' : 'Por hora'}
                </span>
                <p className="text-3xl font-black text-slate-900 leading-none">
                  R$ {formatPriceParts(getSpotPriceByPeriod(focusedSpot)).intPart}
                  <span className="text-sm font-bold text-slate-500">
                    ,{formatPriceParts(getSpotPriceByPeriod(focusedSpot)).decPart}{getPeriodSuffix()}
                  </span>
                </p>
                <span className="text-[11px] font-semibold text-slate-500 block mt-1">
                  {billingType === 'hora'
                    ? `Diária R$ ${Number(focusedSpot.priceDaily || 28).toFixed(0)}`
                    : `Hora R$ ${Number(focusedSpot.priceHourly || 6).toFixed(2)}/h`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => openSpotDetails(focusedSpot)}
                className="flex-1 min-h-[48px] bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Reservar agora</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Estado PEEK ou LIST */
          <>
            {/* Cabeçalho do Bottom Sheet */}
            <div className="px-5 pb-3 flex items-center justify-between gap-2">
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {isFavoritesMode ? 'Vagas favoritas' : 'Vagas disponíveis perto de você'}
                </h1>
                <p className="text-xs text-slate-500 font-semibold">
                  {sortedSpots.length} {sortedSpots.length === 1 ? 'opção em Itabuna' : 'opções em Itabuna'}
                  {cheapestPrice > 0 ? ` • A partir de R$ ${cheapestPrice.toFixed(2)}${getPeriodSuffix()}` : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSheetState((prev) => (prev === 'peek' ? 'list' : 'peek'))}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer shrink-0"
                aria-label={sheetState === 'peek' ? 'Mostrar vagas' : 'Minimizar lista'}
              >
                {sheetState === 'peek' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {sheetState !== 'peek' && (
              <div className="px-4 sm:px-5 pb-6 space-y-3 max-h-[44vh] sm:max-h-[54vh] overflow-y-auto">
                {isPageLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((n) => (
                      <div key={n} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl animate-pulse gap-3">
                        <div className="w-16 h-16 bg-slate-200 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-2/3" />
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                        <div className="w-20 h-10 bg-slate-200 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : sortedSpots.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-300 text-center space-y-3 bg-slate-50">
                    <p className="text-sm font-extrabold text-slate-800">
                      Nenhuma vaga encontrada com esses filtros
                    </p>
                    <p className="text-xs text-slate-500">
                      Tente limpar os filtros ou buscar outro bairro de Itabuna.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="min-h-[44px] px-5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition"
                    >
                      Limpar filtros
                    </button>
                  </div>
                ) : (
                  sortedSpots.map((spot, index) => {
                    const isRecommended = index === 0;
                    const displayPrice = getSpotPriceByPeriod(spot);
                    const isCheapest = cheapestPrice > 0 && displayPrice === cheapestPrice;
                    const isSelected = selectedSpotId === spot.id;
                    const { intPart, decPart } = formatPriceParts(displayPrice);
                    const thumb =
                      (spot.photos && spot.photos[0]) ||
                      spot.facadePhoto ||
                      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=300&q=80';

                    return (
                      <div
                        key={spot.id}
                        id={`spot-card-${spot.id}`}
                        onMouseEnter={() => setHoveredSpotId(spot.id)}
                        onMouseLeave={() => setHoveredSpotId(null)}
                        onClick={() => handleSpotSelectFromMap(spot)}
                        className={`relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition cursor-pointer gap-3 group ${
                          isSelected || isRecommended
                            ? 'border-2 border-sky-500 bg-sky-50/40'
                            : 'border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/20'
                        }`}
                      >
                        {isRecommended && (
                          <div className="absolute -top-2.5 left-4 bg-sky-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                            ⭐ RECOMENDADA
                          </div>
                        )}

                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                            <img src={thumb} alt={spot.title} className="w-full h-full object-cover" loading="lazy" />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate max-w-[160px] sm:max-w-[200px]">
                                {spot.title}
                              </span>
                              {isCheapest ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                                  Econômica
                                </span>
                              ) : spot.isCovered ? (
                                <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                                  Coberta
                                </span>
                              ) : null}
                            </div>

                            <p className="text-xs text-slate-600 font-semibold flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span className="truncate">
                                {spot.distFormatted || spot.distance || '300 m'} • {spot.walkTime || '4 min a pé'}
                              </span>
                            </p>

                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 flex-wrap">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                              <span>{Number(spot.rating || 4.8).toFixed(1)}</span>
                              {Number(spot.reviewsCount || 0) > 0 && (
                                <span className="text-slate-400 font-medium">({spot.reviewsCount})</span>
                              )}
                              {spot.isVerifiedHost !== false && (
                                <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md">
                                  <ShieldCheck className="w-3 h-3 text-sky-600" /> Verificado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Preço gigante em destaque (Hierarquia Estilo 99) */}
                        <div className="text-right shrink-0 space-y-1.5">
                          <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                            R$ {intPart}
                            <span className="text-xs font-semibold text-slate-500">,{decPart}{getPeriodSuffix()}</span>
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSpotDetails(spot);
                            }}
                            className="min-h-[40px] bg-sky-600 group-hover:bg-sky-500 text-white text-xs font-extrabold py-2 px-3.5 rounded-xl transition shadow-sm cursor-pointer"
                          >
                            Reservar
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </section>

      <ShareGarageModal
        spot={sharingSpot}
        isOpen={Boolean(sharingSpot)}
        onClose={() => setSharingSpot(null)}
      />
    </div>
  );
};
