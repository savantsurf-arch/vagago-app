import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, CheckCircle2, ThumbsUp, ShieldCheck, Sparkles } from 'lucide-react';

export const ReviewModal = ({ isOpen, onClose, booking }) => {
  const { currentUser } = useApp();

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Muito Segura', 'Fácil Acesso']);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !booking) return null;

  const availableTags = [
    'Muito Segura',
    'Fácil Acesso',
    'Portão Rápido',
    'Bem Iluminada',
    'SuperHost Atencioso',
    'Preço Justo'
  ];

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-amber-600 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Avaliar Sua Experiência</h3>
              <p className="text-xs text-amber-100">{booking.spaceTitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {isSubmitted ? (
            <div className="p-6 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Obrigado pela Avaliação!</h4>
              <p className="text-xs text-slate-500">Sua avaliação ajuda outros motoristas de Itabuna a encontrarem ótimas vagas.</p>
            </div>
          ) : (
            <>
              {/* Star Rating */}
              <div className="text-center space-y-2 py-1">
                <span className="font-extrabold text-slate-700 block text-xs">Como foi sua permanência na garagem?</span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                    >
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-600 block">
                  {rating === 5 ? '⭐ Excelente! Recomendaria muito' : rating === 4 ? '👍 Muito Bom' : rating === 3 ? '😐 Razoável' : '👎 Precisa melhorar'}
                </span>
              </div>

              {/* Tags Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">O que você mais gostou nesta garagem?</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                        selectedTags.includes(tag)
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">Deixe um comentário público (opcional):</label>
                <textarea
                  rows="3"
                  placeholder="Ex: Garagem excelente, anfitrião super atencioso e portão basculante muito rápido..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleSubmitReview}
                className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enviar Avaliação de 5 Estrelas</span>
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
