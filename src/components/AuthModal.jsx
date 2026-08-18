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
  Sparkles,
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
    forgotPassword,
    resetPassword,
    users
  } = useApp();

  // Form states
  const [email, setEmail] = useState('matheus@cliente.com');
  const [password, setPassword] = useState('123456');
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

  const handleLoginSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');
    const targetEmail = email || 'matheus@cliente.com';
    const targetPassword = password || '123456';
    const success = login(targetEmail, targetPassword);
    if (success) {
      setIsAuthModalOpen(false);
    } else {
      setErrorMessage('Erro ao realizar o login. Tente novamente.');
    }
  };



  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage('Você precisa aceitar os Termos de Uso do VagaGo.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      register({
        name,
        email,
        password,
        phone: phone || '(11) 98888-7777',
        cpf: cpf || '123.456.789-00',
        role: accountType
      });
      setIsLoading(false);
      setIsAuthModalOpen(false);
    }, 800);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (forgotStep === 1) {
      if (!email) {
        setErrorMessage('Informe seu e-mail para receber o código.');
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

  const handleQuickLogin = (userEmail, userRole) => {
    setEmail(userEmail);
    setPassword('123456');
    login(userEmail, '123456');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-sky-600 to-sky-700 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <img src="/logo-vagago.png" alt="VagaGo" className="h-9 w-auto bg-white p-1 rounded-lg shadow-sm" />
            <div>
              <h3 className="font-extrabold text-lg">
                {authModalMode === 'login' && "Acessar sua Conta"}
                {authModalMode === 'register' && "Criar Conta no VagaGo"}
                {authModalMode === 'forgot' && "Recuperação de Senha"}
              </h3>
              <p className="text-xs text-sky-100">Sua vaga parada pode gerar dinheiro</p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2 mt-4 bg-sky-900/30 p-1 rounded-xl border border-sky-400/30 text-xs font-bold">
            <button
              onClick={() => { setAuthModalMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                authModalMode === 'login' ? 'bg-white text-sky-700 shadow-sm' : 'text-sky-100 hover:bg-white/10'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setAuthModalMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                authModalMode === 'register' ? 'bg-white text-sky-700 shadow-sm' : 'text-sky-100 hover:bg-white/10'
              }`}
            >
              Cadastrar
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">Senha *</label>
                  <button
                    type="button"
                    onClick={() => { setAuthModalMode('forgot'); setErrorMessage(''); }}
                    className="text-[11px] font-bold text-sky-600 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                type="button"
                onClick={handleLoginSubmit}
                className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-sm py-3 rounded-xl shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Entrar no VagaGo</span>
              </button>



              {/* DEMO QUICK-LOGIN BUTTONS */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block text-center">
                  🚀 Entrar com 1-Clique (Perfis de Teste)
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('matheus@cliente.com', 'CLIENTE')}
                    className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-[11px] font-black text-sky-800 text-center transition flex flex-col items-center gap-0.5 shadow-2xs"
                  >
                    <span>🚗 Cliente</span>
                    <span className="text-[9px] font-medium text-sky-600">Matheus</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('juliana@proprietario.com', 'PROPRIETÁRIO')}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[11px] font-black text-emerald-800 text-center transition flex flex-col items-center gap-0.5 shadow-2xs"
                  >
                    <span>🏠 Anfitriã</span>
                    <span className="text-[9px] font-medium text-emerald-600">Juliana</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@vagago.com.br', 'ADMINISTRADOR')}
                    className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-[11px] font-black text-purple-800 text-center transition flex flex-col items-center gap-0.5 shadow-2xs"
                  >
                    <span>🛡️ Admin</span>
                    <span className="text-[9px] font-medium text-purple-600">VagaGo</span>
                  </button>
                </div>
              </div>


            </form>
          )}

          {/* REGISTER FORM */}
          {authModalMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Conta *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('CLIENTE')}
                    className={`p-2 rounded-xl border text-center font-bold transition ${
                      accountType === 'CLIENTE'
                        ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🚗 Quero Estacionar (Cliente)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('PROPRIETÁRIO')}
                    className={`p-2 rounded-xl border text-center font-bold transition ${
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
                  placeholder="Ex: Matheus Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 98888-7777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Senha *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-[11px] text-slate-600">Concordo com os Termos de Uso e Política do VagaGo</span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
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
                    Digite seu e-mail cadastrado para receber as instruções e o código de redefinição de senha.
                  </p>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">E-mail Cadastrado *</label>
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition"
                  >
                    Enviar Código de Recuperação
                  </button>
                </>
              )}

              {forgotStep === 2 && (
                <>
                  <p className="text-slate-600 leading-relaxed">
                    Digite o código de 6 dígitos enviado para <strong>{email}</strong>:
                  </p>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Código OTP (6 Dígitos) *</label>
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
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition"
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
                      placeholder="Nova senha (mín. 6 dígitos)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition"
                  >
                    Salvar Nova Senha
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="w-full text-center font-bold text-slate-500 hover:text-slate-800 text-xs"
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
