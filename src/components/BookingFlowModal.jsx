import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  CreditCard,
  QrCode,
  ShieldCheck,
  Plus,
  ArrowRight,
  Copy,
  Check,
  Gift,
  ChevronLeft,
  Wallet,
  AlertCircle
} from 'lucide-react';


export const BookingFlowModal = () => {
  const {
    selectedSpot,
    isBookingFlowOpen,
    setIsBookingFlowOpen,
    vehicles = [],
    addVehicle,
    createBooking,
    coupons = [],
    currentUser
  } = useApp();

  const safeUser = currentUser || { credits: 20 };
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeCoupons = Array.isArray(coupons) ? coupons : [];

  // Multi-step form state (1: Vehicle & Schedule -> 2: Payment -> 3: Confirmation)
  const [step, setStep] = useState(1);

  // Form selections
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [selectedVehicleId, setSelectedVehicleId] = useState(safeVehicles[0]?.id || 'new');
  
  // New vehicle form
  const [isAddingNewVehicle, setIsAddingNewVehicle] = useState(safeVehicles.length === 0);
  const [newVehicle, setNewVehicle] = useState({
    brand: 'Toyota',
    model: 'Corolla XEi',
    plate: 'DEF-5E67',
    color: 'Branco',
    type: 'Sedan'
  });

  // Payment method & Coupon
  const [paymentMethod, setPaymentMethod] = useState('PIX'); // PIX, CreditCard
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  // Final booking outcome
  const [completedBooking, setCompletedBooking] = useState(null);

  if (!isBookingFlowOpen || !selectedSpot) return null;

  const hourlyRate = Number(selectedSpot.priceHourly || 6);

  // Calculate hours & subtotal
  const [startH] = (startTime || '14:00').split(':').map(Number);
  const [endH] = (endTime || '18:00').split(':').map(Number);
  let totalHours = (endH || 18) - (startH || 14);
  if (totalHours <= 0) totalHours = 1;

  const subtotal = totalHours * hourlyRate;
  const discount = appliedCoupon ? (appliedCoupon.discountAmount || (subtotal * ((appliedCoupon.discountPercent || 0) / 100))) : 0;
  const totalPrice = Math.max(0, subtotal - discount);

  // Handlers
  const handleApplyCoupon = () => {
    setCouponError('');
    const found = safeCoupons.find(c => c && c.code && c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (found) {
      setAppliedCoupon(found);
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };

  const handleAddNewVehicle = () => {
    if (!newVehicle.plate || !newVehicle.model) return;
    if (typeof addVehicle === 'function') addVehicle(newVehicle);
    setIsAddingNewVehicle(false);
  };

  const handleConfirmBooking = () => {
    let vehicleData = safeVehicles.find(v => v.id === selectedVehicleId);
    if (!vehicleData) {
      vehicleData = newVehicle;
    }

    const bookingPayload = {
      spaceId: selectedSpot.id,
      spaceTitle: selectedSpot.title,
      spaceAddress: selectedSpot.address,
      ownerId: selectedSpot.ownerId,
      ownerName: selectedSpot.ownerName,
      date: selectedDate,
      startTime,
      endTime,
      totalHours,
      subtotal,
      discountAmount: discount,
      totalPrice,
      paymentMethod,
      secretAccessInstructions: selectedSpot.secretAccessInstructions || "🔐 A senha do portão eletrônico é 4821. Apresente o QR Code na portaria.",
      vehicle: vehicleData
    };

    const result = typeof createBooking === 'function' ? createBooking(bookingPayload) : {
      id: `bk_${Date.now()}`,
      bookingNumber: Math.floor(100000 + Math.random() * 900000).toString(),
      spaceTitle: selectedSpot.title,
      spaceAddress: selectedSpot.address,
      date: selectedDate,
      startTime,
      endTime,
      paymentMethod,
      totalPrice,
      vehicle: vehicleData,
      qrCodeData: `VAGAGO-BK-${Date.now()}`
    };

    setCompletedBooking(result);
    setStep(3);

    // Trigger celebration confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const pixCopyString = "00020126580014br.gov.bcb.pix0136vagago-pix-gateway-key-2026520400005303986540532.005802BR5920VAGAGO PLATAFORMA LTDA6009SAO PAULO62070503***6304E8A1";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1 hover:bg-slate-200 rounded-full mr-1 text-slate-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-extrabold text-slate-900 text-lg">
              {step === 1 && "1. Escolher Horário e Veículo"}
              {step === 2 && "2. Pagamento e Confirmação"}
              {step === 3 && "Reserva Confirmada! 🎉"}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsBookingFlowOpen(false);
              setStep(1);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: Date, Time & Vehicle */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Summary Banner */}
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-center gap-3">
                <img
                  src={(selectedSpot.photos && selectedSpot.photos[0]) || selectedSpot.facadePhoto || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"}
                  alt={selectedSpot.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedSpot.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{selectedSpot.address}</p>
                  <span className="text-xs font-extrabold text-sky-600">R$ {hourlyRate.toFixed(2)}/hora</span>
                </div>
              </div>

              {/* Date & Time Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Data e Horários</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Data da Reserva</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Horário Entrada</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Horário Saída</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Selection / Registration */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Selecione seu Veículo</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewVehicle(!isAddingNewVehicle)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingNewVehicle ? "Usar Veículo Cadastrado" : "Cadastrar Novo Veículo"}
                  </button>
                </div>

                {!isAddingNewVehicle && safeVehicles.length > 0 ? (
                  <div className="space-y-2">
                    {safeVehicles.map((v) => (
                      <label
                        key={v.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                          selectedVehicleId === v.id
                            ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="vehicleSelect"
                            checked={selectedVehicleId === v.id}
                            onChange={() => setSelectedVehicleId(v.id)}
                            className="text-sky-600 focus:ring-sky-500"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{v.brand} {v.model}</span>
                            <span className="text-xs text-slate-500">Cor: {v.color} • Tipo: {v.type}</span>
                          </div>
                        </div>
                        <span className="bg-slate-900 text-white font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg">
                          {v.plate}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h5 className="font-bold text-xs text-slate-700">Cadastrar Novo Veículo</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Placa *</span>
                        <input
                          type="text"
                          placeholder="ABC-1D23"
                          value={newVehicle.plate}
                          onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Modelo *</span>
                        <input
                          type="text"
                          placeholder="Ex: Civic, Compass, Onix"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Marca</span>
                        <input
                          type="text"
                          placeholder="Ex: Honda, Jeep, Chevrolet"
                          value={newVehicle.brand}
                          onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tipo</span>
                        <select
                          value={newVehicle.type}
                          onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                        >
                          <option value="Moto">Moto</option>
                          <option value="Carro pequeno">Carro pequeno (Hatch)</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Caminhonete">Caminhonete</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewVehicle}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition w-full cursor-pointer"
                    >
                      Salvar Veículo
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Permanência ({totalHours} horas x R$ {hourlyRate.toFixed(2)}):</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Valor Total:</span>
                  <span className="text-sky-600 text-lg">R$ {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Avançar para Pagamento</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* STEP 2: Payment & Coupon */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Forma de Pagamento</label>
                
                {/* Height Warning Banner */}
                {selectedSpot.heightLimit && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      ⚠️ <strong>Atenção de Altura:</strong> Limite de <strong>{selectedSpot.heightLimit}</strong> nesta garagem. Verifique se seu veículo atende às especificações.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Carteira VagaGo')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'Carteira VagaGo'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <span className="font-extrabold text-[11px]">Carteira VagaGo</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold">R$ {Number(safeUser?.credits || 20).toFixed(2)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'PIX'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span className="font-extrabold text-[11px]">PIX Instantâneo</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Imediato</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cartão de Crédito')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'Cartão de Crédito'
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 text-sky-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-sky-600" />
                    <span className="font-extrabold text-[11px]">Cartão Crédito</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Até 3x</span>
                  </button>
                </div>
              </div>



              {/* Coupon Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-500" />
                  Cupom de Desconto
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: VAGAGO10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Aplicar
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 font-semibold">
                    ✓ Cupom {appliedCoupon.code} aplicado com sucesso!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-rose-500 font-semibold">{couponError}</p>
                )}
              </div>

              {/* PIX Demo Box */}
              {paymentMethod === 'PIX' && (
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 uppercase">QR Code PIX Dinâmico</span>
                    <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-mono font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-700" />
                      14:59 restantes
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl inline-block shadow-sm ring-1 ring-emerald-200">
                    <QRCodeSVG value={pixCopyString} size={140} />
                  </div>

                  <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Conexão Instantânea SPI (Banco Central do Brasil)</span>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-200">
                    <input
                      type="text"
                      readOnly
                      value={pixCopyString}
                      className="text-[10px] font-mono text-slate-500 truncate flex-1 bg-transparent border-none outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(pixCopyString);
                        }
                        setCopiedPix(true);
                        setTimeout(() => setCopiedPix(false), 2000);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition cursor-pointer shadow-xs"
                    >
                      {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPix ? "✓ Copiado!" : "Copiar Chave"}</span>
                    </button>
                  </div>
                </div>
              )}


              {/* Final Breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal ({totalHours}h):</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>Desconto Cupom:</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Valor Final A Pagar:</span>
                  <span className="text-emerald-600 text-xl">R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmBooking}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirmar Reserva e Efetuar Pagamento</span>
              </button>


            </div>
          )}

          {/* STEP 3: Confirmation & Receipt with QR Code */}
          {step === 3 && completedBooking && (
            <div className="space-y-6 text-center py-2">
              
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Reserva Aprovada Instantaneamente
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Reserva #{completedBooking.bookingNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apresente este QR Code ao chegar na garagem para liberação do portão.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl max-w-sm mx-auto space-y-4">
                <div className="bg-white p-4 rounded-2xl inline-block">
                  <QRCodeSVG value={completedBooking.qrCodeData} size={180} />
                </div>
                <div className="font-mono text-xs text-sky-400 font-bold tracking-widest">
                  {completedBooking.qrCodeData}
                </div>
              </div>

              {/* Secret Instructions Card */}
              {completedBooking.secretAccessInstructions && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                    <span>🔐 Instruções Secretas de Acesso (Liberação de Entrada):</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 bg-white p-3 rounded-xl border border-amber-200/80 mt-1">
                    {completedBooking.secretAccessInstructions}
                  </p>
                </div>
              )}

              {/* Receipt Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs">

                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Local:</span>
                  <span className="font-bold text-slate-900">{completedBooking.spaceTitle}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Endereço:</span>
                  <span className="font-bold text-slate-900">{completedBooking.spaceAddress}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Data e Horário:</span>
                  <span className="font-bold text-slate-900">{completedBooking.date} • {completedBooking.startTime} às {completedBooking.endTime}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Veículo & Placa:</span>
                  <span className="font-bold text-slate-900">{completedBooking.vehicle.brand} {completedBooking.vehicle.model} ({completedBooking.vehicle.plate})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valor Pago ({completedBooking.paymentMethod}):</span>
                  <span className="font-extrabold text-emerald-600 text-sm">R$ {completedBooking.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsBookingFlowOpen(false);
                  setStep(1);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 px-4 rounded-2xl transition"
              >
                Concluir e Ver Minhas Reservas
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
