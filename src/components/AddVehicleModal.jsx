import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Car, CheckCircle2, AlertCircle, Loader2, Sparkles, Check } from 'lucide-react';

export const AddVehicleModal = ({ isOpen, onClose, onVehicleAdded, vehicleToEdit = null }) => {
  const { addVehicle, updateVehicle } = useApp();

  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('Carro Passeio');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isEditing = Boolean(vehicleToEdit && vehicleToEdit.id);

  // Sync state when modal opens or vehicleToEdit changes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setIsSaving(false);

      if (vehicleToEdit) {
        setPlate(vehicleToEdit.plate || '');
        setBrand(vehicleToEdit.brand || '');
        setModel(vehicleToEdit.model || '');
        setColor(vehicleToEdit.color || 'Prata');
        setType(vehicleToEdit.type || 'Carro Passeio');
        setIsDefault(Boolean(vehicleToEdit.isDefault || vehicleToEdit.is_default));
      } else {
        setPlate('');
        setBrand('');
        setModel('');
        setColor('Prata');
        setType('Carro Passeio');
        setIsDefault(false);
      }
    }
  }, [isOpen, vehicleToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSaving) return;
    setErrorMsg('');

    const cleanPlate = plate.trim().toUpperCase();
    const cleanModel = model.trim();
    const cleanBrand = brand.trim() || 'Veículo';

    if (!cleanPlate) {
      setErrorMsg('Informe a placa do veículo.');
      return;
    }

    if (!cleanModel) {
      setErrorMsg('Informe o modelo do veículo.');
      return;
    }

    // Aceita formatos brasileiros (ABC-1234, ABC1234, ABC1D23, ABC-1D23)
    const plateRegex = /^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/i;
    if (cleanPlate.length < 7 || !plateRegex.test(cleanPlate)) {
      setErrorMsg('Digite uma placa válida no padrão brasileiro (ex: ABC-1234 ou ABC1D23).');
      return;
    }

    try {
      setIsSaving(true);

      const vehicleData = {
        plate: cleanPlate,
        brand: cleanBrand,
        model: cleanModel,
        color: color.trim() || 'Prata',
        type,
        isDefault
      };

      let result;
      if (isEditing && typeof updateVehicle === 'function') {
        await updateVehicle(vehicleToEdit.id, vehicleData);
        result = { ...vehicleToEdit, ...vehicleData };
        setSuccessMsg(`Veículo ${cleanBrand} ${cleanModel} atualizado com sucesso!`);
      } else if (typeof addVehicle === 'function') {
        result = await addVehicle(vehicleData);
        setSuccessMsg(`Veículo ${cleanBrand} ${cleanModel} cadastrado com sucesso!`);
      }

      setTimeout(() => {
        setSuccessMsg('');
        if (onVehicleAdded) onVehicleAdded(result);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg('Não foi possível salvar o veículo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-sky-600 via-sky-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Car className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {isEditing ? "Editar Veículo" : "Cadastrar Novo Veículo"}
              </h3>
              <p className="text-xs text-sky-200">Garagem Virtual VagaGo</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer disabled:opacity-50"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Placa do Veículo *</label>
              <input
                type="text"
                placeholder="Ex: ABC-1D23"
                value={plate}
                maxLength={8}
                disabled={isSaving}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-wider text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tipo de Veículo</label>
              <select
                value={type}
                disabled={isSaving}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition disabled:opacity-60"
              >
                <option value="Carro Passeio">Carro Passeio (Hatch)</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV / Pick-up">SUV / Pick-up</option>
                <option value="Moto">Moto</option>
                <option value="Van / Utilitário">Van / Utilitário</option>
                <option value="Veículo Elétrico">Veículo Elétrico</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Marca / Fabricante</label>
              <input
                type="text"
                placeholder="Ex: Toyota, Chevrolet, Fiat..."
                value={brand}
                disabled={isSaving}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition disabled:opacity-60"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Modelo *</label>
              <input
                type="text"
                placeholder="Ex: Corolla, Onix, Compass..."
                value={model}
                disabled={isSaving}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition disabled:opacity-60"
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
              disabled={isSaving}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition disabled:opacity-60"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={isDefault}
                disabled={isSaving}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
              />
              <span>Usar como veículo principal (padrão para reservas)</span>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition cursor-pointer disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Salvar Alterações" : "Salvar Veículo"}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
