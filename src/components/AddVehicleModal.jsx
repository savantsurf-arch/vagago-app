import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Car, CheckCircle2, Plus, Sparkles } from 'lucide-react';

export const AddVehicleModal = ({ isOpen, onClose, onVehicleAdded }) => {
  const { addVehicle } = useApp();

  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('Carro Passeio');
  const [isDefault, setIsDefault] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!plate || !brand || !model) {
      alert("Por favor, preencha a placa, marca e modelo do veículo.");
      return;
    }

    const newVeh = addVehicle({
      plate: plate.trim().toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      color: color.trim() || 'Prata',
      type,
      isDefault
    });

    setSuccessMsg(`Veículo ${brand} ${model} (${plate.toUpperCase()}) cadastrado com sucesso!`);

    setTimeout(() => {
      setSuccessMsg('');
      setPlate('');
      setBrand('');
      setModel('');
      setColor('');
      if (onVehicleAdded) onVehicleAdded(newVeh);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-sky-600 via-sky-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Car className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Cadastrar Novo Veículo</h3>
              <p className="text-xs text-sky-200">Adicione à sua Garagem Virtual VagaGo</p>
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

        {/* Modal Form */}
        <div className="p-6 space-y-4 text-xs">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-extrabold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Placa do Veículo *</label>
              <input
                type="text"
                placeholder="Ex: ABC-1D23"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-wider text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tipo de Veículo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="Carro Passeio">Carro Passeio</option>
                <option value="SUV / Pick-up">SUV / Pick-up</option>
                <option value="Moto">Moto</option>
                <option value="Van / Utilitário">Van / Utilitário</option>
                <option value="Veículo Elétrico">Veículo Elétrico</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Marca / Fabricante *</label>
              <input
                type="text"
                placeholder="Ex: Toyota, Honda..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Modelo *</label>
              <input
                type="text"
                placeholder="Ex: Corolla, Civic..."
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Cor do Veículo</label>
            <input
              type="text"
              placeholder="Ex: Prata, Preto, Branco, Vermelho..."
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefaultVeh"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
            />
            <label htmlFor="isDefaultVeh" className="text-xs font-bold text-slate-700 cursor-pointer">
              Definir este veículo como Principal para futuras reservas
            </label>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Veículo na Garagem Virtual</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
