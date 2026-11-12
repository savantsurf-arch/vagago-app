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
  Mail,
  Phone,
  Car,
  Home,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginPage = ({ initialMode = 'login', onBack = null }) => {
  const {
    login,
    register,
    loginWithGoogle,
    requestPasswordReset,
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
  const [showDevHelper, setShowDevHelper] = useState(false);

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
      const res = await login(emailOrPhone.trim(), password, rememberMe);
      setIsLoading(false);
      if (!res || res.success === false) {
        setErrorMessage(res?.message || 'E-mail/telefone ou senha incorretos.');
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
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || '(73) 99123-4567',
        role: accountType
      });
      setIsLoading(false);
      if (!res || res.success === false) {
        setErrorMessage(res?.message || 'Não foi possível concluir o cadastro.');
        return;
      }
      setSuccessMessage('Conta criada com sucesso! Redirecionando...');
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Não foi possível concluir o cadastro. Tente novamente.');
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
        setErrorMessage('Informe um e-mail válido para receber as instruções de recuperação.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await requestPasswordReset(forgotEmail.trim());
        setIsLoading(false);
        if (res?.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            setForgotStep(2);
          }, 1000);
        } else {
          setErrorMessage(res?.message || 'Erro ao enviar recuperação de senha.');
        }
      } catch {
        setIsLoading(false);
        setErrorMessage('Erro ao conectar ao servidor. Verifique o e-mail digitado.');
      }
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
      try {
        const res = await resetPassword(forgotEmail, newPassword);
        setIsLoading(false);
        if (res?.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            setAuthMode('login');
            setForgotStep(1);
            clearMessages();
          }, 1400);
        } else {
          setErrorMessage(res?.message || 'Erro ao redefinir senha.');
        }
      } catch {
        setIsLoading(false);
        setErrorMessage('Falha ao redefinir senha.');
      }
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
    <div className="relative min-h-screen w-full bg-[#06152D] text-white flex items-center justify-center font-sans overflow-x-hidden selection:bg-[#19E600] selection:text-[#06152D]">
      {/* ==========================================================
          DECORATIVE GRAPHIC WAVES & AMBIENT GLOWS
         ========================================================== */}

      {/* Top-Left Ribbon / Wave: Green (#19E600) to Cyan (#00D9FF) to Electric Blue (#087BFF) */}
      <svg
        className="pointer-events-none absolute top-0 left-0 w-52 sm:w-80 lg:w-[420px] h-auto z-10 select-none"
        viewBox="0 0 420 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="topLeftRibbon" x1="0%" y1="0%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#19E600" />
            <stop offset="40%" stopColor="#19E600" />
            <stop offset="75%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#087BFF" />
          </linearGradient>
          <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path
          d="M 0 0 L 260 0 C 225 35, 175 75, 130 120 C 75 175, 50 230, 0 280 Z"
          fill="url(#topLeftRibbon)"
          filter="url(#ribbonGlow)"
          opacity="0.95"
        />
      </svg>

      {/* Bottom Center / Right Curved Wave */}
      <svg
        className="pointer-events-none absolute bottom-0 right-0 sm:right-6 lg:right-16 w-80 sm:w-[520px] lg:w-[600px] h-auto z-10 opacity-80 select-none"
        viewBox="0 0 600 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bottomRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#087BFF" stopOpacity="0" />
            <stop offset="45%" stopColor="#087BFF" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#00D9FF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 110 C 180 35, 420 30, 600 110 Z"
          fill="url(#bottomRibbon)"
        />
      </svg>

      {/* Ambient Lighting Spheres */}
      <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-[#19E600]/10 blur-3xl z-0" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 w-[32rem] h-[32rem] rounded-full bg-[#087BFF]/15 blur-3xl z-0" />
      <div className="pointer-events-none absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#00D9FF]/10 blur-3xl z-0" />

      {/* ==========================================================
          PHOTOGRAPHIC NIGHT SCENERY BACKGROUND (CAR & SKYLINE)
         ========================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src="/img/login-hero-night.jpg"
          alt=""
          className="absolute bottom-0 left-0 w-full sm:w-[92%] lg:w-[72%] h-[60%] sm:h-[68%] lg:h-[75%] object-cover object-left-bottom opacity-95 select-none"
        />
        {/* Top-to-bottom dark blend into #06152D for high text contrast in upper half */}
        <div className="absolute top-0 inset-x-0 h-[50%] bg-gradient-to-b from-[#06152D] via-[#06152D]/85 to-transparent" />
        {/* Right fade to maintain contrast behind the login card */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#06152D]/30 to-[#06152D]/95 hidden lg:block" />
        {/* Soft bottom edge shade */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#06152D]/90 to-transparent" />
      </div>

      {/* ==========================================================
          MAIN CONTAINER: 2-COLUMN SPLIT SCREEN
         ========================================================== */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 min-h-screen flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ==========================================================
              LADO ESQUERDO — APRESENTAÇÃO
             ========================================================== */}
          <section
            aria-label="Apresentação VagaGo"
            className="lg:col-span-7 flex flex-col justify-between space-y-8 sm:space-y-10"
          >
            {/* Top: Logo do VagaGo */}
            <div className="space-y-6 sm:space-y-8">
              <div
                onClick={handleNavigateHome}
                className="cursor-pointer inline-block group"
                title="VagaGo — Início"
              >
                <img
                  src="/logo-vagago-tight.png"
                  alt="VagaGo"
                  width="240"
                  height="72"
                  className="h-12 sm:h-16 lg:h-20 w-auto object-contain drop-shadow-[0_4px_25px_rgba(8,123,255,0.45)] transition transform group-hover:scale-[1.02]"
                />
              </div>

              {/* Frase de Impacto */}
              <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.2]">
                Encontre e reserve vagas de garagem<br />
                de forma{' '}
                <span className="text-[#19E600] drop-shadow-[0_0_22px_rgba(25,230,0,0.6)]">
                  rápida e segura!
                </span>
              </h1>

              {/* 3 Benefícios com Ícones em Círculos Verdes e Linhas Divisórias */}
              <div className="pt-2 flex items-center gap-5 sm:gap-8 max-w-md">
                {/* 1. Busque vagas próximas */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-11 h-11 rounded-full border-[1.5px] border-[#19E600] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(25,230,0,0.35)]">
                    <Search className="w-5 h-5 text-[#19E600]" strokeWidth={2.2} />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-white leading-tight">
                    Busque<br />vagas próximas
                  </span>
                </div>

                {/* Divisor 1 */}
                <div className="h-12 w-[1px] bg-slate-700/60 shrink-0" />

                {/* 2. Reserve com facilidade */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-11 h-11 rounded-full border-[1.5px] border-[#19E600] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(25,230,0,0.35)]">
                    <Calendar className="w-5 h-5 text-[#19E600]" strokeWidth={2.2} />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-white leading-tight">
                    Reserve<br />com facilidade
                  </span>
                </div>

                {/* Divisor 2 */}
                <div className="h-12 w-[1px] bg-slate-700/60 shrink-0" />

                {/* 3. Estacione com tranquilidade */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-11 h-11 rounded-full border-[1.5px] border-[#19E600] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(25,230,0,0.35)]">
                    <ShieldCheck className="w-5 h-5 text-[#19E600]" strokeWidth={2.2} />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-white leading-tight">
                    Estacione<br />com tranquilidade
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: Texto Institucional */}
            <div className="pt-8 sm:pt-14 lg:pt-20">
              <p className="text-xs sm:text-sm font-medium text-slate-300">
                <span className="text-[#19E600] font-black">VagaGo</span>
                <span className="text-slate-400 mx-2">•</span>
                Sua vaga, sempre por perto!
              </p>
            </div>
          </section>

          {/* ==========================================================
              LADO DIREITO — CARD DE ACESSO COM BORDA DUAL GLOW
             ========================================================== */}
          <section
            aria-label="Área de Acesso"
            className="lg:col-span-5 w-full flex justify-center lg:justify-end"
          >
            {/* Moldura com Borda Dupla Gradiente Luminosa (Ciano / Azul no topo, Verde Neon embaixo) */}
            <div className="relative w-full max-w-[420px] p-[1.5px] rounded-[32px] bg-gradient-to-br from-[#00D9FF] via-[#087BFF]/70 to-[#19E600] shadow-[0_0_45px_rgba(8,123,255,0.3),0_0_35px_rgba(25,230,0,0.25)]">
              <div className="w-full rounded-[30.5px] bg-[#07162E]/92 backdrop-blur-2xl p-7 sm:p-9 flex flex-col">

                {/* Logo Centralizada no topo do Card */}
                <div className="flex justify-center mb-3">
                  <img
                    src="/logo-vagago-tight.png"
                    alt="VagaGo"
                    width="140"
                    height="42"
                    className="h-10 sm:h-11 w-auto object-contain"
                  />
                </div>

                {/* ==========================================================
                    MODO 1: LOGIN
                   ========================================================== */}
                {authMode === 'login' && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl sm:text-[26px] font-black text-white tracking-tight">
                        Bem-vindo de volta!
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                        Faça login para continuar
                      </p>
                    </div>

                    {/* Mensagens de Feedback */}
                    {errorMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    {successMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                      {/* Campo E-mail ou Telefone */}
                      <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3.5 focus-within:border-[#00D9FF] focus-within:ring-1 focus-within:ring-[#00D9FF]/40 transition group">
                        <User className="w-5 h-5 text-slate-400 group-focus-within:text-[#00D9FF] transition mr-3 shrink-0" strokeWidth={2} />
                        <input
                          type="text"
                          value={emailOrPhone}
                          onChange={(e) => setEmailOrPhone(e.target.value)}
                          placeholder="Seu e-mail ou telefone"
                          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                          autoComplete="username"
                        />
                      </div>

                      {/* Campo Senha */}
                      <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3.5 focus-within:border-[#00D9FF] focus-within:ring-1 focus-within:ring-[#00D9FF]/40 transition group">
                        <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-[#00D9FF] transition mr-3 shrink-0" strokeWidth={2} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Sua senha"
                          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-white transition cursor-pointer p-1 shrink-0"
                          aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {showPassword ? (
                            <Eye className="w-5 h-5" strokeWidth={2} />
                          ) : (
                            <EyeOff className="w-5 h-5" strokeWidth={2} />
                          )}
                        </button>
                      </div>

                      {/* Opções: Lembrar de mim & Esqueceu sua senha? */}
                      <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none group">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-[#061224] text-[#19E600] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#19E600]"
                          />
                          <span className="text-xs text-slate-300 group-hover:text-white transition">Lembrar de mim</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => { clearMessages(); setAuthMode('forgot'); }}
                          className="text-xs text-[#19E600] hover:underline font-semibold transition cursor-pointer"
                        >
                          Esqueceu sua senha?
                        </button>
                      </div>

                      {/* Botão Entrar em Verde Neon */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#19E600] hover:bg-[#16d000] text-[#06152D] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_22px_rgba(25,230,0,0.45)] hover:shadow-[0_0_30px_rgba(25,230,0,0.65)] transition transform active:scale-[0.98] cursor-pointer disabled:opacity-60"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin text-[#06152D]" />
                        ) : (
                          <>
                            <LogIn className="w-5 h-5 text-[#06152D]" strokeWidth={2.5} />
                            <span>Entrar</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Divisor "ou" */}
                    <div className="flex items-center my-4">
                      <div className="flex-1 h-[1px] bg-slate-800" />
                      <span className="px-3 text-xs text-slate-400 font-medium">ou</span>
                      <div className="flex-1 h-[1px] bg-slate-800" />
                    </div>

                    {/* Botão Entrar com Google */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-2xl bg-[#08172F] hover:bg-[#0D2140] border border-[#1B2D4B] hover:border-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-sm"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Entrar com Google</span>
                    </button>

                    {/* Rodapé: Cadastre-se */}
                    <p className="text-center text-xs sm:text-sm text-slate-400 mt-5">
                      Não tem uma conta?{' '}
                      <button
                        type="button"
                        onClick={() => { clearMessages(); setAuthMode('register'); }}
                        className="text-[#19E600] font-bold hover:underline transition cursor-pointer"
                      >
                        Cadastre-se
                      </button>
                    </p>
                  </>
                )}

                {/* ==========================================================
                    MODO 2: CADASTRO (CRIE SUA CONTA)
                   ========================================================== */}
                {authMode === 'register' && (
                  <>
                    <div className="text-center mb-5">
                      <h2 className="text-2xl sm:text-[24px] font-black text-white tracking-tight">
                        Crie sua conta
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                        Reserve ou anuncie vagas de garagem
                      </p>
                    </div>

                    {/* Mensagens de Feedback */}
                    {errorMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    {successMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                      {/* Seletor de Tipo de Conta */}
                      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#061224] border border-[#192A45]">
                        <button
                          type="button"
                          onClick={() => setAccountType('CLIENTE')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            accountType === 'CLIENTE'
                              ? 'bg-[#087BFF] text-white shadow-md'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span>Motorista</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccountType('PROPRIETÁRIO')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            accountType === 'PROPRIETÁRIO'
                              ? 'bg-[#19E600] text-[#06152D] shadow-md'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Home className="w-3.5 h-3.5" />
                          <span>Anfitrião</span>
                        </button>
                      </div>

                      {/* Nome Completo */}
                      <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3 focus-within:border-[#00D9FF] transition group">
                        <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#00D9FF] mr-3 shrink-0" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nome completo"
                          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                        />
                      </div>

                      {/* E-mail */}
                      <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3 focus-within:border-[#00D9FF] transition group">
                        <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#00D9FF] mr-3 shrink-0" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Seu melhor e-mail"
                          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                        />
                      </div>

                      {/* Telefone */}
                      <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3 focus-within:border-[#00D9FF] transition group">
                        <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-[#00D9FF] mr-3 shrink-0" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(73) 99999-9999"
                          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                        />
                      </div>

                      {/* Senha */}
                      <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3 focus-within:border-[#00D9FF] transition group">
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#00D9FF] mr-3 shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Criar uma senha (mín. 6 dígitos)"
                          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-white transition p-1"
                        >
                          {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Confirmar Senha */}
                      <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3 focus-within:border-[#00D9FF] transition group">
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#00D9FF] mr-3 shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmar senha"
                          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                        />
                      </div>

                      {/* Termos de Uso */}
                      <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-400 pt-1">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-[#061224] text-[#19E600] accent-[#19E600] mt-0.5"
                        />
                        <span>
                          Li e concordo com os{' '}
                          <a href="/termos" target="_blank" rel="noreferrer" className="text-[#00D9FF] hover:underline">
                            Termos de Uso
                          </a>{' '}
                          e Privacidade da VagaGo.
                        </span>
                      </label>

                      {/* Botão Cadastrar */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#19E600] hover:bg-[#16d000] text-[#06152D] font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(25,230,0,0.4)] transition cursor-pointer disabled:opacity-60"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <span>Criar minha conta</span>
                        )}
                      </button>
                    </form>

                    {/* Rodapé: Já tem conta? */}
                    <p className="text-center text-xs sm:text-sm text-slate-400 mt-4">
                      Já possui uma conta?{' '}
                      <button
                        type="button"
                        onClick={() => { clearMessages(); setAuthMode('login'); }}
                        className="text-[#19E600] font-bold hover:underline transition cursor-pointer"
                      >
                        Entrar
                      </button>
                    </p>
                  </>
                )}

                {/* ==========================================================
                    MODO 3: RECUPERAR SENHA
                   ========================================================== */}
                {authMode === 'forgot' && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl sm:text-[24px] font-black text-white tracking-tight">
                        Recuperar senha
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                        {forgotStep === 1 && 'Informe seu e-mail para receber as instruções'}
                        {forgotStep === 2 && 'Digite o código de verificação recebido'}
                        {forgotStep === 3 && 'Crie uma nova senha segura para sua conta'}
                      </p>
                    </div>

                    {/* Mensagens de Feedback */}
                    {errorMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    {successMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      {forgotStep === 1 && (
                        <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3.5 focus-within:border-[#00D9FF] transition group">
                          <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-[#00D9FF] mr-3 shrink-0" />
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="Seu e-mail cadastrado"
                            className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                          />
                        </div>
                      )}

                      {forgotStep === 2 && (
                        <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3.5 focus-within:border-[#00D9FF] transition group">
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Código de 6 dígitos"
                            maxLength={6}
                            className="bg-transparent text-center tracking-widest text-lg text-white placeholder-slate-400 focus:outline-none w-full font-black"
                          />
                        </div>
                      )}

                      {forgotStep === 3 && (
                        <div className="relative flex items-center bg-[#061224] border border-[#192A45] rounded-2xl px-4 py-3.5 focus-within:border-[#00D9FF] transition group">
                          <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-[#00D9FF] mr-3 shrink-0" />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nova senha (mínimo 6 dígitos)"
                            className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 rounded-2xl bg-[#19E600] hover:bg-[#16d000] text-[#06152D] font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(25,230,0,0.4)] transition cursor-pointer disabled:opacity-60"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <span>
                            {forgotStep === 1 && 'Enviar instruções'}
                            {forgotStep === 2 && 'Validar código'}
                            {forgotStep === 3 && 'Redefinir senha'}
                          </span>
                        )}
                      </button>
                    </form>

                    <p className="text-center text-xs sm:text-sm text-slate-400 mt-5">
                      Lembrou sua senha?{' '}
                      <button
                        type="button"
                        onClick={() => { clearMessages(); setAuthMode('login'); setForgotStep(1); }}
                        className="text-[#19E600] font-bold hover:underline transition cursor-pointer"
                      >
                        Voltar ao login
                      </button>
                    </p>
                  </>
                )}

              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Quick Access Helper for Testing (Discreet floating corner) */}
      <div className="fixed bottom-2 right-2 sm:bottom-3 sm:right-3 z-50">
        {!showDevHelper ? (
          <button
            type="button"
            onClick={() => setShowDevHelper(true)}
            className="opacity-25 hover:opacity-100 transition-opacity p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer"
            title="Acesso de teste rápido"
          >
            <span>🔑</span>
          </button>
        ) : (
          <div className="p-2 rounded-2xl bg-[#07162E]/95 border border-slate-700 shadow-2xl backdrop-blur-md flex items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => { setEmailOrPhone('admin@vagago.com.br'); setPassword('Admin@2026'); clearMessages(); setShowDevHelper(false); }}
              className="px-2 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold border border-purple-400/30 text-[10px]"
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmailOrPhone('rodrigo.mendonca@gmail.com'); setPassword('VagaGo@2026'); clearMessages(); setShowDevHelper(false); }}
              className="px-2 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold border border-sky-400/30 text-[10px]"
            >
              🚗 Motorista
            </button>
            <button
              type="button"
              onClick={() => { setEmailOrPhone('carlos.costa@gmail.com'); setPassword('VagaGo@2026'); clearMessages(); setShowDevHelper(false); }}
              className="px-2 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/30 text-[10px]"
            >
              🏠 Anfitrião
            </button>
            <button
              type="button"
              onClick={() => setShowDevHelper(false)}
              className="text-slate-400 hover:text-white px-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
