import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Search,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Car,
  Home
} from 'lucide-react';

export const LoginPage = ({ initialMode = 'login', onBack = null }) => {
  const {
    login,
    register,
    loginWithGoogle,
    resetPassword,
    setActiveTab,
    isAuthenticated,
    activeRole
  } = useApp();

  // Mode: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState(initialMode);

  // Common Form States
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('CLIENTE'); // 'CLIENTE' | 'PROPRIETÁRIO'
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Feedback States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect automatically
  useEffect(() => {
    if (isAuthenticated) {
      if (activeRole === 'PROPRIETÁRIO') {
        setActiveTab('owner_dashboard');
      } else if (activeRole === 'ADMINISTRADOR') {
        setActiveTab('admin_dashboard');
      } else {
        setActiveTab('landing');
      }
    }
  }, [isAuthenticated, activeRole, setActiveTab]);

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!emailOrPhone.trim()) {
      setErrorMessage('Informe seu e-mail ou telefone cadastrado.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await login(emailOrPhone.trim(), password, rememberMe);
      setIsLoading(false);
      if (!ok) {
        setErrorMessage('E-mail/telefone ou senha incorretos. Verifique suas credenciais.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Erro ao conectar ao servidor. Tente novamente.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!name.trim()) {
      setErrorMessage('Informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage('Você precisa aceitar os Termos de Uso e Privacidade.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || '(73) 99123-4567',
        role: accountType
      });
      setIsLoading(false);
      setSuccessMessage('Conta criada com sucesso! Redirecionando...');
    } catch {
      setIsLoading(false);
      setErrorMessage('Não foi possível concluir o cadastro. Tente novamente.');
    }
  };

  const handleGoogleLogin = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      setIsLoading(false);
      if (!result?.success) {
        setErrorMessage(result?.message || 'Login com Google indisponível no momento.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Falha ao autenticar com Google.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (forgotStep === 1) {
      if (!forgotEmail || !forgotEmail.includes('@')) {
        setErrorMessage('Informe um e-mail válido para receber o código.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setForgotStep(2);
        setSuccessMessage('Código de 6 dígitos enviado para seu e-mail!');
      }, 500);
    } else if (forgotStep === 2) {
      if (otpCode.trim().length < 4) {
        setErrorMessage('Digite o código de verificação recebido.');
        return;
      }
      setForgotStep(3);
      setSuccessMessage('');
    } else if (forgotStep === 3) {
      if (!newPassword || newPassword.length < 6) {
        setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
      setIsLoading(true);
      await resetPassword(forgotEmail, newPassword);
      setIsLoading(false);
      setSuccessMessage('Senha redefinida com sucesso! Você já pode entrar.');
      setTimeout(() => {
        setAuthMode('login');
        setForgotStep(1);
        clearMessages();
      }, 1400);
    }
  };

  const handleNavigateHome = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else {
      setActiveTab('landing');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#06152D] text-white flex flex-col font-sans overflow-x-hidden selection:bg-[#19E600] selection:text-[#06152D]">
      {/* Glow Ambient Lights */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#19E600]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#087BFF]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-[#00D9FF]/10 blur-3xl" />

      {/* Top Bar with Return Action */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md">
        <button
          type="button"
          onClick={handleNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-300 hover:text-white transition cursor-pointer py-1.5 px-3 rounded-xl hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 text-[#00D9FF]" />
          <span>Voltar ao início / Mapa</span>
        </button>

        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase hidden sm:inline">
          Itabuna - BA • Marketplace Oficial de Vagas
        </span>
      </header>

      {/* Main Split-Screen Container */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ==========================================================
            LADO ESQUERDO — APRESENTAÇÃO
           ========================================================== */}
        <section
          aria-label="Apresentação VagaGo"
          className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-8"
        >
          {/* Logo e Frase de Impacto */}
          <div className="space-y-4">
            <div className="inline-block">
              <img
                src="/logo-vagago.png"
                alt="VagaGo"
                width="160"
                height="80"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_4px_20px_rgba(8,123,255,0.35)]"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
              Encontre e reserve vagas de garagem de forma{' '}
              <span className="text-[#19E600] drop-shadow-[0_0_20px_rgba(25,230,0,0.5)]">
                rápida e segura!
              </span>
            </h1>
          </div>

          {/* 3 Benefícios com Ícones em Círculos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            {[
              {
                icon: Search,
                label: 'Busque vagas próximas'
              },
              {
                icon: Calendar,
                label: 'Reserve com facilidade'
              },
              {
                icon: ShieldCheck,
                label: 'Estacione com tranquilidade'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center sm:flex-col sm:items-start gap-3 p-3.5 rounded-2xl bg-[#0B1E3D]/60 border border-slate-800/80 backdrop-blur-md hover:border-[#087BFF]/50 transition duration-200"
                >
                  <div className="w-11 h-11 rounded-full border-2 border-[#19E600] bg-[#19E600]/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(25,230,0,0.25)]">
                    <Icon className="w-5 h-5 text-[#19E600]" />
                  </div>
                  <span className="text-sm font-extrabold text-slate-100 leading-snug">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Imagem Fotográfica Noturna com Efeito Iluminado */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#087BFF]/40 shadow-[0_0_40px_rgba(8,123,255,0.25)] h-64 sm:h-80 lg:h-96 group">
            <img
              src="/img/login-hero-night.jpg"
              alt="Estacionamento moderno iluminado à noite em Itabuna"
              className="w-full h-full object-cover object-bottom transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradiente de Fusão Escura no topo e laterais */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06152D] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06152D]/60 via-transparent to-transparent" />

            {/* Selo no canto da imagem */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
              <span className="bg-[#06152D]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#19E600] animate-pulse" />
                Vagas disponíveis 24h
              </span>
              <span className="bg-[#087BFF]/80 backdrop-blur-md px-3 py-1.5 rounded-xl font-black text-white shadow-sm">
                Itabuna • BA
              </span>
            </div>
          </div>

          {/* Texto Inferior Institucional */}
          <p className="text-xs sm:text-sm font-semibold text-slate-400">
            <strong className="text-[#19E600] font-black">VagaGo</strong> • Sua vaga, sempre por
            perto!
          </p>
        </section>

        {/* ==========================================================
            LADO DIREITO — CARD DE LOGIN / ACESSO
           ========================================================== */}
        <section
          aria-label="Formulário de Acesso"
          className="lg:col-span-5 w-full max-w-md mx-auto"
        >
          <div className="relative rounded-3xl p-6 sm:p-8 bg-[#0B1E3D]/85 backdrop-blur-xl border border-[#087BFF]/40 shadow-[0_0_50px_rgba(8,123,255,0.22)] space-y-5">
            {/* Logo do VagaGo Centralizada no Card */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <img
                  src="/logo-vagago.png"
                  alt="VagaGo"
                  width="130"
                  height="65"
                  className="h-10 sm:h-11 w-auto object-contain"
                />
              </div>

              {authMode === 'login' && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    Faça login para continuar
                  </p>
                </>
              )}

              {authMode === 'register' && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Crie sua conta
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    Escolha seu perfil e comece em 1 minuto
                  </p>
                </>
              )}

              {authMode === 'forgot' && (
                <>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Recuperar senha
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Redefina seu acesso com segurança
                  </p>
                </>
              )}
            </div>

            {/* Mensagens de Feedback */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="p-3 rounded-2xl bg-[#19E600]/15 border border-[#19E600]/40 text-[#19E600] text-xs font-bold flex items-center gap-2 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-[#19E600] shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ----------------------------------------------------
                FORMULÁRIO 1: LOGIN (CONFORME IMAGEM DE REFERÊNCIA)
               ---------------------------------------------------- */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Campo E-mail ou Telefone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Seu e-mail ou telefone
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="seu@email.com ou (73) 99999-9999"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full min-h-[48px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl pl-10 pr-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#087BFF] focus:ring-2 focus:ring-[#087BFF]/30 transition"
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Sua senha</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full min-h-[48px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl pl-10 pr-11 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#087BFF] focus:ring-2 focus:ring-[#087BFF]/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 text-slate-400 hover:text-white transition cursor-pointer p-1"
                      aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Lembrar de mim + Esqueceu sua senha? */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#06152D] border-slate-600 text-[#19E600] focus:ring-[#19E600] focus:ring-offset-0"
                    />
                    <span className="font-semibold text-slate-300">Lembrar de mim</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setAuthMode('forgot');
                    }}
                    className="font-extrabold text-[#19E600] hover:text-[#00D9FF] transition cursor-pointer"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>

                {/* Botão Entrar Verde Neon */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[50px] bg-[#19E600] hover:bg-[#16cc00] active:scale-[0.99] text-[#06152D] font-black text-base rounded-2xl shadow-[0_0_25px_rgba(25,230,0,0.4)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-[#06152D]" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 stroke-[2.5]" />
                      <span>Entrar</span>
                    </>
                  )}
                </button>

                {/* Divisor "ou" */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="w-full border-t border-slate-700/80" />
                  <span className="absolute bg-[#0B1E3D] px-3 text-xs font-bold text-slate-400 uppercase">
                    ou
                  </span>
                </div>

                {/* Botão Entrar com Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full min-h-[46px] bg-[#06152D] hover:bg-[#06152D]/70 text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-700/80 hover:border-slate-500 transition flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Entrar com Google</span>
                </button>

                {/* Alternar para Cadastro */}
                <div className="text-center pt-2 text-xs text-slate-300 font-medium">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setAuthMode('register');
                    }}
                    className="font-black text-[#19E600] hover:text-[#00D9FF] hover:underline cursor-pointer"
                  >
                    Cadastre-se
                  </button>
                </div>
              </form>
            )}

            {/* ----------------------------------------------------
                FORMULÁRIO 2: CADASTRO COM ESCOLHA DE PERFIL
               ---------------------------------------------------- */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Escolha do tipo de uso */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Como deseja usar o VagaGo?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('CLIENTE')}
                      className={`min-h-[44px] p-2 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        accountType === 'CLIENTE'
                          ? 'bg-[#087BFF]/25 border-[#087BFF] text-white shadow-[0_0_15px_rgba(8,123,255,0.35)]'
                          : 'bg-[#06152D]/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5 text-[#00D9FF]" />
                      <span>Motorista</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType('PROPRIETÁRIO')}
                      className={`min-h-[44px] p-2 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        accountType === 'PROPRIETÁRIO'
                          ? 'bg-[#19E600]/25 border-[#19E600] text-white shadow-[0_0_15px_rgba(25,230,0,0.35)]'
                          : 'bg-[#06152D]/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5 text-[#19E600]" />
                      <span>Anfitrião</span>
                    </button>
                  </div>
                </div>

                {/* Nome Completo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Nome completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-[44px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl px-3.5 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#087BFF]"
                  />
                </div>

                {/* Email e Telefone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">E-mail</label>
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full min-h-[44px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl px-3.5 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#087BFF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(73) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[44px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl px-3.5 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#087BFF]"
                    />
                  </div>
                </div>

                {/* Senha e Confirmação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 dígitos"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full min-h-[44px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl px-3.5 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#087BFF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">Confirmar</label>
                    <input
                      type="password"
                      required
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full min-h-[44px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl px-3.5 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#087BFF]"
                    />
                  </div>
                </div>

                {/* Checkbox Termos */}
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-[#06152D] border-slate-600 text-[#19E600] focus:ring-[#19E600]"
                  />
                  <span className="text-[11px] text-slate-300">
                    Li e concordo com os Termos de Uso e Política de Privacidade do VagaGo.
                  </span>
                </label>

                {/* Botão Cadastrar */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[48px] bg-[#19E600] hover:bg-[#16cc00] text-[#06152D] font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(25,230,0,0.35)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-[#06152D]" />
                  ) : (
                    <span>Cadastrar no VagaGo</span>
                  )}
                </button>

                <div className="text-center pt-1 text-xs text-slate-300">
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setAuthMode('login');
                    }}
                    className="font-black text-[#19E600] hover:underline cursor-pointer"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            )}

            {/* ----------------------------------------------------
                FORMULÁRIO 3: RECUPERAR SENHA
               ---------------------------------------------------- */}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotStep === 1 && (
                  <>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Digite seu e-mail cadastrado para receber o código de redefinição de senha:
                    </p>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="seu@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full min-h-[48px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#087BFF]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full min-h-[48px] bg-[#087BFF] hover:bg-[#006ce6] text-white font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(8,123,255,0.4)] transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Enviar código de recuperação</span>
                      )}
                    </button>
                  </>
                )}

                {forgotStep === 2 && (
                  <>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Digite o código de 6 dígitos enviado para <strong>{forgotEmail}</strong>:
                    </p>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">
                        Código de 6 dígitos
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Ex: 849201"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full min-h-[48px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 font-mono text-center text-lg font-black tracking-widest text-white focus:outline-none focus:border-[#087BFF]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full min-h-[48px] bg-[#087BFF] hover:bg-[#006ce6] text-white font-black text-sm rounded-2xl transition cursor-pointer"
                    >
                      Validar código
                    </button>
                  </>
                )}

                {forgotStep === 3 && (
                  <>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Digite sua nova senha de acesso:
                    </p>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Nova senha</label>
                      <input
                        type="password"
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full min-h-[48px] bg-[#06152D]/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#19E600]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full min-h-[48px] bg-[#19E600] hover:bg-[#16cc00] text-[#06152D] font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(25,230,0,0.35)] transition cursor-pointer"
                    >
                      Salvar nova senha
                    </button>
                  </>
                )}

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setAuthMode('login');
                      setForgotStep(1);
                    }}
                    className="text-xs font-extrabold text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    ← Voltar para o login
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
export default LoginPage;
