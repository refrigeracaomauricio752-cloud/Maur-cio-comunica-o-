import React from 'react';
import {
  Sparkles,
  Music,
  Mic,
  Store,
  MapPin,
  Phone,
  Wrench,
  CheckCircle2,
  Volume2,
  Flame,
} from 'lucide-react';
import { AD_PRESETS, AdPreset } from '../data/presets';
import { MusicStyle } from '../services/audioMusicEngine';

export interface AdFormData {
  businessName: string;
  category: string;
  highlights: string;
  servicePartner: string;
  location: string;
  phone: string;
  musicStyle: MusicStyle;
  voice: string;
  enableIntroChime: boolean;
}

interface AdConfigFormProps {
  formData: AdFormData;
  onChange: (data: Partial<AdFormData>) => void;
  onApplyPreset: (preset: AdPreset) => void;
  onGenerateAll: () => void;
  onGenerateScriptOnly: () => void;
  onOpenVoiceRecorder: () => void;
  isLoading: boolean;
  isAudioLoading: boolean;
}

export const AdConfigForm: React.FC<AdConfigFormProps> = ({
  formData,
  onChange,
  onApplyPreset,
  onGenerateAll,
  onGenerateScriptOnly,
  onOpenVoiceRecorder,
  isLoading,
  isAudioLoading,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Quick Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            Modelos Rápidos (Clique para Carregar):
          </label>
          <span className="text-[11px] text-slate-400">1 clique e preenche tudo</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {AD_PRESETS.map((preset) => {
            const isSelected = formData.businessName === preset.businessName;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset)}
                className={`p-2.5 rounded-xl text-left border transition text-xs font-medium flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/15 text-white ring-1 ring-amber-500'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-amber-300 truncate">{preset.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-1">
                  {preset.categoryLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            <Store className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
            Nome do Comércio / Cliente <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
            placeholder="Ex: Mercado do Elias"
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Segmento / Ramo Comercial
          </label>
          <select
            value={formData.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="mercado_varejo">Mercado, Supermercado & Mercearia</option>
            <option value="acougue">Açougue & Casa de Carnes</option>
            <option value="bebidas">Distribuidora de Bebidas & Depósito</option>
            <option value="padaria">Padaria & Confeitaria</option>
            <option value="servico_refrigeracao">Serviços de Refrigeração Comercial</option>
            <option value="climatizacao">Instalação & Limpeza de Ar-Condicionado</option>
            <option value="lanchonete">Lanchonete, Sorveteria & Restaurante</option>
            <option value="geral">Outro Comércio Local</option>
          </select>
        </div>

        {/* Highlights / Offers */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Destaques da Propaganda / Ofertas & Qualidades <span className="text-amber-400">*</span>
          </label>
          <textarea
            rows={2}
            value={formData.highlights}
            onChange={(e) => onChange({ highlights: e.target.value })}
            placeholder="Ex: Cerveja trincando de gelada, carnes fresquinhas no balcão que não esquenta, frutas do dia e atendimento nota dez..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Partner Refrigeration Service */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            <Wrench className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
            Sua Refrigeração (Parceria ou Responsável)
          </label>
          <input
            type="text"
            value={formData.servicePartner}
            onChange={(e) => onChange({ servicePartner: e.target.value })}
            placeholder="Ex: Refrigeração Maurício"
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Phone / WhatsApp */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            <Phone className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
            Telefone / WhatsApp para Chamada
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="Ex: (11) 99887-1234"
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            <MapPin className="w-3.5 h-3.5 inline mr-1 text-rose-400" />
            Endereço / Localização do Estabelecimento
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Ex: Rua Central, em frente à pracinha do bairro"
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Audio & Music Production Settings */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-500" />
          Configurações de Estúdio (Fundo Musical & Voz)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Music Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Fundo Musical da Propaganda:
            </label>
            <select
              value={formData.musicStyle}
              onChange={(e) => onChange({ musicStyle: e.target.value as MusicStyle })}
              className="w-full bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-semibold focus:outline-none"
            >
              <option value="sertanejo_alegre">🤠 Sertanejo Alegre / Universitário (Recomendado)</option>
              <option value="modao_sertanejo">🪗 Modão Sertanejo Tradicional (Viola & Sanfona)</option>
              <option value="forro_piseiro">🪘 Forró & Piseiro Comercial Animado</option>
              <option value="carro_de_som">📢 Carro de Som & Varejo Explosivo</option>
              <option value="pop_acustico">🎸 Pop Acústico Comercial Suave</option>
              <option value="nenhum">🎙️ Sem Fundo Musical (Voz Pura)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {formData.musicStyle === 'sertanejo_alegre' &&
                '✨ Batida alegre sertaneja com violão, sanfona vibrante e baixo envolvente!'}
              {formData.musicStyle === 'modao_sertanejo' &&
                '✨ Clima de modão sertanejo raiz com viola caipira e sanfona marcante.'}
              {formData.musicStyle === 'forro_piseiro' &&
                '✨ Ritmo rápido e contagiante de piseiro/forró com batida marcante.'}
              {formData.musicStyle === 'carro_de_som' &&
                '✨ Pancadão comercial acelerado com impacto de alto volume.'}
              {formData.musicStyle === 'pop_acustico' &&
                '✨ Violão agradável com ritmo moderno e elegante.'}
              {formData.musicStyle === 'nenhum' &&
                '✨ Apenas a voz da locução sem instrumentos de fundo.'}
            </p>
          </div>

          {/* Voice Personas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              <Mic className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
              Voz do Locutor da Propaganda:
            </label>
            <select
              value={formData.voice}
              onChange={(e) => onChange({ voice: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-emerald-300 font-medium focus:outline-none"
            >
              <option value="Fenrir">🧔‍♂️ Fenrir - Locutor Comercial Firme & Marcante (Padrão)</option>
              <option value="Zephyr">⚡ Zephyr - Locutor Alegre, Rápido & Enérgico</option>
              <option value="Puck">🧢 Puck - Locutor Jovem e Descontraído</option>
              <option value="Kore">👩 Kore - Locutora Comercial Clara e Marcante</option>
              <option value="Charon">📻 Charon - Voz Clássica Grave de Rádio AM/FM</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Sintetizada com entonação de rádio comercial e propaganda brasileira.
            </p>
          </div>
        </div>

        {/* Extra options */}
        <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={formData.enableIntroChime}
              onChange={(e) => onChange({ enableIntroChime: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700 accent-amber-500"
            />
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              Tocar Vinheta de Abertura Comercial (&ldquo;Plim-Plim&rdquo; de Rádio)
            </span>
          </label>

          <span className="text-slate-500">•</span>

          <span className="text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Sidechain Ducking Ativo (Música diminui quando a voz fala)
          </span>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onGenerateAll}
          disabled={isLoading || isAudioLoading || !formData.businessName.trim()}
          className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isLoading || isAudioLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Criando Roteiro & Gravando Áudio Sertanejo...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 fill-slate-950" />
              <span>Gerar Áudio Completo com Fundo Sertanejo Alegre</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenVoiceRecorder}
          disabled={isLoading || isAudioLoading}
          className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
          title="Grave sua própria voz no microfone para misturar com o fundo sertanejo alegre"
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          Gravar Minha Voz
        </button>

        <button
          type="button"
          onClick={onGenerateScriptOnly}
          disabled={isLoading || !formData.businessName.trim()}
          className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Gerar Apenas Roteiro
        </button>
      </div>
    </div>
  );
};
