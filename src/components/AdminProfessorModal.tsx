import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Users,
  Key,
  ShieldAlert,
  FileCode2,
  CopyX,
  LogOut,
  Crown,
} from 'lucide-react';

interface AdminProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProfessorLoggedIn: boolean;
  onUnlockProfessor: (pass: string) => boolean;
  onResetMasterConfig: () => void;
  onSwitchToStudent?: () => void;
}

export const AdminProfessorModal: React.FC<AdminProfessorModalProps> = ({
  isOpen,
  onClose,
  isProfessorLoggedIn,
  onUnlockProfessor,
  onResetMasterConfig,
  onSwitchToStudent,
}) => {
  const [inputPass, setInputPass] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Security locks state (always active by default)
  const [antiCopyEnabled, setAntiCopyEnabled] = useState(true);
  const [antiModifyEnabled, setAntiModifyEnabled] = useState(true);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (onUnlockProfessor(inputPass)) {
      setSuccessMsg('Acesso Mestre do Professor Maurício confirmado com sucesso! Senha 2512 aceita.');
      setInputPass('');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg('Senha incorreta! Digite a senha mestre 2512 do Professor Maurício.');
    }
  };

  const handleReset = () => {
    onResetMasterConfig();
    setSuccessMsg('Configurações mestras e ponto inicial do Mercado do Elias restaurados com sucesso!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Painel do Professor Maurício
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  MESTRE 2512
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Central de Segurança & Proteção contra Cópia e Modificação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* If not authenticated as professor yet */}
        {!isProfessorLoggedIn ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Área Restrita ao Professor Maurício
              </p>
              <p>
                Alunos utilizam a senha <strong>3030</strong> para gerar áudios ilimitados. Para acessar o controle mestre e as configurações de segurança do sistema, digite sua senha secreta de proprietário.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  Senha Mestre do Professor:
                </label>
                <input
                  type="password"
                  required
                  value={inputPass}
                  onChange={(e) => setInputPass(e.target.value)}
                  placeholder="Digite sua senha mestre de professor"
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Autenticar como Professor Maurício
              </button>
            </form>
          </div>
        ) : (
          /* Master Control Dashboard for Professor Maurício */
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Identidade Verificada &bull; Professor Maurício
              </div>
              <p className="text-xs text-slate-300">
                Seu aplicativo está 100% blindado contra cópia, engenharia reversa e modificações por alunos ou terceiros.
              </p>
            </div>

            {/* Protections list with active status */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Travas de Segurança em Operação:
              </h4>

              {/* Protection 1: Anti-Copy */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CopyX className="w-4 h-4 text-emerald-400" />
                    <strong className="text-xs text-white">Bloqueio Anti-Cópia de Código & Inspeção</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ATIVO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Botão direito do mouse, atalhos de desenvolvedor (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S) estão bloqueados para proteger sua estrutura.
                </p>
              </div>

              {/* Protection 2: Anti-Modification */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <strong className="text-xs text-white">Trava Anti-Modificação do Sistema</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PROTEGIDO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Alunos só podem gerar áudios. Nenhum aluno pode excluir modelos mestres, apagar pontos de restauração da fábrica ou desconfigurar o app.
                </p>
              </div>

              {/* Protection 3: Students unlimited role */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <strong className="text-xs text-white">Alunos (Senha 3030) Liberados para Áudio Ilimitado</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    LIBERADO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Os alunos usam a senha 3030 e podem criar propagandas para o Mercado do Elias, açougue, distribuidora ou seus comércios livremente.
                </p>
              </div>
            </div>

            {/* Emergency Reset to Master State */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Ações Exclusivas do Professor Maurício:
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 font-bold text-xs border border-slate-700 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Restaurar Versão de Fábrica Oficial (Mercado do Elias)
              </button>

              {onSwitchToStudent && (
                <button
                  type="button"
                  onClick={onSwitchToStudent}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs border border-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  Mudar para Visão de Aluno (Simulação)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-center text-[11px] text-slate-500 shrink-0">
          Propriedade Intelectual &bull; <strong>Professor Maurício</strong> &bull; Refrigeração Maurício
          <br />
          <span className="text-[10px] text-slate-600">
            Controle Mestre do Professor Maurício &bull; Alunos: Senha 3030
          </span>
        </div>
      </div>
    </div>
  );
};
