import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { compressImageToWebP } from '../services/imageUtils';
import {
  X,
  User,
  Camera,
  Upload,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Key,
  ShieldCheck,
  Image as ImageIcon,
  Check
} from 'lucide-react';

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
];

export const EditProfileModal = () => {
  const {
    currentUser,
    isEditProfileModalOpen,
    setIsEditProfileModalOpen,
    updateUserProfile,
    activeRole
  } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionNotice, setCompressionNotice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Sync state whenever modal opens with currentUser
  useEffect(() => {
    if (isEditProfileModalOpen && currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAvatar(currentUser.avatar || PRESET_AVATARS[0]);
      setBio(currentUser.bio || '');
      setPixKey(currentUser.pixKey || '');
      setSuccessMsg('');
      setErrorMsg('');
      setCompressionNotice('');
    }
  }, [isEditProfileModalOpen, currentUser]);

  // Close on Escape
  useEffect(() => {
    if (!isEditProfileModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsEditProfileModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditProfileModalOpen, setIsEditProfileModalOpen]);

  if (!isEditProfileModalOpen || !currentUser) return null;

  // Image upload and WebP compression handler
  const handleImageFile = async (file) => {
    if (!file) return;
    try {
      setIsCompressing(true);
      setErrorMsg('');
      const compressed = await compressImageToWebP(file, 800, 0.90);
      setAvatar(compressed.dataUrl);
      setCompressionNotice(
        `✓ Foto otimizada em WebP HD (${compressed.compressedSizeKb} KB - economizou ${compressed.savingsPercent}%)`
      );
    } catch (err) {
      setErrorMsg('Não foi possível processar a imagem. Tente outra foto.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePhoneChange = (val) => {
    let digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      setPhone(digits ? `(${digits}` : '');
    } else if (digits.length <= 7) {
      setPhone(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
    } else {
      setPhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');

    if (!name || name.trim().length < 3) {
      setErrorMsg('Por favor, informe seu nome completo (mínimo 3 caracteres).');
      return;
    }

    if (typeof updateUserProfile === 'function') {
      updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatar,
        bio: bio.trim(),
        pixKey: pixKey.trim()
      });
    }

    setSuccessMsg('Perfil atualizado com sucesso!');
    setTimeout(() => {
      setSuccessMsg('');
      setIsEditProfileModalOpen(false);
    }, 1200);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsEditProfileModalOpen(false);
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <User className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Editar Meu Perfil</h3>
              <p className="text-xs text-sky-200">
                {activeRole === 'PROPRIETÁRIO' ? 'Perfil de Anfitrião VagaGo' : 'Perfil de Motorista VagaGo'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditProfileModalOpen(false)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Fechar (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Foto de Perfil & Upload / Câmera */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <label className="font-extrabold text-slate-800 block text-xs uppercase tracking-wider">
              Foto de Perfil
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                <img
                  src={avatar || PRESET_AVATARS[0]}
                  alt="Pré-visualização do perfil"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-sky-500/30 shadow-md"
                />
                {isCompressing && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    Otimizando...
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  
                  {/* Botão Câmera */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tirar Foto</span>
                  </button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />

                  {/* Botão Galeria / PC */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current && galleryInputRef.current.click()}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-600" />
                    <span>Galeria / PC</span>
                  </button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />

                </div>

                {compressionNotice ? (
                  <p className="text-[11px] text-emerald-600 font-semibold">{compressionNotice}</p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Formatos JPG, PNG ou WebP. Auto-otimização em HD sem perda de qualidade.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Avatar Presets */}
            <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block">Ou escolha um avatar padrão:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatar(presetUrl);
                      setCompressionNotice('');
                    }}
                    className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      avatar === presetUrl ? 'border-sky-600 ring-2 ring-sky-300 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={presetUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                    {avatar === presetUrl && (
                      <div className="absolute inset-0 bg-sky-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 2. Nome Completo */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>Nome Completo *</span>
            </label>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
              required
            />
          </div>

          {/* 3. Telefone / WhatsApp */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Telefone / WhatsApp</span>
            </label>
            <input
              type="text"
              placeholder="(73) 99123-4567"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          {/* 4. Chave PIX */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Chave PIX (para saques de anfitrião e reembolsos)</span>
            </label>
            <input
              type="text"
              placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          {/* 5. Biografia / Descrição */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Biografia / Descrição</span>
            </label>
            <textarea
              rows={3}
              placeholder="Escreva uma breve descrição sobre você, hábitos de estacionamento ou detalhes do seu perfil..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none resize-none leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 block text-right">
              {bio.length}/250 caracteres
            </span>
          </div>

          {/* 6. Informações de Conta (Somente Leitura) */}
          <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">E-mail Cadastrado</span>
              <span className="font-bold text-slate-800">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Conta Verificada</span>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
