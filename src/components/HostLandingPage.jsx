import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  Flame,
  MapPin,
  Calendar,
  Clock,
  Lock,
  Car,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Wallet,
  ThumbsUp,
  Zap
} from 'lucide-react';

export const HostLandingPage = () => {
  const {
    isAuthenticated,
    openLoginModal,
    openRegisterModal,
    setIsAddSpotModalOpen,
    setActiveRole,
    setActiveTab,
    demandRegions = []
  } = useApp();

  // Interactive Revenue Calculator State
  const [spotType, setSpotType] = useState('coberta'); // 'coberta' or 'descoberta'
  const [estimatedHoursPerDay, setEstimatedHoursPerDay] = useState(8);
  const [hourlyPrice, setHourlyPrice] = useState(6);
  const [daysPerMonth, setDaysPerMonth] = useState(24);

  // Revenue Math (90% to Host, 10% platform fee)
  const monthlyGross = estimatedHoursPerDay * hourlyPrice * daysPerMonth;
  const hostNetEarnings = monthlyGross * 0.9;

  const handleStartHosting = () => {
    if (isAuthenticated) {
      setActiveRole('PROPRIETÁRIO');
      setIsAddSpotModalOpen(true);
    } else {
      openRegisterModal();
    }
  };

  const handleAlreadyHost = () => {
    if (isAuthenticated) {
      setActiveRole('PROPRIETÁRIO');
      setActiveTab('owner_dashboard');
    } else {
      openLoginModal();
    }
  };

  return (
    <div className="space-y-16 pb-20 bg-slate-50">
      
      {/* HERO SECTION FOR HOSTS */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white pt-12 pb-20 border-b border-emerald-900/30">
        
        {/* Glow backdrop shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Col: Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black px-4 py-1.5 rounded-full shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>GANHE DINHEIRO COM SUA GARAGEM PARADA</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                Transforme sua vaga em <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  renda extra todo mês
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Alugue o espaço da sua casa, condomínio ou comércio em Itabuna - BA para motoristas verificados. Você define os preços, os horários e recebe <strong>90% do valor limpo no seu PIX</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleStartHosting}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-base py-4 px-8 rounded-2xl shadow-xl shadow-emerald-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Cadastrar Minha Garagem</span>
                </button>

                <button
                  type="button"
                  onClick={handleAlreadyHost}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-sm py-4 px-6 rounded-2xl border border-white/15 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Já sou Anfitrião (Entrar)</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Grátis para Anunciar</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Você Escolhe os Horários</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Repasse via PIX Direto</span>
                </div>
              </div>

            </div>

            {/* Right Col: Interactive Host Profit Calculator */}
            <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">Simulador Financeiro</span>
                  <h3 className="text-xl font-black text-white">Quanto você pode lucrar?</h3>
                </div>
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              {/* Calculator Inputs */}
              <div className="space-y-4 text-xs font-bold">
                
                {/* Hourly Price Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1.5">
                    <span>Preço por hora sugerido:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">R$ {hourlyPrice.toFixed(2)}/h</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={hourlyPrice}
                    onChange={(e) => setHourlyPrice(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>R$ 3/h (Econômica)</span>
                    <span>R$ 15/h (Área Nobre)</span>
                  </div>
                </div>

                {/* Hours per Day Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1.5">
                    <span>Horas alugadas por dia:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{estimatedHoursPerDay} horas/dia</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    step="1"
                    value={estimatedHoursPerDay}
                    onChange={(e) => setEstimatedHoursPerDay(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Days per month Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1.5">
                    <span>Dias no mês com a vaga aberta:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{daysPerMonth} dias</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="30"
                    step="1"
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

              </div>

              {/* Profit Output Box */}
              <div className="p-5 bg-gradient-to-r from-emerald-950/80 to-slate-900 rounded-2xl border border-emerald-500/40 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Seu Lucro Líquido Estimado</span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                  R$ {hostNetEarnings.toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal"> / mês</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Você recebe 90% (R$ {hostNetEarnings.toFixed(2)}) • Taxa VagaGo 10% (R$ {(monthlyGross * 0.1).toFixed(2)})
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartHosting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-sm py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Quero Começar a Lucrar</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* STRATEGIC DEMAND MAP IN ITABUNA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>Oportunidades Reais em Itabuna - BA</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                Bairros com Maior Procura por Vagas
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Se você mora ou possui imóvel em qualquer uma dessas regiões, a demanda de motoristas é garantida.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartHosting}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl transition self-start md:self-auto shrink-0 cursor-pointer shadow-md"
            >
              + Anunciar Vaga Nessas Regiões
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {demandRegions.map((region) => (
              <div key={region.id} className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">📍 {region.region}</span>
                  <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded uppercase">
                    {region.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {region.searchesLast7Days} motoristas buscaram vagas aqui nesta semana
                </div>
                <div className="pt-2 border-t border-slate-700 text-xs flex justify-between font-bold text-emerald-400">
                  <span>Média da Região:</span>
                  <span>{region.recommendedHostRevenue || "R$ 580/mês"}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* WHY HOST WITH VAGAGO (KEY ADVANTAGES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Vantagens Exclusivas</span>
          <h2 className="text-3xl font-black text-slate-900">Por que anunciar no VagaGo?</h2>
          <p className="text-slate-600 text-sm">
            Criamos uma plataforma segura, simples e rentável para qualquer proprietário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Advantage 1 */}
          <div className="p-7 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Segurança & Controle Total</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Todos os motoristas são identificados com CPF, telefone e placa do veículo. Você decide se quer aprovar cada reserva manualmente antes de liberar a entrada.
            </p>
          </div>

          {/* Advantage 2 */}
          <div className="p-7 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">90% Líquido na sua Conta</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Sem mensalidades fixas para anunciar. Ficamos apenas com 10% da taxa de serviço sobre as reservas concluídas com sucesso. O restante é 100% seu.
            </p>
          </div>

          {/* Advantage 3 */}
          <div className="p-7 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Flexibilidade Absoluta</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Precisa da vaga para você ou visitas no fim de semana? Pause o anúncio ou bloqueie horários específicos no seu calendário com apenas 1 clique.
            </p>
          </div>

        </div>

      </section>

      {/* HOW TO START IN 3 EASY STEPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Como funciona o cadastro?</h2>
            <p className="text-slate-600 text-sm">
              Leva menos de 3 minutos para colocar sua garagem no ar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 font-black rounded-2xl flex items-center justify-center mx-auto text-lg shadow-xs">
                1
              </div>
              <h3 className="font-black text-slate-900 text-base">Preencha o Assistente</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Informe o endereço em Itabuna, envie fotos do portão/vaga e determine se é coberta, livre ou presa.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 font-black rounded-2xl flex items-center justify-center mx-auto text-lg shadow-xs">
                2
              </div>
              <h3 className="font-black text-slate-900 text-base">Defina Preços e Regras</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Escolha o valor por hora ou diária e se prefere aceitar pedidos manualmente ou instantaneamente.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 font-black rounded-2xl flex items-center justify-center mx-auto text-lg shadow-xs">
                3
              </div>
              <h3 className="font-black text-slate-900 text-base">Receba os Motoristas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                O motorista apresenta o QR Code confirmado, estaciona com tranquilidade e o dinheiro cai no seu painel.
              </p>
            </div>

          </div>

          <div className="text-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleStartHosting}
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm py-4 px-8 rounded-2xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              Começar Agora — Cadastrar Minha Garagem
            </button>
          </div>

        </div>
      </section>

      {/* HOST FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Perguntas Frequentes do Anfitrião</h2>
          <p className="text-slate-600 text-xs sm:text-sm">Tudo o que você precisa saber antes de anunciar.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Preciso pagar alguma coisa para cadastrar minha vaga?",
              a: "Não! O cadastro é 100% gratuito. Você só repassa a taxa de 10% da plataforma quando receber uma reserva paga de verdade."
            },
            {
              q: "E se eu não quiser aceitar determinado carro ou motorista?",
              a: "Você pode selecionar a opção 'Aprovação Manual'. Assim, cada solicitação chega primeiro no seu painel com os dados do motorista para você aceitar ou recusar com 1 clique."
            },
            {
              q: "Como o motorista tem acesso à garagem?",
              a: "Você cadastra instruções seguras no aplicativo (ex: senha de portão eletrônico ou liberação com porteiro). Essas instruções só são reveladas ao motorista após a confirmação e pagamento da reserva."
            },
            {
              q: "Como e quando recebo meu dinheiro?",
              a: "O valor líquido (90%) fica disponível no seu Painel do Anfitrião assim que a permanência é concluída. Você pode solicitar o saque PIX para sua conta a qualquer momento."
            }
          ].map((item, idx) => (
            <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item.q}</span>
              </h4>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black">
              Sua garagem parada pode pagar suas contas
            </h2>
            <p className="text-emerald-100 text-sm">
              Junte-se aos anfitriões do VagaGo em Itabuna e comece a faturar ainda hoje.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartHosting}
            className="bg-white hover:bg-slate-100 text-emerald-950 font-black text-sm py-4 px-8 rounded-2xl shadow-xl transition transform hover:scale-105 cursor-pointer"
          >
            Cadastrar Minha Garagem Agora
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img src="/logo-vagago.png" alt="VagaGo" className="h-10 w-auto bg-white p-1 rounded-lg" />
              <div>
                <div className="font-black text-lg">VagaGo Anfitriões</div>
                <div className="text-xs text-slate-400">Transformando espaços parados em renda real.</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <button onClick={() => setActiveTab('landing')} className="hover:text-white transition cursor-pointer">
                Área do Motorista
              </button>
              <button onClick={() => setActiveTab('search')} className="hover:text-white transition cursor-pointer">
                Encontrar Vagas
              </button>
              <a href="#" className="hover:text-white transition">Termos de Uso</a>
              <a href="#" className="hover:text-white transition">Privacidade</a>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            © 2026 VagaGo Tecnologia e Plataforma de Garagens LTDA. Todos os direitos reservados.
          </div>

        </div>
      </footer>

    </div>
  );
};
