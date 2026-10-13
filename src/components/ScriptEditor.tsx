import React, { useState } from 'react';
import {
  FileText,
  Megaphone,
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Edit3,
} from 'lucide-react';

export interface AdScriptData {
  title: string;
  openingHook: string;
  narrationText: string;
  offersBulletPoints: string[];
  callToAction: string;
  carroDeSomScript: string;
  whatsappText: string;
}

interface ScriptEditorProps {
  script: AdScriptData | null;
  onNarrationChange: (newText: string) => void;
  onGenerateAudioFromText: () => void;
  isAudioLoading: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  onNarrationChange,
  onGenerateAudioFromText,
  isAudioLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'locucao' | 'carro' | 'whatsapp' | 'pontos'>('locucao');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!script) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-500">
        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
        <p className="text-sm">O roteiro gerado pela IA aparecerá aqui em detalhes.</p>
      </div>
    );
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const wordCount = script.narrationText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round(wordCount / 2.3);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('locucao')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'locucao'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Texto da Locução em Áudio
        </button>

        <button
          onClick={() => setActiveTab('carro')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'carro'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Roteiro de Carro de Som
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'whatsapp'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          Texto para WhatsApp & Status
        </button>

        <button
          onClick={() => setActiveTab('pontos')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pontos'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          Destaques & Ofertas
        </button>
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-4 select-text">
        {activeTab === 'locucao' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  Você pode editar o texto da fala antes de gravar:
                </span>
                <span className="text-[11px] font-mono bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full border border-slate-700">
                  ~{wordCount} palavras | ~{estimatedSeconds}s de locução
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(script.narrationText, 'narration')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition"
                >
                  {copiedKey === 'narration' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Texto
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={script.narrationText}
              onChange={(e) => onNarrationChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
              placeholder="Digite ou ajuste o texto da propaganda falada..."
            />

            {/* Quick Button to Regenerate Voice */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-400">
                💡 O áudio é gravado exatamente com o texto acima + o fundo musical selecionado.
              </p>
              <button
                onClick={onGenerateAudioFromText}
                disabled={isAudioLoading || !script.narrationText.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAudioLoading ? 'animate-spin' : ''}`} />
                {isAudioLoading ? 'Processando Áudio...' : 'Regerar Áudio com Este Texto'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'carro' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                📢 Roteiro com repetições e chamadas fortes, ideal para carro de som na rua:
              </span>
              <button
                onClick={() => handleCopy(script.carroDeSomScript, 'carro')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition"
              >
                {copiedKey === 'carro' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Roteiro
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 whitespace-pre-line leading-relaxed font-mono">
              {script.carroDeSomScript}
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                💬 Texto pronto para copiar e disparar no WhatsApp, Grupos e Status:
              </span>
              <button
                onClick={() => handleCopy(script.whatsappText, 'whatsapp')}
                className="px-3 py-1 text-xs rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium flex items-center gap-1 transition"
              >
                {copiedKey === 'whatsapp' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copiado para a área de transferência!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Mensagem de WhatsApp
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
              {script.whatsappText}
            </div>
          </div>
        )}

        {activeTab === 'pontos' && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              {script.title}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {script.offersBulletPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-300 font-medium leading-relaxed">
                    {point}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-400">Chamada final (Call to action):</span>
              <span className="font-semibold text-emerald-400">{script.callToAction}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
