import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  UserCheck
} from 'lucide-react';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    resetPassword
  } = useApp();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register extra fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [accountType, setAccountType] = useState('CLIENTE'); // CLIENTE or PROPRIETÁRIO
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Forgot password OTP flow
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status & Error messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  // Password strength meter
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-slate-200', percent: 0 };
    if (pwd.length < 6) return { label: 'Fraca', color: 'bg-rose-500', percent: 33 };
    if (pwd.length < 10) return { label: 'Média', color: 'bg-amber-500', percent: 66 };
    return { label: 'Forte', color: 'bg-emerald-500', percent: 100 };
  };

  const strength = getPasswordStrength(password);

  const handleLoginSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = (email || '').trim();
    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(cleanEmail, password);
      setIsLoading(false);
      if (success) {
        setIsAuthModalOpen(false);
        setEmail('');
        setPassword('');
      } else {
        setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Erro ao conectar ao servidor. Tente novamente.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage('Você precisa aceitar os Termos de Uso do VagaGo.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || '(73) 99123-4567',
        cpf: cpf.trim() || '000.000.000-00',
        role: accountType
      });
      setIsLoading(false);
      setSuccessMessage('Conta criada com sucesso! Seja bem-vindo ao VagaGo.');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Não foi possível cadastrar a conta. Tente novamente.');
    }
  };

  const handleForgotSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');

    if (forgotStep === 1) {
      if (!email || !email.includes('@')) {
        setErrorMessage('Informe um e-mail válido para receber o código.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setForgotStep(2);
        setSuccessMessage('Código de verificação de 6 dígitos enviado para seu e-mail!');
      }, 600);
    } else if (forgotStep === 2) {
      if (otpCode.length < 4) {
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
      resetPassword(email, newPassword);
      setSuccessMessage('Senha redefinida com sucesso! Você já pode entrar.');
      setTimeout(() => {
        setAuthModalMode('login');
        setForgotStep(1);
        setSuccessMessage('');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-600 via-sky-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Lock className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {authModalMode === 'login' && 'Entrar na sua Conta'}
                {authModalMode === 'register' && 'Criar Conta no VagaGo'}
                {authModalMode === 'forgot' && 'Recuperar Senha'}
              </h3>
              <p className="text-xs text-sky-200">
                {authModalMode === 'login' && 'Acesse suas garagens, reservas e carteira'}
                {authModalMode === 'register' && 'Cadastre-se grátis em menos de 1 minuto'}
                {authModalMode === 'forgot' && 'Enviaremos um código para redefinir o acesso'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Tabs for Login vs Register */}
          {authModalMode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => { setAuthModalMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  authModalMode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Já tenho conta
              </button>
              <button
                type="button"
                onClick={() => { setAuthModalMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  authModalMode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Criar nova conta
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Sua Senha</label>
                  <button
                    type="button"
                    onClick={() => { setAuthModalMode('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="text-[11px] font-bold text-sky-600 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-semibold text-slate-600">Lembrar de mim</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white font-extrabold text-sm py-3 rounded-xl shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Entrar no VagaGo</span>}
              </button>

            </form>
          )}

          {/* REGISTER FORM */}
          {authModalMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Como deseja usar o VagaGo? *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('CLIENTE')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                      accountType === 'CLIENTE'
                        ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🚗 Quero Estacionar (Motorista)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('PROPRIETÁRIO')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                      accountType === 'PROPRIETÁRIO'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🏠 Quero Alugar Vaga (Anfitrião)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Seu Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(73) 99123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Senha de Acesso *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white"
                />
                {password && (
                  <div className="mt-1 space-y-1">
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Força da senha: {strength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Confirmar Senha *</label>
                <input
                  type="password"
                  required
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-[11px] text-slate-600">Concordo com os Termos de Uso e Política de Privacidade do VagaGo</span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Criar Minha Conta Grátis"}
              </button>

            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authModalMode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              
              {forgotStep === 1 && (
                <>
                  <p className="text-slate-600 leading-relaxed">
                    Digite seu e-mail cadastrado para receber o código de redefinição de senha.
                  </p>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">E-mail Cadastrado *</label>
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition cursor-pointer"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Enviar Código de Recuperação"}
                  </button>
                </>
              )}

              {forgotStep === 2 && (
                <>
                  <p className="text-slate-600 leading-relaxed">
                    Digite o código de 6 dígitos enviado para <strong>{email}</strong>:
                  </p>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Código de 6 Dígitos *</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Ex: 849201"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-center text-lg font-black tracking-widest text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition cursor-pointer"
                  >
                    Validar Código
                  </button>
                </>
              )}

              {forgotStep === 3 && (
                <>
                  <p className="text-slate-600 leading-relaxed">
                    Digite sua nova senha de acesso:
                  </p>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nova Senha *</label>
                    <input
                      type="password"
                      required
                      placeholder="Nova senha (mín. 6 caracteres)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition cursor-pointer"
                  >
                    Salvar Nova Senha
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="w-full text-center font-bold text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
              >
                Voltar para o Login
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
