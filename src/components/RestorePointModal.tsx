import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { AdFormData } from './AdConfigForm';
import { AdScriptData } from './ScriptEditor';

export interface RestorePoint {
  id: string;
  name: string;
  createdAt: string;
  formData: AdFormData;
  script: AdScriptData | null;
  isInitialDefault?: boolean;
}

interface RestorePointModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFormData: AdFormData;
  currentScript: AdScriptData | null;
  restorePoints: RestorePoint[];
  isProfessor: boolean;
  onSaveRestorePoint: (name: string) => void;
  onApplyRestorePoint: (point: RestorePoint) => void;
  onDeleteRestorePoint: (id: string) => void;
}

export const RestorePointModal: React.FC<RestorePointModalProps> = ({
  isOpen,
  onClose,
  restorePoints,
  isProfessor,
  onSaveRestorePoint,
  onApplyRestorePoint,
  onDeleteRestorePoint,
}) => {
  const [newPointName, setNewPointName] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreatePoint = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPointName.trim() || `Ponto de Restauração - ${new Date().toLocaleTimeString('pt-BR')}`;
    onSaveRestorePoint(name);
    setNewPointName('');
    setCopiedSuccess('Ponto de restauração salvo com sucesso!');
    setTimeout(() => setCopiedSuccess(null), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(restorePoints, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pontos-de-restauracao-propagandas-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Pontos de Restauração & Backup
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Seguro
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Salve cópias de segurança de suas propagandas e restaure quando quiser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {copiedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{copiedSuccess}</span>
          </div>
        )}

        {/* Create new restore point form */}
        <form onSubmit={handleCreatePoint} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Save className="w-4 h-4" />
            Criar Novo Ponto de Restauração Agora:
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={newPointName}
              onChange={(e) => setNewPointName(e.target.value)}
              placeholder="Nome do ponto (ex: Mercado do Elias Oficial, Versão Final...)"
              className="w-full flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Ponto
            </button>
          </div>
        </form>

        {/* Restore points list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Pontos de Restauração Gravados ({restorePoints.length}):</span>
            <button
              onClick={handleExportJSON}
              className="hover:text-amber-400 flex items-center gap-1 transition"
              title="Baixar arquivo de backup"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Backup JSON
            </button>
          </div>

          {restorePoints.map((point) => (
            <div
              key={point.id}
              className={`p-4 rounded-2xl border transition space-y-2.5 ${
                point.isInitialDefault
                  ? 'bg-amber-500/10 border-amber-500/40 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-amber-300">
                    {point.name}
                  </span>
                  {point.isInitialDefault && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                      Ponto Inicial
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{point.createdAt}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 line-clamp-2">
                <strong>Comércio:</strong> {point.formData.businessName} &bull;{' '}
                <strong>Locução:</strong> &ldquo;{point.script?.narrationText || point.formData.highlights}&rdquo;
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Fundo: {point.formData.musicStyle}
                </span>

                <div className="flex items-center gap-2">
                  {!point.isInitialDefault && isProfessor && (
                    <button
                      onClick={() => onDeleteRestorePoint(point.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition"
                      title="Excluir este ponto (Professor Maurício)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!point.isInitialDefault && !isProfessor && (
                    <span
                      className="text-[11px] text-slate-500 flex items-center gap-1"
                      title="Exclusão restrita ao Professor Maurício"
                    >
                      🔒 Protegido
                    </span>
                  )}

                  <button
                    onClick={() => {
                      onApplyRestorePoint(point);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurar Agora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
