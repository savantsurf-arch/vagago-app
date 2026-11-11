import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

const DEFAULT_FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=700&q=80';

const DEFAULT_CAPTIONS = ['Portão de Entrada', 'Interior Coberto', 'Iluminação & Segurança'];

export const GaragePhotoCarousel = ({
  photos = [],
  captions = [],
  fallbackPhoto = DEFAULT_FALLBACK_PHOTO,
  altPrefix = 'Garagem VagaGo',
  heightClass = 'h-40',
  topLeftSlot = null,
  topRightSlot = null,
  bottomLeftSlot = null,
  bottomRightSlot = null
}) => {
  const validPhotos =
    Array.isArray(photos) && photos.length > 0 ? photos.filter(Boolean) : [fallbackPhoto || DEFAULT_FALLBACK_PHOTO];

  const [currentIdx, setCurrentIdx] = useState(0);
  const safeIdx = currentIdx < validPhotos.length ? currentIdx : 0;
  const activeSrc = validPhotos[safeIdx] || DEFAULT_FALLBACK_PHOTO;
  const captionText =
    (Array.isArray(captions) && captions[safeIdx]) ||
    DEFAULT_CAPTIONS[safeIdx % DEFAULT_CAPTIONS.length];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + validPhotos.length) % validPhotos.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % validPhotos.length);
  };

  return (
    <div className={`relative ${heightClass} bg-slate-200 overflow-hidden group/carousel select-none`}>
      <img
        src={activeSrc}
        alt={`${altPrefix} - ${captionText}`}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          if (e.currentTarget.src !== DEFAULT_FALLBACK_PHOTO) {
            e.currentTarget.src = DEFAULT_FALLBACK_PHOTO;
          }
        }}
        className="w-full h-full object-cover transition duration-300 group-hover/carousel:scale-103"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/20 pointer-events-none" />

      {topLeftSlot && <div className="absolute top-2.5 left-2.5 z-10">{topLeftSlot}</div>}
      {topRightSlot && <div className="absolute top-2.5 right-2.5 z-10">{topRightSlot}</div>}

      {/* Setas do Carrossel */}
      {validPhotos.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-slate-900/65 hover:bg-slate-900 text-white opacity-90 sm:opacity-0 sm:group-hover/carousel:opacity-100 transition cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próxima foto"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-slate-900/65 hover:bg-slate-900 text-white opacity-90 sm:opacity-0 sm:group-hover/carousel:opacity-100 transition cursor-pointer shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Rodapé da Foto: Legenda / Miniaturas / Indicadores */}
      <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {bottomLeftSlot}
          <span className="bg-slate-900/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 truncate backdrop-blur-xs">
            <Camera className="w-3 h-3 text-sky-300 shrink-0" />
            <span className="truncate">{captionText}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {validPhotos.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-900/75 px-1.5 py-1 rounded-full">
              {validPhotos.slice(0, 4).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx(idx);
                  }}
                  aria-label={`Ver foto ${idx + 1}`}
                  className={`h-1.5 rounded-full transition cursor-pointer ${
                    safeIdx === idx ? 'w-3.5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
          {bottomRightSlot}
        </div>
      </div>
    </div>
  );
};
