import React, { useState } from 'react';
import {
  Radio,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Flame,
  Crown,
} from 'lucide-react';

interface StudentLoginScreenProps {
  onLoginSuccess: (name: string, role: 'aluno' | 'professor') => void;
}

export const StudentLoginScreen: React.FC<StudentLoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'aluno' | 'professor'>('aluno');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedPass = password.trim();
    const trimmedName = name.trim();

    // Check if logging in as Professor Maurício (Master Password 2512)
    if (activeTab === 'professor' || trimmedPass === '2512') {
      if (trimmedPass !== '2512') {
        setErrorMsg('Senha de mestre incorreta! Acesso restrito exclusivo ao Professor Maurício.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        onLoginSuccess('Professor Maurício', 'professor');
      }, 350);
      return;
    }

    // Aluno mode (Password 3030)
    if (!trimmedName) {
      setErrorMsg('Por favor, digite o Nome do Aluno.');
      return;
    }

    if (trimmedPass !== '3030') {
      setErrorMsg('Senha de aluno incorreta! A senha liberada para alunos é 3030.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess(trimmedName, 'aluno');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/25 mb-4">
            <Radio className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            PropagandaFácil
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Sistema Oficial do Professor Maurício &bull; Refrigeração & Comércios
          </p>
        </div>

        {/* Tab Selector: Aluno vs Professor Maurício */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('aluno');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'aluno'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Acesso do Aluno
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('professor');
              setName('Professor Maurício');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'professor'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-950" />
            Professor Maurício
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {activeTab === 'professor' ? 'Identificação do Professor' : 'Nome do Aluno'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  activeTab === 'professor'
                    ? 'Professor Maurício'
                    : 'Ex: Maurício, Elias, João...'
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {activeTab === 'professor' ? 'Senha Mestre do Professor' : 'Senha de Aluno'}
              </label>
              <span className="text-[11px] text-amber-400/90 font-mono">
                {activeTab === 'professor' ? 'Acesso Restrito' : 'Senha: 3030'}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  activeTab === 'professor'
                    ? 'Digite sua senha mestre de professor'
                    : 'Digite a senha de aluno (3030)'
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>
                  {activeTab === 'professor'
                    ? 'Entrar como Professor Maurício'
                    : 'Entrar como Aluno • Ilimitado'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Security and Rights Notice */}
        <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Alunos: Áudios ilimitados sem travas com senha 3030</span>
          </div>
          <div className="flex items-center gap-2 text-amber-300/90">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Protegido contra cópia e modificação por terceiros</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Crown className="w-4 h-4 shrink-0 text-yellow-500" />
            <span>Controle Mestre exclusivo do Professor Maurício</span>
          </div>
        </div>
      </div>
    </div>
  );
};
