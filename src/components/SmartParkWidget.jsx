import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Navigation,
  DollarSign,
  Star,
  Clock,
  Car,
  ChevronRight,
  Sparkles,
  MapPin
} from 'lucide-react';

export const SmartParkWidget = () => {
  const { smartParkOptions, openSpotDetails, requestUserLocation, userLocation } = useApp();

  if (!smartParkOptions) return null;

  const { bestOverall, closest, cheapest, topRated } = smartParkOptions;

  const cards = [
    {
      badge: "🏆 MELHOR OPÇÃO",
      badgeBg: "bg-amber-500 text-slate-950 font-black",
      border: "border-amber-400 ring-2 ring-amber-300/40",
      spot: bestOverall,
      icon: Trophy,
      color: "text-amber-500"
    },
    {
      badge: "📍 MAIS PRÓXIMA",
      badgeBg: "bg-sky-600 text-white font-extrabold",
      border: "border-sky-300",
      spot: closest,
      icon: Navigation,
      color: "text-sky-600"
    },
    {
      badge: "💰 MAIS BARATA",
      badgeBg: "bg-emerald-600 text-white font-extrabold",
      border: "border-emerald-300",
      spot: cheapest,
      icon: DollarSign,
      color: "text-emerald-600"
    },
    {
      badge: "⭐ MELHOR AVALIADA",
      badgeBg: "bg-purple-600 text-white font-extrabold",
      border: "border-purple-300",
      spot: topRated,
      icon: Star,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-400 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/30">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Motor Inteligente de Geossugestão</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">Estacionar Perto de Mim</h2>
          <p className="text-xs text-slate-300">
            Análise em tempo real baseada na sua posição exata para encontrar a garagem ideal em poucos toques.
          </p>
        </div>

        <button
          onClick={requestUserLocation}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 shrink-0 transition"
        >
          <Navigation className="w-4 h-4 text-sky-200" />
          <span>{userLocation.isLive ? "📍 GPS Ativo" : "📍 Usar Minha Localização"}</span>
        </button>
      </div>

      {/* Grid of 4 Smart Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((item, idx) => {
          if (!item.spot) return null;
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              onClick={() => openSpotDetails(item.spot)}
              className={`bg-slate-800/90 hover:bg-slate-800 p-4 rounded-2xl border ${item.border} space-y-3 cursor-pointer transition transform hover:-translate-y-1 shadow-md flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                  <IconComp className={`w-4 h-4 ${item.color}`} />
                </div>

                <h4 className="font-extrabold text-white text-sm truncate">{item.spot.title}</h4>
                <p className="text-xs text-slate-400 truncate mt-0.5">{item.spot.address}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 font-bold">
                    <Navigation className="w-3 h-3 text-sky-400" />
                    {item.spot.distFormatted || item.spot.distance}
                  </span>
                  <span className="text-slate-400">{item.spot.walkTime}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Valor</span>
                    <span className="text-lg font-black text-sky-400">R$ {Number(item.spot.priceHourly || 6).toFixed(2)}/h</span>
                  </div>

                  <button className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    Ver vaga
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
