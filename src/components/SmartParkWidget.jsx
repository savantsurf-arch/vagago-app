import React from 'react';
import { useApp } from '../context/AppContext';
import { GaragePhotoCarousel } from './GaragePhotoCarousel';
import {
  Trophy,
  Navigation,
  DollarSign,
  Star,
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const SmartParkWidget = () => {
  const { smartParkOptions, openSpotDetails, requestUserLocation, userLocation } = useApp();

  if (!smartParkOptions) return null;

  const { bestOverall, closest, cheapest, topRated, allEnriched = [] } = smartParkOptions;

  const candidateSlots = [
    {
      key: 'bestOverall',
      badge: '🏆 MELHOR OPÇÃO',
      badgeBg: 'bg-amber-400 text-slate-950 font-black',
      border: 'border-amber-400 ring-2 ring-amber-300/40',
      isPrimaryCta: true,
      spot: bestOverall,
      icon: Trophy,
      color: 'text-amber-400'
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
          const featurePreview = (spot.features || ['Portão Eletrônico', 'Iluminação']).slice(0, 2);
          const ratingLabel = Number(spot.rating || 4.8).toFixed(1);
          const reviewsCount = Number(spot.reviewsCount || 0);

          return (
            <div
              key={`${item.key}-${spot.id}`}
              onClick={() => openSpotDetails(spot)}
              className={`bg-slate-800/95 hover:bg-slate-800 rounded-2xl border ${item.border} overflow-hidden cursor-pointer transition transform hover:-translate-y-1 shadow-md flex flex-col justify-between group`}
            >
              {/* Carrossel interativo de fotos reais da garagem */}
              <GaragePhotoCarousel
                photos={spot.photos}
                captions={spot.photoCaptions}
                fallbackPhoto={spot.facadePhoto}
                altPrefix={spot.title}
                heightClass="h-36"
                topLeftSlot={
                  <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                }
                topRightSlot={
                  <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/15">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{ratingLabel}</span>
                    {reviewsCount > 0 && <span className="text-slate-300 font-normal">({reviewsCount})</span>}
                  </span>
                }
                bottomRightSlot={
                  spot.isCovered ? (
                    <span className="text-[10px] font-bold bg-emerald-500/95 text-slate-950 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Coberta
                    </span>
                  ) : null
                }
              />

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
                        className="text-[10px] font-semibold bg-slate-700/80 text-slate-200 px-2 py-0.5 rounded-md"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2.5 border-t border-slate-700/70 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 font-bold text-sky-300">
                      <Navigation className="w-3 h-3 text-sky-400" />
                      {spot.distFormatted || spot.distance} ({spot.walkTime})
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Tarifa</span>
                      <span className="text-lg font-black text-emerald-400">
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
                      <span>{item.isPrimaryCta ? 'Reservar Agora' : 'Ver detalhes e reservar'}</span>
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
