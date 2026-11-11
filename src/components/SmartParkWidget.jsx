import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Navigation,
  DollarSign,
  Star,
  ChevronRight,
  Sparkles,
  Camera,
  ShieldCheck
} from 'lucide-react';

const FALLBACK_GARAGE_PHOTO =
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80';

export const SmartParkWidget = () => {
  const { smartParkOptions, openSpotDetails, requestUserLocation, userLocation } = useApp();

  if (!smartParkOptions) return null;

  const { bestOverall, closest, cheapest, topRated, allEnriched = [] } = smartParkOptions;

  const candidateSlots = [
    {
      key: 'bestOverall',
      badge: '🏆 MELHOR OPÇÃO',
      badgeBg: 'bg-amber-500 text-slate-950 font-black',
      border: 'border-amber-400 ring-2 ring-amber-300/40',
      isPrimaryCta: true,
      spot: bestOverall,
      icon: Trophy,
      color: 'text-amber-500'
    },
    {
      key: 'closest',
      badge: '📍 MAIS PRÓXIMA',
      badgeBg: 'bg-sky-600 text-white font-extrabold',
      border: 'border-sky-400/70',
      isPrimaryCta: false,
      spot: closest,
      icon: Navigation,
      color: 'text-sky-400'
    },
    {
      key: 'cheapest',
      badge: '💰 MAIS BARATA',
      badgeBg: 'bg-emerald-600 text-white font-extrabold',
      border: 'border-emerald-400/70',
      isPrimaryCta: false,
      spot: cheapest,
      icon: DollarSign,
      color: 'text-emerald-400'
    },
    {
      key: 'topRated',
      badge: '⭐ MELHOR AVALIADA',
      badgeBg: 'bg-purple-600 text-white font-extrabold',
      border: 'border-purple-400/70',
      isPrimaryCta: false,
      spot: topRated,
      icon: Star,
      color: 'text-purple-400'
    }
  ];

  // Garante diversidade real: nunca mostra o mesmo endereço repetido em dois cards diferentes
  const normalizeAddress = (addr) => (addr || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const seenSpotIds = new Set();
  const seenAddresses = new Set();
  const displayCards = [];

  candidateSlots.forEach((slot) => {
    if (!slot.spot) return;

    let chosenSpot = slot.spot;
    let activeBadge = slot.badge;

    const spotKey = chosenSpot.id;
    const addrKey = normalizeAddress(chosenSpot.address);

    if (seenSpotIds.has(spotKey) || (addrKey && seenAddresses.has(addrKey))) {
      // Busca outra vaga distinta ainda não exibida
      const alternative = (allEnriched || []).find(
        (candidate) =>
          candidate &&
          !seenSpotIds.has(candidate.id) &&
          (!normalizeAddress(candidate.address) || !seenAddresses.has(normalizeAddress(candidate.address)))
      );

      if (alternative) {
        chosenSpot = alternative;
        activeBadge = slot.key === 'topRated' ? '⭐ BEM AVALIADA' : '✨ OPÇÃO NO BAIRRO';
      } else {
        // Banco de dados possui menos de 4 vagas distintas: combina o selo no card já exibido
        const existingCard = displayCards.find(
          (c) => c.spot.id === spotKey || (addrKey && normalizeAddress(c.spot.address) === addrKey)
        );
        if (existingCard && !existingCard.extraBadges.includes(slot.badge)) {
          existingCard.extraBadges.push(slot.badge);
        }
        return;
      }
    }

    seenSpotIds.add(chosenSpot.id);
    if (normalizeAddress(chosenSpot.address)) {
      seenAddresses.add(normalizeAddress(chosenSpot.address));
    }

    displayCards.push({
      ...slot,
      badge: activeBadge,
      extraBadges: [],
      spot: chosenSpot
    });
  });

  if (displayCards.length === 0) return null;

  const gridColsClass =
    displayCards.length === 1
      ? 'grid-cols-1 max-w-md mx-auto'
      : displayCards.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : displayCards.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-5 sm:p-8 rounded-3xl shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/30">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Sugestões automáticas perto de você</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            Vagas de estacionamento perto de você em Itabuna
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Comparamos distância, preço por hora, segurança e fotos reais das garagens automaticamente pela sua localização.
          </p>
        </div>

        <button
          type="button"
          onClick={requestUserLocation}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 shrink-0 transition cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-sky-200" />
          <span>{userLocation?.isLive ? 'GPS Ativo' : 'Usar minha localização'}</span>
        </button>
      </div>

      {/* Grid of Distinct Smart Option Cards */}
      <div className={`grid ${gridColsClass} gap-4`}>
        {displayCards.map((item) => {
          const IconComp = item.icon;
          const spot = item.spot;
          const spotPhotos =
            Array.isArray(spot.photos) && spot.photos.length > 0
              ? spot.photos
              : [spot.facadePhoto || FALLBACK_GARAGE_PHOTO];
          const primaryPhoto = spotPhotos[0] || FALLBACK_GARAGE_PHOTO;
          const featurePreview = (spot.features || ['Portão', 'Iluminação']).slice(0, 2);

          return (
            <div
              key={`${item.key}-${spot.id}`}
              onClick={() => openSpotDetails(spot)}
              className={`bg-slate-800/95 hover:bg-slate-800 rounded-2xl border ${item.border} overflow-hidden cursor-pointer transition transform hover:-translate-y-1 shadow-md flex flex-col justify-between group`}
            >
              {/* Foto real da garagem e miniaturas */}
              <div className="relative h-32 bg-slate-900 overflow-hidden">
                <img
                  src={primaryPhoto}
                  alt={`Foto da vaga ${spot.title}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                  <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                  <span className="bg-slate-900/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {Number(spot.rating || 4.8).toFixed(1)}
                  </span>
                </div>

                {/* Miniaturas de fotos reais (fachada, portão, iluminação) */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {spotPhotos.slice(0, 3).map((thumb, tIdx) => (
                      <img
                        key={tIdx}
                        src={thumb}
                        alt={`${spot.title} foto ${tIdx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-7 h-7 rounded-md object-cover border border-white/60 shadow-xs"
                      />
                    ))}
                    <span className="text-[10px] font-bold text-slate-200 bg-slate-900/75 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Camera className="w-3 h-3 text-sky-300" />
                      {spotPhotos.length} {spotPhotos.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  </div>
                  {spot.isCovered && (
                    <span className="text-[10px] font-bold bg-emerald-500/90 text-slate-950 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Coberta
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  {item.extraBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {item.extraBadges.map((extra, eIdx) => (
                        <span
                          key={eIdx}
                          className="text-[9px] font-bold bg-white/10 text-slate-200 px-2 py-0.5 rounded-full"
                        >
                          {extra}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-white text-sm truncate">{spot.title}</h4>
                    <IconComp className={`w-4 h-4 shrink-0 ${item.color}`} />
                  </div>
                  <p className="text-xs text-slate-300 truncate mt-0.5">{spot.address}</p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {featurePreview.map((feat, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-[10px] font-semibold bg-slate-700/70 text-slate-200 px-2 py-0.5 rounded-md"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2.5 border-t border-slate-700/70 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 font-bold">
                      <Navigation className="w-3 h-3 text-sky-400" />
                      {spot.distFormatted || spot.distance}
                    </span>
                    <span className="text-slate-400">{spot.walkTime}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Tarifa</span>
                      <span className="text-lg font-black text-sky-400">
                        R$ {Number(spot.priceHourly || 6).toFixed(2)}/h
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSpotDetails(spot);
                      }}
                      className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                        item.isPrimaryCta
                          ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm'
                          : 'border border-white/25 hover:bg-white/15 text-white'
                      }`}
                    >
                      <span>{item.isPrimaryCta ? 'Reservar Agora' : 'Ver detalhes'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
