import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  ExternalLink,
  MessageCircle,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const ShareGarageModal = ({ spot, isOpen, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !spot) return null;

  const publicLink = `https://vaga-go.com/garagem/${spot.id}`;
  const whatsappText = `🚗 *VagaGo - Garagem em Itabuna*\n\n📍 *${spot.title}*\n📌 Endereço: ${spot.address}\n💰 Tarifa: R$ ${spot.priceHourly.toFixed(2)}/hora\n⭐ Avaliação: ${spot.rating} (${spot.reviewsCount} avaliações)\n\n🔗 Reserve pelo link: ${publicLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Share2 className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Compartilhar Garagem</h3>
              <p className="text-xs text-sky-100">Link Público da Vaga</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-center">
          
          {/* Garage Card Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-left">
            <img
              src={spot.photos[0]}
              alt={spot.title}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm truncate">{spot.title}</h4>
              <p className="text-xs text-slate-500">{spot.address}</p>
              <span className="text-xs font-black text-sky-600">R$ {spot.priceHourly.toFixed(2)}/hora</span>
            </div>
          </div>

          {/* QR Code preview */}
          <div className="bg-slate-900 p-4 rounded-2xl text-white inline-block space-y-2">
            <div className="bg-white p-2.5 rounded-xl inline-block">
              <QRCodeSVG value={publicLink} size={140} />
            </div>
            <span className="text-[10px] font-mono text-sky-400 block font-bold">
              vaga-go.com/garagem/{spot.id}
            </span>
          </div>

          {/* Copy Public Link Input */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block text-left">Link Público Direto:</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={publicLink}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
              />
              <button
                onClick={handleCopyLink}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Compartilhar no WhatsApp</span>
          </button>

        </div>

      </div>
    </div>
  );
};
