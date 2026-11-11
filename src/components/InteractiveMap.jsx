import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, Wifi } from 'lucide-react';

const LazyInteractiveMapCanvas = lazy(() => import('./InteractiveMapCanvas'));

/**
 * Wrapper com Lazy Loading sob demanda (IntersectionObserver + React.lazy):
 * Evita baixar a biblioteca Leaflet e os blocos do mapa (tiles) antes que o usuário
 * chegue até a área do mapa, economizando dados móveis (4G/5G) e acelerando o carregamento inicial.
 */
export const InteractiveMap = ({
  eagerLoad = false,
  className = 'w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group',
  ...props
}) => {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(Boolean(eagerLoad));

  useEffect(() => {
    if (shouldLoad || !containerRef.current) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '140px 0px', threshold: 0.01 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldLoad]);

  const spotCount = Array.isArray(props.spots) ? props.spots.length : 0;

  return (
    <div ref={containerRef} className={className}>
      {!shouldLoad ? (
        <div className="w-full h-full min-h-[360px] bg-gradient-to-br from-sky-50 via-slate-50 to-emerald-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center text-sky-600">
            <MapPin className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-xs">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <Wifi className="w-3 h-3" /> Economia de dados 4G/5G ativa
            </span>
            <h4 className="font-extrabold text-slate-900 text-sm">Mapa Interativo de Itabuna</h4>
            <p className="text-xs text-slate-500">
              {spotCount > 0
                ? `${spotCount} garagem(ns) mapeada(s) pronta(s) para visualização.`
                : 'O mapa carrega automaticamente ao rolar ou com 1 toque abaixo.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShouldLoad(true)}
            className="bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-sky-200 shadow-xs transition cursor-pointer"
          >
            Carregar mapa agora
          </button>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="w-full h-full min-h-[360px] bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs font-bold">
              <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
              <span>Carregando mapa leve de Itabuna...</span>
            </div>
          }
        >
          <LazyInteractiveMapCanvas className="w-full h-full" {...props} />
        </Suspense>
      )}
    </div>
  );
};
