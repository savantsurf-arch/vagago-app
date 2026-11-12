import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  calculateBookingPricing,
  getOccupiedSlotsForDate,
  isSpotAvailableOnDay,
  addDaysToDateStr,
  getWeekdayLabel
} from '../services/pricingUtils';
import { getWhatsAppUrl } from '../services/brandConfig';
import { trackEvent } from '../services/telemetry';
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
  AlertCircle,
  Key,
  Share2,
  Sparkles,
  MapPin,
  Loader2,
  Mail,
  MessageCircle
} from 'lucide-react';

export const BookingFlowModal = () => {
  const {
    selectedSpot,
    isBookingFlowOpen,
    setIsBookingFlowOpen,
    vehicles = [],
    addVehicle,
    createBooking,
    checkAvailability,
    bookings = [],
    searchFilters,
    coupons = [],
    currentUser,
    setActiveTab,
    switchRole
  } = useApp();

  const safeUser = currentUser || { credits: 20 };
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeCoupons = Array.isArray(coupons) ? coupons : [];

  // Multi-step form state (1: Schedule & Vehicle -> 2: Payment -> 3: Confirmation)
  const [step, setStep] = useState(1);

  // Form selections
  const [planType, setPlanType] = useState('hora'); // 'hora' | 'diaria' | 'mensal'
  const [daysCount, setDaysCount] = useState(1);
  const [monthsCount, setMonthsCount] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [selectedVehicleId, setSelectedVehicleId] = useState(safeVehicles[0]?.id || 'new');
  const [availabilityError, setAvailabilityError] = useState('');
  const [confirmEmail, setConfirmEmail] = useState(currentUser?.email || '');
  const [emailDispatchState, setEmailDispatchState] = useState({ status: 'idle', message: '' });

  // New vehicle form
  const [isAddingNewVehicle, setIsAddingNewVehicle] = useState(safeVehicles.length === 0);
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    plate: '',
    color: '',
    type: 'Carro pequeno'
  });

  // Payment method & Coupon
  const [paymentMethod, setPaymentMethod] = useState('PIX'); // 'PIX' | 'Carteira VagaGo' | 'Cartão de Crédito'
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixCharge, setPixCharge] = useState({
    loading: false,
    error: '',
    paymentId: null,
    provider: 'sandbox',
    mode: 'sandbox',
    status: 'PENDING',
    pixCopyPaste: '',
    split: null
  });

  // Final booking outcome
  const [completedBooking, setCompletedBooking] = useState(null);

  // Sync default vehicle when vehicles list updates
  useEffect(() => {
    if (safeVehicles.length > 0 && (!selectedVehicleId || selectedVehicleId === 'new')) {
      setSelectedVehicleId(safeVehicles[0].id);
      setIsAddingNewVehicle(false);
    } else if (safeVehicles.length === 0) {
      setSelectedVehicleId('new');
      setIsAddingNewVehicle(true);
    }
  }, [safeVehicles.length]);

  // Reset state when opening modal with a new spot
  useEffect(() => {
    if (isBookingFlowOpen) {
      setStep(1);
      setAvailabilityError('');
      setCouponError('');
      setAppliedCoupon(null);
      setCouponCode('');
      setCompletedBooking(null);
      setIsProcessing(false);
      setEmailDispatchState({ status: 'idle', message: '' });
      setConfirmEmail(currentUser?.email || '');
      setPixCharge({
        loading: false,
        error: '',
        paymentId: null,
        provider: 'sandbox',
        mode: 'sandbox',
        status: 'PENDING',
        pixCopyPaste: '',
        split: null
      });
      const f = searchFilters || {};
      setPlanType(f.billingType === 'diaria' || f.billingType === 'mensal' ? f.billingType : 'hora');
      setDaysCount(Number(f.daysCount || 1));
      setMonthsCount(Number(f.monthsCount || 1));
      setSelectedDate(f.date || new Date().toISOString().split('T')[0]);
      if (f.startTime) setStartTime(f.startTime);
      if (f.endTime) setEndTime(f.endTime);
    }
  }, [isBookingFlowOpen, selectedSpot?.id, currentUser?.email, searchFilters]);

  const calendarDays = useMemo(() => {
    if (!selectedSpot) return [];
    const todayStr = new Date().toISOString().split('T')[0];
    return Array.from({ length: 10 }, (_, idx) => {
      const dStr = addDaysToDateStr(todayStr, idx);
      const occupied = getOccupiedSlotsForDate(bookings, selectedSpot.id, dStr);
      const dayAllowed = isSpotAvailableOnDay(selectedSpot, dStr);
      return {
        dateStr: dStr,
        dayNum: dStr.slice(8, 10),
        monthNum: dStr.slice(5, 7),
        weekday: getWeekdayLabel(dStr),
        occupiedCount: occupied.length,
        dayAllowed
      };
    });
  }, [bookings, selectedSpot]);

  const hourlyRate = Number(selectedSpot?.priceHourly || selectedSpot?.price_hourly || 6);
  const pricing = calculateBookingPricing({
    spot: selectedSpot || { priceHourly: 6 },
    planType,
    startTime,
    endTime,
    days: daysCount,
    months: monthsCount
  });
  const totalHours = pricing.totalHours;
  const durationM = pricing.durationMinutes;
  const subtotal = pricing.subtotal;
  const endDateCalculated =
    planType === 'diaria'
      ? addDaysToDateStr(selectedDate, Math.max(0, daysCount - 1))
      : planType === 'mensal'
      ? addDaysToDateStr(selectedDate, Math.max(1, monthsCount * 30 - 1))
      : selectedDate;
  const effectiveStartTime = planType === 'hora' ? startTime : '08:00';
  const effectiveEndTime = planType === 'hora' ? endTime : '20:00';
  const occupiedSlotsSelectedDate = selectedSpot
    ? getOccupiedSlotsForDate(bookings, selectedSpot.id, selectedDate)
    : [];

  // Calculate coupon discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'fixed' || appliedCoupon.discountAmount) {
      discount = Number(appliedCoupon.discountAmount || 0);
    } else {
      const pct = Number(appliedCoupon.discountPercent || 0);
      let calc = subtotal * (pct / 100);
      if (appliedCoupon.maxDiscount && calc > appliedCoupon.maxDiscount) {
        calc = appliedCoupon.maxDiscount;
      }
      discount = calc;
    }
  }
  discount = Math.min(discount, subtotal);
  const totalPrice = Math.max(0, subtotal - discount);

  const generatePixCharge = async () => {
    setPixCharge((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const resp = await fetch('/api/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          spaceTitle: selectedSpot?.title || 'Garagem VagaGo',
          payerName: currentUser?.name || 'Motorista VagaGo',
          payerEmail: currentUser?.email || 'motorista@vagago.com.br',
          payerCpf: currentUser?.cpf,
          hostWalletId: selectedSpot?.asaasWalletId || selectedSpot?.ownerWalletId || null
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || 'Não foi possível gerar o QR Code Pix.');
      }
      setPixCharge({
        loading: false,
        error: '',
        paymentId: data.paymentId,
        provider: data.provider || 'sandbox',
        mode: data.mode || 'sandbox',
        status: data.status || 'PENDING',
        pixCopyPaste: data.pixCopyPaste || '',
        split: data.split || null
      });
    } catch (err) {
      setPixCharge((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || 'Erro de comunicação com o gateway Pix. Tente gerar novamente.'
      }));
    }
  };

  useEffect(() => {
    if (isBookingFlowOpen && selectedSpot && step === 2 && paymentMethod === 'PIX') {
      generatePixCharge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBookingFlowOpen, selectedSpot?.id, step, paymentMethod, totalPrice]);

  if (!isBookingFlowOpen || !selectedSpot) return null;

  // Handlers
  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom.');
      return;
    }
    const found = safeCoupons.find(
      (c) => c && c.code && c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );
    if (found) {
      setAppliedCoupon(found);
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleAddNewVehicle = () => {
    const cleanPlate = newVehicle.plate.trim().toUpperCase();
    const cleanModel = newVehicle.model.trim();

    if (!cleanPlate || !cleanModel) {
      setAvailabilityError('Preencha ao menos a placa e o modelo do veículo.');
      return;
    }

    const createdVehicle = {
      id: `veh_${Date.now()}`,
      brand: newVehicle.brand.trim() || 'Veículo',
      model: cleanModel,
      plate: cleanPlate,
      color: newVehicle.color.trim() || 'Prata',
      type: newVehicle.type || 'Carro'
    };

    if (typeof addVehicle === 'function') {
      addVehicle(createdVehicle);
    }

    setSelectedVehicleId(createdVehicle.id);
    setIsAddingNewVehicle(false);
    setAvailabilityError('');
  };

  const handleProceedToPayment = () => {
    setAvailabilityError('');

    if (!selectedDate) {
      setAvailabilityError('Por favor, escolha a data da reserva.');
      return;
    }

    if (planType === 'hora') {
      if (effectiveEndTime <= effectiveStartTime) {
        setAvailabilityError('O horário de saída deve ser posterior ao de entrada.');
        return;
      }

      if (durationM < 30) {
        setAvailabilityError('A permanência mínima na vaga é de 30 minutos.');
        return;
      }
    }

    // If user is filling new vehicle form, validate and register
    if (isAddingNewVehicle) {
      if (!newVehicle.plate.trim() || !newVehicle.model.trim()) {
        setAvailabilityError('Preencha a placa e o modelo do novo veículo antes de avançar.');
        return;
      }
      handleAddNewVehicle();
    } else if (!selectedVehicleId) {
      setAvailabilityError('Selecione ou cadastre um veículo para a reserva.');
      return;
    }

    // Availability validation engine check
    if (typeof checkAvailability === 'function') {
      const check = checkAvailability(
        selectedSpot.id,
        selectedDate,
        effectiveStartTime,
        effectiveEndTime,
        endDateCalculated,
        planType
      );
      if (!check.available) {
        setAvailabilityError(check.reason || 'Este horário não está disponível para esta vaga.');
        return;
      }
    }

    setStep(2);
  };

  const handleConfirmBooking = async () => {
    if (isProcessing) return;
    setAvailabilityError('');

    // Wallet balance validation
    if (paymentMethod === 'Carteira VagaGo') {
      const userBalance = Number(safeUser?.credits || 0);
      if (userBalance < totalPrice) {
        setAvailabilityError(
          `Saldo insuficiente na sua Carteira VagaGo (Saldo atual: R$ ${userBalance.toFixed(2)}). Escolha PIX Instantâneo ou Cartão de Crédito.`
        );
        return;
      }
    }

    setIsProcessing(true);

    if (paymentMethod === 'PIX' && pixCharge.mode === 'live') {
      const latestStatus = await checkPixPaymentStatus();
      if (latestStatus === 'FAILED') {
        setAvailabilityError('O Pix expirou ou falhou no gateway. Gere um novo QR Code Pix para continuar.');
        setIsProcessing(false);
        return;
      }
      if (latestStatus !== 'APPROVED') {
        setAvailabilityError('Pagamento Pix ainda não foi compensado pelo banco. Conclua o Pix no app do seu banco e clique novamente.');
        setIsProcessing(false);
        return;
      }
    }

    // Double check availability immediately before persisting (anti-duplicate lock)
    if (typeof checkAvailability === 'function') {
      const check = checkAvailability(
        selectedSpot.id,
        selectedDate,
        effectiveStartTime,
        effectiveEndTime,
        endDateCalculated,
        planType
      );
      if (!check.available) {
        setAvailabilityError(
          check.reason || 'Desculpe, este horário acabou de ser reservado por outro motorista.'
        );
        setIsProcessing(false);
        return;
      }
    }

    let vehicleData = safeVehicles.find((v) => v.id === selectedVehicleId);
    if (!vehicleData) {
      vehicleData = {
        brand: newVehicle.brand || 'Veículo',
        model: newVehicle.model || 'Modelo Padrão',
        plate: newVehicle.plate || 'ABC-1D23',
        color: newVehicle.color || 'Prata',
        type: newVehicle.type || 'Carro'
      };
    }

    const bookingPayload = {
      spaceId: selectedSpot.id,
      spaceTitle: selectedSpot.title,
      spaceAddress: selectedSpot.address,
      ownerId: selectedSpot.ownerId || selectedSpot.owner_id,
      ownerName: selectedSpot.ownerName || selectedSpot.owner_name,
      ownerEmail: selectedSpot.ownerEmail || selectedSpot.owner_email,
      ownerPhone: selectedSpot.ownerPhone || selectedSpot.owner_phone,
      ownerAvatar: selectedSpot.ownerAvatar || selectedSpot.owner_avatar,
      hostId: selectedSpot.ownerId || selectedSpot.owner_id,
      hostName: selectedSpot.ownerName || selectedSpot.owner_name,
      hostEmail: selectedSpot.ownerEmail || selectedSpot.owner_email,
      hostPhone: selectedSpot.ownerPhone || selectedSpot.owner_phone,
      date: selectedDate,
      startDate: selectedDate,
      endDate: endDateCalculated,
      startTime: effectiveStartTime,
      endTime: effectiveEndTime,
      planType,
      totalHours,
      subtotal,
      discountAmount: discount,
      totalPrice,
      paymentMethod,
      secretAccessInstructions:
        selectedSpot.entranceInstructions ||
        selectedSpot.secretAccessInstructions ||
        "🔐 Portão Eletrônico com identificação de placa. Ao chegar, buzine 1x ou interfone para o anfitrião.",
      vehicle: vehicleData
    };

    try {
      let result;
      if (typeof createBooking === 'function') {
        result = createBooking(bookingPayload);
      } else {
        result = {
          id: `bk_${Date.now()}`,
          bookingNumber: `VG-${Math.floor(10000 + Math.random() * 90000)}`,
          spaceTitle: selectedSpot.title,
          spaceAddress: selectedSpot.address,
          date: selectedDate,
          startTime,
          endTime,
          paymentMethod,
          totalPrice,
          vehicle: vehicleData,
          bookingStatus: selectedSpot.requireApproval ? 'Aguardando Aprovação' : 'Confirmado',
          qrCodeData: `VAGAGO-GATE-${Date.now()}`
        };
      }

      // Registra validação no servidor quando online
      fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingPayload,
          bookingNumber: result?.bookingNumber
        })
      }).catch(() => {});

      trackEvent('booking_completed', {
        planType,
        paymentMethod,
        value: totalPrice
      });

      setCompletedBooking(result);
      setStep(3);

      if (typeof confetti === 'function') {
        try {
          confetti({
            particleCount: 110,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } catch (err) {
      setAvailabilityError(err.message || 'Erro ao processar reserva. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopySummary = () => {
    if (!completedBooking) return;
    const summaryText = `🚗 COMPROVANTE DE RESERVA - VAGAGO
Reserva: #${completedBooking.bookingNumber || completedBooking.id}
Vaga: ${completedBooking.spaceTitle}
Endereço: ${completedBooking.spaceAddress}
Data: ${completedBooking.date}
Horário: ${completedBooking.startTime} às ${completedBooking.endTime} (${completedBooking.totalHours || totalHours}h)
Veículo: ${completedBooking.vehicle?.brand || ''} ${completedBooking.vehicle?.model || ''} (${completedBooking.vehicle?.plate || ''})
Valor: R$ ${Number(completedBooking.totalPrice || 0).toFixed(2)} (${completedBooking.paymentMethod})
Status: ${completedBooking.bookingStatus || 'Confirmado'}
Instruções de Acesso: ${completedBooking.secretAccessInstructions || 'Liberado'}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  const pixCopyString =
    pixCharge.pixCopyPaste ||
    `00020126580014br.gov.bcb.pix0136vagago-pix-gateway-key-20265204000053039865405${totalPrice.toFixed(2)}5802BR5920VAGAGO PLATAFORMA LTDA6009ITABUNA62070503***6304E8A1`;

  const checkPixPaymentStatus = async () => {
    if (!pixCharge.paymentId) return 'APPROVED';
    try {
      const resp = await fetch(
        `/api/pix/status?paymentId=${encodeURIComponent(pixCharge.paymentId)}&provider=${encodeURIComponent(
          pixCharge.provider || 'sandbox'
        )}`
      );
      const data = await resp.json();
      if (resp.ok && data.status) {
        setPixCharge((prev) => ({ ...prev, status: data.status }));
        return data.status;
      }
    } catch {
      // Fallback para offline/dev local sem serverless
      return pixCharge.mode === 'sandbox' ? 'APPROVED' : 'PENDING';
    }
    return pixCharge.status;
  };

  const spotPhoto =
    (selectedSpot.photos && selectedSpot.photos[0]) ||
    selectedSpot.facadePhoto ||
    "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80";

  const handleSendEmailConfirmation = async () => {
    if (!completedBooking || !confirmEmail.includes('@')) {
      setEmailDispatchState({ status: 'error', message: 'Informe um e-mail válido para enviar o comprovante.' });
      return;
    }
    setEmailDispatchState({ status: 'sending', message: 'Enviando comprovante com QR Code...' });
    try {
      const resp = await fetch('/api/bookings/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: confirmEmail.trim(),
          bookingNumber: completedBooking.bookingNumber || completedBooking.id,
          spaceTitle: completedBooking.spaceTitle,
          spaceAddress: completedBooking.spaceAddress,
          date: completedBooking.date,
          startTime: completedBooking.startTime,
          endTime: completedBooking.endTime,
          totalPrice: completedBooking.totalPrice,
          qrCodeData: completedBooking.qrCodeData || completedBooking.bookingNumber,
          vehiclePlate: completedBooking.vehicle?.plate
        })
      });
      const data = await resp.json();
      setEmailDispatchState({
        status: resp.ok ? 'sent' : 'error',
        message: data.message || data.error || 'Confirmação processada.'
      });
    } catch {
      setEmailDispatchState({
        status: 'error',
        message: 'Servidor de e-mail indisponível offline. Copie ou envie via WhatsApp abaixo.'
      });
    }
  };

  const getBookingWhatsAppHref = () => {
    if (!completedBooking) return getWhatsAppUrl();
    const qrVal = completedBooking.qrCodeData || completedBooking.bookingNumber || completedBooking.id;
    const msg = `✅ Reserva VagaGo #${completedBooking.bookingNumber || completedBooking.id}\n📍 Vaga: ${completedBooking.spaceTitle}\n🗺️ Endereço: ${completedBooking.spaceAddress}\n📅 Data: ${completedBooking.date} (${completedBooking.startTime} às ${completedBooking.endTime})\n🚗 Placa: ${completedBooking.vehicle?.plate || 'Cadastrada'}\n💰 Pago: R$ ${Number(completedBooking.totalPrice || 0).toFixed(2)}\n🔑 Código QR: ${qrVal}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fluxo de reserva de garagem"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header with Step Tracker */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                  title="Voltar ao agendamento"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {step === 1 && "1. Agendamento e Veículo"}
                  {step === 2 && "2. Pagamento e Confirmação"}
                  {step === 3 && "Reserva Confirmada! 🎉"}
                </h3>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {step === 1 && "Defina a data, horário de permanência e selecione seu carro"}
                  {step === 2 && "Revise os valores e escolha a forma de pagamento segura"}
                  {step === 3 && "Guarde o comprovante e apresente o QR Code no portão"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsBookingFlowOpen(false);
                setStep(1);
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modern Stepper Indicator */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/70">
            <div className={`flex items-center gap-2 text-xs font-bold ${
              step === 1 ? 'text-sky-600' : step > 1 ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === 1 ? 'bg-sky-600 text-white ring-4 ring-sky-100' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span>Agendamento</span>
            </div>

            <div className={`flex-1 h-0.5 rounded-full ${step > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            <div className={`flex items-center gap-2 text-xs font-bold ${
              step === 2 ? 'text-sky-600' : step > 2 ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === 2 ? 'bg-sky-600 text-white ring-4 ring-sky-100' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <span>Pagamento</span>
            </div>

            <div className={`flex-1 h-0.5 rounded-full ${step === 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            <div className={`flex items-center gap-2 text-xs font-bold ${
              step === 3 ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === 3 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </div>
              <span>Confirmação</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* STEP 1: Date, Time & Vehicle */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Spot Mini Card */}
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 flex items-center gap-4">
                <img
                  src={spotPhoto}
                  alt={selectedSpot.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm border border-sky-200/60"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-100 text-sky-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      Vaga Verificada
                    </span>
                    {(selectedSpot.isCovered || selectedSpot.covered) && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Coberta
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate mt-1">
                    {selectedSpot.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{selectedSpot.address}</span>
                  </p>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-sm font-black text-sky-700">R$ {hourlyRate.toFixed(2)}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">/hora</span>
                  </div>
                </div>
              </div>

              {/* Calendário de Disponibilidade, Modalidade e Horário */}
              <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>Calendário de Disponibilidade</span>
                  </label>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                    {pricing.quantity} {pricing.unitLabel} • R$ {pricing.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Seletor Hora / Diária / Mensal */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-extrabold">
                  {[
                    { id: 'hora', label: `Hora (R$ ${hourlyRate.toFixed(0)})` },
                    { id: 'diaria', label: `Diária (R$ ${Number(selectedSpot.priceDaily || hourlyRate * 5).toFixed(0)})` },
                    { id: 'mensal', label: `Mensal (R$ ${Number(selectedSpot.priceMonthly || hourlyRate * 45).toFixed(0)})` }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPlanType(opt.id)}
                      className={`py-2 px-1 rounded-lg transition cursor-pointer ${
                        planType === opt.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Strip Calendário Visual (Próximos 10 dias) */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {calendarDays.map((day) => {
                    const isSelected = selectedDate === day.dateStr;
                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        disabled={!day.dayAllowed}
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`min-w-[54px] py-2 px-1.5 rounded-xl border text-center transition shrink-0 cursor-pointer ${
                          !day.dayAllowed
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                            : day.occupiedCount > 0
                            ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <div className="text-[10px] font-bold uppercase opacity-80">{day.weekday}</div>
                        <div className="text-sm font-black leading-tight">{day.dayNum}/{day.monthNum}</div>
                        <div className="text-[9px] font-bold mt-0.5">
                          {!day.dayAllowed ? 'Fechado' : day.occupiedCount > 0 ? `${day.occupiedCount} res.` : 'Livre'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Data de Entrada</span>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                    />
                  </div>

                  {planType === 'hora' ? (
                    <>
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">Horário de Entrada</span>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">Horário de Saída</span>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                        />
                      </div>
                    </>
                  ) : planType === 'diaria' ? (
                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Quantidade de Diárias (até {endDateCalculated.split('-').reverse().join('/')})</span>
                      <input
                        type="number"
                        min="1"
                        max="29"
                        value={daysCount}
                        onChange={(e) => setDaysCount(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Duração Mensal (até {endDateCalculated.split('-').reverse().join('/')})</span>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={monthsCount}
                        onChange={(e) => setMonthsCount(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                {occupiedSlotsSelectedDate.length > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-900">
                    Horários já bloqueados em {selectedDate.split('-').reverse().join('/')}: {occupiedSlotsSelectedDate.map((s) => `${s.startTime}–${s.endTime}`).join(', ')}
                  </div>
                )}
              </div>

              {/* Vehicle Selection & Registration */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-sky-600" />
                    <span>Veículo para a Vaga</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewVehicle(!isAddingNewVehicle)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingNewVehicle ? "Escolher da lista" : "Cadastrar outro veículo"}
                  </button>
                </div>

                {!isAddingNewVehicle && safeVehicles.length > 0 ? (
                  <div className="space-y-2">
                    {safeVehicles.map((v) => (
                      <label
                        key={v.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                          selectedVehicleId === v.id
                            ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="vehicleSelect"
                            checked={selectedVehicleId === v.id}
                            onChange={() => setSelectedVehicleId(v.id)}
                            className="text-sky-600 focus:ring-sky-500 cursor-pointer"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">
                              {v.brand} {v.model}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              Cor: {v.color || 'Prata'} • Tipo: {v.type || 'Carro'}
                            </span>
                          </div>
                        </div>
                        <span className="bg-slate-900 text-white font-mono text-xs font-black px-2.5 py-1 rounded-lg tracking-wider">
                          {v.plate}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-800">
                        {safeVehicles.length === 0 ? "Cadastre seu veículo para prosseguir:" : "Cadastrar Novo Veículo:"}
                      </h5>
                      {safeVehicles.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddingNewVehicle(false)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Placa *</span>
                        <input
                          type="text"
                          placeholder="ABC-1D23"
                          maxLength={8}
                          value={newVehicle.plate}
                          onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 uppercase focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Modelo *</span>
                        <input
                          type="text"
                          placeholder="Ex: Onix, Corolla, Compass"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Marca / Fabricante</span>
                        <input
                          type="text"
                          placeholder="Ex: Chevrolet, Toyota, Jeep"
                          value={newVehicle.brand}
                          onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Tipo de Veículo</span>
                        <select
                          value={newVehicle.type}
                          onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                        >
                          <option value="Carro pequeno">Carro Pequeno (Hatch)</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Caminhonete">Caminhonete / Picape</option>
                          <option value="Moto">Moto</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddNewVehicle}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition cursor-pointer"
                    >
                      Salvar e Usar este Veículo
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Estadia ({totalHours} {totalHours === 1 ? 'hora' : 'horas'} x R$ {hourlyRate.toFixed(2)}):</span>
                  <span className="font-bold text-slate-800">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                  <span>Taxa de Serviço VagaGo:</span>
                  <span className="font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                    Isenta na Reserva
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Previsto:</span>
                  <span className="text-sky-600 text-lg font-black">R$ {subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Conflict Error Notice */}
              {availabilityError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5 animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <span className="font-bold block">{availabilityError}</span>
                    <span className="text-[11px] text-rose-700 mt-0.5 block">
                      Tente alterar os horários de entrada/saída ou escolher outra data.
                    </span>
                  </div>
                </div>
              )}

              {/* Continue to Step 2 Button */}
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-sm py-4 px-4 rounded-2xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Avançar para Pagamento</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* STEP 2: Payment & Coupon */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Quick Summary Recap Pill */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-slate-800">
                    {selectedDate} • {startTime} às {endTime} ({totalHours}h)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-slate-600" />
                  <span className="bg-slate-900 text-white font-mono text-[11px] font-black px-2 py-0.5 rounded-md">
                    {safeVehicles.find((v) => v.id === selectedVehicleId)?.plate || newVehicle.plate || 'Veículo'}
                  </span>
                </div>
              </div>

              {/* Height Warning Banner */}
              {selectedSpot.heightLimit && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    ⚠️ <strong>Atenção de Altura:</strong> Limite máximo de <strong>{selectedSpot.heightLimit}</strong> nesta garagem. Verifique as dimensões do seu veículo antes de pagar.
                  </span>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Escolha a Forma de Pagamento
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* PIX Instantâneo */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      paymentMethod === 'PIX'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                        Imediato
                      </span>
                    </div>
                    <div className="mt-3">
                      <span className="font-extrabold text-slate-900 text-sm block">PIX Instantâneo</span>
                      <span className="text-xs text-slate-500">QR Code com liberação rápida</span>
                    </div>
                  </button>

                  {/* Carteira VagaGo */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Carteira VagaGo')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      paymentMethod === 'Carteira VagaGo'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                        Saldo
                      </span>
                    </div>
                    <div className="mt-3">
                      <span className="font-extrabold text-slate-900 text-sm block">Carteira VagaGo</span>
                      <span className="text-xs font-black text-emerald-700">
                        R$ {Number(safeUser?.credits || 0).toFixed(2)} disponíveis
                      </span>
                    </div>
                  </button>

                  {/* Cartão de Crédito */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cartão de Crédito')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      paymentMethod === 'Cartão de Crédito'
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded-full">
                        Até 3x
                      </span>
                    </div>
                    <div className="mt-3">
                      <span className="font-extrabold text-slate-900 text-sm block">Cartão de Crédito</span>
                      <span className="text-xs text-slate-500">Checkout seguro SSL</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Coupon Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-500" />
                    Cupom Promocional
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      Remover cupom
                    </button>
                  )}
                </label>

                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: VAGAGO10 ou PRIMEIRAVAGA"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 uppercase focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">
                        Cupom <strong>{appliedCoupon.code}</strong> ativado! Desconto de R$ {discount.toFixed(2)}.
                      </span>
                    </div>
                  </div>
                )}

                {couponError && (
                  <p className="text-xs text-rose-500 font-bold">{couponError}</p>
                )}
              </div>

              {/* PIX Details Area (Asaas / Mercado Pago + Split Transparente + Tratamento de Falhas) */}
              {paymentMethod === 'PIX' && (
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      QR Code PIX ({pixCharge.provider === 'asaas' ? 'Asaas' : pixCharge.provider === 'mercadopago' ? 'Mercado Pago' : 'Sandbox'})
                    </span>
                    <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-700" />
                      {pixCharge.status === 'APPROVED' ? 'Pix Pago ✓' : pixCharge.status === 'FAILED' ? 'Expirado/Falhou' : '15 min'}
                    </span>
                  </div>

                  {pixCharge.loading ? (
                    <div className="py-8 flex flex-col items-center gap-2 text-emerald-800 text-xs font-bold">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Gerando cobrança Pix com split automático...</span>
                    </div>
                  ) : pixCharge.error ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2">
                      <p className="font-bold">{pixCharge.error}</p>
                      <button
                        type="button"
                        onClick={generatePixCharge}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Tentar gerar novo Pix
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white p-3 rounded-2xl inline-block shadow-sm ring-1 ring-emerald-200">
                        <QRCodeSVG value={pixCopyString} size={150} />
                      </div>

                      {/* Split Transparente */}
                      <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-200/80 text-[11px] font-bold text-slate-700 flex items-center justify-around gap-2">
                        <span>Anfitrião ({pixCharge.split?.hostSharePercent ?? 90}%): R$ {(pixCharge.split?.ownerPayout ?? totalPrice * 0.9).toFixed(2)}</span>
                        <span>•</span>
                        <span>Taxa VagaGo ({pixCharge.split?.feePercent ?? 10}%): R$ {(pixCharge.split?.platformFee ?? totalPrice * 0.1).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-200">
                        <input
                          type="text"
                          readOnly
                          value={pixCopyString}
                          className="text-[11px] font-mono text-slate-500 truncate flex-1 bg-transparent border-none outline-none px-1"
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
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-xs"
                        >
                          {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPix ? "Copiado!" : "Copiar Chave"}</span>
                        </button>
                      </div>

                      {pixCharge.mode === 'live' && pixCharge.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={checkPixPaymentStatus}
                          className="text-xs font-extrabold text-emerald-800 hover:underline cursor-pointer"
                        >
                          Já paguei — Verificar confirmação Pix agora
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Carteira VagaGo Balance Notice */}
              {paymentMethod === 'Carteira VagaGo' && (
                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  Number(safeUser?.credits || 0) >= totalPrice
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2 font-black">
                    <Wallet className="w-4 h-4" />
                    <span>Saldo na Carteira: R$ {Number(safeUser?.credits || 0).toFixed(2)}</span>
                  </div>
                  <p className="text-[11px]">
                    {Number(safeUser?.credits || 0) >= totalPrice
                      ? "✓ Saldo suficiente. O valor da estadia será debitado imediatamente da sua conta sem taxas adicionais."
                      : "⚠️ Saldo insuficiente para cobrir esta reserva. Recarregue seus créditos ou pague via PIX / Cartão."}
                  </p>
                </div>
              )}

              {/* Cartão de Crédito Simulator Info */}
              {paymentMethod === 'Cartão de Crédito' && (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs space-y-2 text-sky-950">
                  <div className="flex items-center gap-2 font-black">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Transação Criptografada SSL 256-bit</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    O pagamento com cartão é processado com total proteção contra fraudes. Você pode optar por pagar à vista ou parcelar em até 3x no fechamento.
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>
                    Subtotal ({pricing.quantity} {pricing.unitLabel} × R$ {pricing.unitRate.toFixed(2)}):
                  </span>
                  <span className="font-bold text-slate-800">R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>Desconto do Cupom ({appliedCoupon?.code}):</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Taxa da Plataforma:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Grátis (Piloto VagaGo)
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Valor Final A Pagar:</span>
                  <span className="text-emerald-600 text-2xl font-black">R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Confirmation Error Notice */}
              {availabilityError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-bold">{availabilityError}</span>
                </div>
              )}

              {/* Confirm Booking CTA with double-click prevention */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmBooking}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm py-4 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processando e garantindo sua vaga...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirmar Reserva e Pagar R$ {totalPrice.toFixed(2)}</span>
                  </>
                )}
              </button>

            </div>
          )}

          {/* STEP 3: Confirmation & Digital Receipt with Gate QR Code */}
          {step === 3 && completedBooking && (
            <div className="space-y-6 text-center py-2">
              
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {completedBooking.bookingStatus === 'Aguardando Aprovação' ? 'Solicitação Enviada ao Anfitrião' : 'Reserva Garantida com Sucesso'}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Reserva #{completedBooking.bookingNumber || completedBooking.id}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Sua vaga está assegurada. Apresente o QR Code no portão ou interfone ao chegar no local.
                </p>
              </div>

              {/* QR Code Container for Gate Check-in */}
              <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl max-w-sm mx-auto space-y-3">
                <div className="bg-white p-3 rounded-2xl inline-block shadow-inner">
                  <QRCodeSVG value={completedBooking.qrCodeData || completedBooking.bookingNumber || "VAGAGO-GATE"} size={170} />
                </div>
                <div className="font-mono text-xs text-sky-400 font-black tracking-widest">
                  {completedBooking.qrCodeData || completedBooking.bookingNumber}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Leitora de Portão Eletrônico / Validador VagaGo
                </p>
              </div>

              {/* Secret Gate Instructions Card */}
              {completedBooking.secretAccessInstructions && (
                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-left space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>Instruções Confidenciais de Entrada (Portão / Interfone):</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 bg-white p-3 rounded-xl border border-amber-200/80 mt-1 leading-relaxed">
                    {completedBooking.secretAccessInstructions}
                  </p>
                </div>
              )}

              {/* Digital Receipt Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Local da Vaga:</span>
                  <span className="font-bold text-slate-900 text-right">{completedBooking.spaceTitle}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Endereço:</span>
                  <span className="font-bold text-slate-900 text-right">{completedBooking.spaceAddress}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Data e Horário:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {completedBooking.date} • {completedBooking.startTime} às {completedBooking.endTime} ({completedBooking.totalHours || totalHours}h)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Veículo / Placa:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {completedBooking.vehicle?.brand || 'Veículo'} {completedBooking.vehicle?.model || ''} ({completedBooking.vehicle?.plate || 'Placa'})
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-medium">Total Pago ({completedBooking.paymentMethod}):</span>
                  <span className="font-black text-emerald-600 text-base">
                    R$ {Number(completedBooking.totalPrice || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Confirmação por WhatsApp e E-mail com QR Code */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-left">
                <span className="text-xs font-black text-slate-800 block">
                  Enviar comprovante + QR Code
                </span>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    disabled={emailDispatchState.status === 'sending'}
                    onClick={handleSendEmailConfirmation}
                    className="min-h-[42px] bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition shrink-0"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{emailDispatchState.status === 'sending' ? 'Enviando...' : 'Enviar E-mail'}</span>
                  </button>
                </div>

                {emailDispatchState.message && (
                  <p
                    className={`text-[11px] font-bold ${
                      emailDispatchState.status === 'error' ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {emailDispatchState.message}
                  </p>
                )}

                <a
                  href={getBookingWhatsAppHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Comprovante + QR Code no WhatsApp</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedSummary ? "Comprovante Copiado para a Área de Transferência!" : "Copiar Comprovante da Reserva"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsBookingFlowOpen(false);
                    setStep(1);
                    if (typeof switchRole === 'function') {
                      switchRole('CLIENTE');
                    }
                    if (typeof setActiveTab === 'function') {
                      setActiveTab('client_dashboard');
                    }
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-sm py-4 px-4 rounded-2xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Concluir e Ver Minhas Reservas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
