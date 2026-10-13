import { useState, useEffect } from 'react';
import {
  Sparkles,
  Music,
  Radio,
  FileCheck,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  LogOut,
  Save,
  Lock,
  Flame,
  Crown,
} from 'lucide-react';
import { AD_PRESETS, AdPreset } from './data/presets';
import { AdConfigForm, AdFormData } from './components/AdConfigForm';
import { ScriptEditor, AdScriptData } from './components/ScriptEditor';
import { AudioPlayerVisualizer } from './components/AudioPlayerVisualizer';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';
import { StudentLoginScreen } from './components/StudentLoginScreen';
import { RestorePointModal, RestorePoint } from './components/RestorePointModal';
import { AdminProfessorModal } from './components/AdminProfessorModal';
import {
  generateMusicalBackdrop,
  mixVoiceAndMusic,
  MusicTrackConfig,
} from './services/audioMusicEngine';
import { requestSpeechAudio } from './services/speechService';

export default function App() {
  // Pre-loaded with the user's explicit example: Mercado do Elias!
  const defaultPreset = AD_PRESETS[0];

  // User authentication & role state (Aluno vs Professor Maurício)
  const [studentUser, setStudentUser] = useState<string | null>(() => {
    try {
      return localStorage.getItem('propaganda_aluno_nome') || null;
    } catch {
      return null;
    }
  });

  const [userRole, setUserRole] = useState<'aluno' | 'professor'>(() => {
    try {
      return (localStorage.getItem('propaganda_user_role') as 'aluno' | 'professor') || 'aluno';
    } catch {
      return 'aluno';
    }
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Restore Points system
  const defaultRestorePoint: RestorePoint = {
    id: 'ponto_inicial_elias',
    name: '⭐ Ponto de Restauração Inicial - Mercado do Elias & Fundo Sertanejo',
    createdAt: 'Ponto Seguro de Fábrica',
    formData: {
      businessName: defaultPreset.businessName,
      category: defaultPreset.category,
      highlights: defaultPreset.highlights,
      servicePartner: defaultPreset.servicePartner,
      location: defaultPreset.location,
      phone: defaultPreset.phone,
      musicStyle: 'sertanejo_alegre',
      voice: 'Fenrir',
      enableIntroChime: true,
    },
    script: defaultPreset.defaultScript,
    isInitialDefault: true,
  };

  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>(() => {
    try {
      const saved = localStorage.getItem('propaganda_restore_points');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [defaultRestorePoint];
  });

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Sync restore points to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('propaganda_restore_points', JSON.stringify(restorePoints));
    } catch {
      // ignore
    }
  }, [restorePoints]);

  // Anti-tamper & Code Protection: Prevents unauthorized inspection, right-click, and modification
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow right-click inside textarea/inputs so students can paste and copy promotional text
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
      showToast('🔒 Conteúdo e código protegidos pelo Professor Maurício. Proibida cópia ou alteração.', 'info');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      // Block common inspect & source shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+P)
      if (
        e.key === 'F12' ||
        (isCmdOrCtrl && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (isCmdOrCtrl && ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key))
      ) {
        e.preventDefault();
        showToast('🔒 Proteção Ativa: Estrutura protegida pelo Professor Maurício contra alterações.', 'info');
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [formData, setFormData] = useState<AdFormData>({
    businessName: defaultPreset.businessName,
    category: defaultPreset.category,
    highlights: defaultPreset.highlights,
    servicePartner: defaultPreset.servicePartner,
    location: defaultPreset.location,
    phone: defaultPreset.phone,
    musicStyle: 'sertanejo_alegre',
    voice: 'Fenrir',
    enableIntroChime: true,
  });

  // Pre-populate script with Mercado do Elias so it's immediately available
  const [script, setScript] = useState<AdScriptData | null>(defaultPreset.defaultScript);
  const [masterBuffer, setMasterBuffer] = useState<AudioBuffer | null>(null);
  const [voiceBuffer, setVoiceBuffer] = useState<AudioBuffer | null>(null);
  const [musicBuffer, setMusicBuffer] = useState<AudioBuffer | null>(null);

  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApplyPreset = (preset: AdPreset) => {
    setFormData((prev) => ({
      ...prev,
      businessName: preset.businessName,
      category: preset.category,
      highlights: preset.highlights,
      servicePartner: preset.servicePartner,
      location: preset.location,
      phone: preset.phone,
      musicStyle: preset.musicStyle,
      voice: preset.voice,
    }));
    setScript(preset.defaultScript);
    showToast(`Modelo carregado: ${preset.name}`, 'info');
  };

  // Helper to request script from Gemini with resilient fallback
  const fetchScriptFromAI = async (): Promise<AdScriptData> => {
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          category: formData.category,
          highlights: formData.highlights,
          servicePartner: formData.servicePartner,
          location: formData.location,
          phone: formData.phone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.narrationText) {
          return data.data;
        }
      }
    } catch (networkErr) {
      console.warn('Erro na requisição ao servidor de roteiro:', networkErr);
    }

    // Fallback script if server/Gemini is busy
    return {
      title: `Mega Ofertas no ${formData.businessName}!`,
      openingHook: `Alô minha gente! O melhor pra sua família tá no ${formData.businessName}!`,
      narrationText: `Alô minha gente! No ${formData.businessName} você encontra tudo com economia e qualidade nota dez! ${formData.highlights}! Balcões refrigerados de primeira com a parceria da ${formData.servicePartner || 'Refrigeração Maurício'}! Vem correndo aproveitar as melhores ofertas da semana!${formData.location ? ' Estamos ' + formData.location + '.' : ''}${formData.phone ? ' WhatsApp: ' + formData.phone : ''}`,
      offersBulletPoints: [
        formData.highlights.split(',')[0]?.trim() || 'Cerveja trincando e produtos frescos',
        formData.highlights.split(',')[1]?.trim() || 'Balcões e carnes no ponto certo',
        'Economia garantida e atendimento nota dez',
      ],
      callToAction: `Vem correndo pro ${formData.businessName}! Economia de verdade é aqui!`,
      carroDeSomScript: `ATENÇÃO MORADORES! É NO ${formData.businessName.toUpperCase()}! ${formData.highlights.toUpperCase()}! REFRIGERAÇÃO DE PRIMEIRA E PREÇO BAIXO! CORRE PRA CÁ!`,
      whatsappText: `🛒 *SUPER OFERTAS NO ${formData.businessName.toUpperCase()}!* 🍻🥩\n${formData.highlights}!\n❄️ Refrigeração parceira: ${formData.servicePartner}\n📲 WhatsApp: ${formData.phone || 'Consulte-nos'}`,
    };
  };

  // Generate Script Only
  const handleGenerateScriptOnly = async () => {
    setIsLoadingScript(true);
    setStatusStep('Escrevendo roteiro comercial de rádio com IA...');
    try {
      const generatedScript = await fetchScriptFromAI();
      setScript(generatedScript);
      showToast('Roteiro comercial criado com sucesso!', 'success');
    } catch (err: unknown) {
      console.error(err);
      showToast('Roteiro padrão carregado.', 'info');
    } finally {
      setIsLoadingScript(false);
      setStatusStep('');
    }
  };

  // Generate Full Ad Audio (Voice + Sertanejo background music + Ducking mix)
  const handleGenerateAll = async () => {
    setIsLoadingScript(true);
    setIsAudioLoading(true);

    try {
      // 1. Get or generate script
      let currentScript = script;
      const scriptMatchesBusiness =
        currentScript &&
        currentScript.narrationText &&
        currentScript.narrationText.toLowerCase().includes(formData.businessName.toLowerCase().trim());

      if (!scriptMatchesBusiness) {
        setStatusStep('1/3 Criando texto da propaganda e ofertas com IA...');
        currentScript = await fetchScriptFromAI();
        setScript(currentScript);
      }

      if (!currentScript || !currentScript.narrationText) {
        throw new Error('Não foi possível obter o roteiro da propaganda.');
      }

      // 2. Synthesize Locutor Speech
      setStatusStep('2/3 Gravando locução comercial com voz de rádio...');
      const speechRes = await requestSpeechAudio(
        currentScript.narrationText,
        formData.voice,
        'locutor animado de propaganda'
      );
      setVoiceBuffer(speechRes.audioBuffer);

      // 3. Synthesize Music & Mix
      setStatusStep('3/3 Compondo fundo musical sertanejo alegre e mixando master...');
      const musicConfig: MusicTrackConfig = {
        style: formData.musicStyle,
        musicVolume: 0.28,
        voiceVolume: 1.0,
        enableIntroChime: formData.enableIntroChime,
        duckingAmount: 0.7,
      };

      const master = await mixVoiceAndMusic(speechRes.audioBuffer, musicConfig);
      setMasterBuffer(master);

      // Also generate standalone music buffer for preview
      const standaloneMusic = await generateMusicalBackdrop(master.duration, formData.musicStyle);
      setMusicBuffer(standaloneMusic);

      showToast('Áudio completo gerado com sucesso! Ouça no reprodutor abaixo.', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Erro na produção do áudio:', error);
      showToast(`Erro na produção do áudio: ${error.message || 'Tente novamente'}`, 'error');
    } finally {
      setIsLoadingScript(false);
      setIsAudioLoading(false);
      setStatusStep('');
    }
  };

  // Re-record audio from edited text in textarea
  const handleGenerateAudioFromCurrentText = async () => {
    if (!script?.narrationText) return;
    setIsAudioLoading(true);
    setStatusStep('Gravando áudio com o texto atualizado...');

    try {
      const speechRes = await requestSpeechAudio(
        script.narrationText,
        formData.voice,
        'locutor animado de propaganda'
      );
      setVoiceBuffer(speechRes.audioBuffer);

      const musicConfig: MusicTrackConfig = {
        style: formData.musicStyle,
        musicVolume: 0.28,
        voiceVolume: 1.0,
        enableIntroChime: formData.enableIntroChime,
        duckingAmount: 0.7,
      };

      const master = await mixVoiceAndMusic(speechRes.audioBuffer, musicConfig);
      setMasterBuffer(master);

      const standaloneMusic = await generateMusicalBackdrop(master.duration, formData.musicStyle);
      setMusicBuffer(standaloneMusic);

      showToast('Novo áudio gravado e mixado com sucesso!', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      showToast(`Erro ao gravar áudio: ${error.message}`, 'error');
    } finally {
      setIsAudioLoading(false);
      setStatusStep('');
    }
  };

  // Handle user's custom recorded voice mixing
  const handleRecordingComplete = async (recordedVoiceBuffer: AudioBuffer) => {
    setIsAudioLoading(true);
    setStatusStep('Mixando sua voz com a trilha de fundo sertaneja...');
    try {
      setVoiceBuffer(recordedVoiceBuffer);
      const musicConfig: MusicTrackConfig = {
        style: formData.musicStyle,
        musicVolume: 0.28,
        voiceVolume: 1.0,
        enableIntroChime: formData.enableIntroChime,
        duckingAmount: 0.7,
      };
      const master = await mixVoiceAndMusic(recordedVoiceBuffer, musicConfig);
      setMasterBuffer(master);

      const standaloneMusic = await generateMusicalBackdrop(master.duration, formData.musicStyle);
      setMusicBuffer(standaloneMusic);

      showToast('Sua voz gravada foi mixada com o fundo sertanejo!', 'success');
    } catch (err: unknown) {
      console.error(err);
      showToast('Erro ao mixar áudio gravado.', 'error');
    } finally {
      setIsAudioLoading(false);
      setStatusStep('');
    }
  };

  // Live Re-mix volume without re-generating speech
  const handleReMix = async (musicVol: number, voiceVol: number) => {
    if (!voiceBuffer) return;
    try {
      const musicConfig: MusicTrackConfig = {
        style: formData.musicStyle,
        musicVolume: musicVol,
        voiceVolume: voiceVol,
        enableIntroChime: formData.enableIntroChime,
        duckingAmount: 0.7,
      };

      const newMaster = await mixVoiceAndMusic(voiceBuffer, musicConfig);
      setMasterBuffer(newMaster);
    } catch (err) {
      console.error('Remix error:', err);
    }
  };

  const handleLoginSuccess = (name: string, role: 'aluno' | 'professor' = 'aluno') => {
    setStudentUser(name);
    setUserRole(role);
    try {
      localStorage.setItem('propaganda_aluno_nome', name);
      localStorage.setItem('propaganda_user_role', role);
    } catch {
      // ignore
    }
    if (role === 'professor') {
      showToast('👑 Bem-vindo, Professor Maurício! Acesso Mestre liberado.', 'success');
    } else {
      showToast(`Bem-vindo, Aluno ${name}! Senha 3030 verificada. Áudios ilimitados liberados!`, 'success');
    }
  };

  const handleLogout = () => {
    setStudentUser(null);
    setUserRole('aluno');
    try {
      localStorage.removeItem('propaganda_aluno_nome');
      localStorage.removeItem('propaganda_user_role');
    } catch {
      // ignore
    }
    showToast('Sessão encerrada com segurança.', 'info');
  };

  const handleUnlockProfessor = (pass: string) => {
    if (pass.trim() === '2512') {
      setUserRole('professor');
      setStudentUser('Professor Maurício');
      try {
        localStorage.setItem('propaganda_aluno_nome', 'Professor Maurício');
        localStorage.setItem('propaganda_user_role', 'professor');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const handleResetMasterConfig = () => {
    setFormData({
      businessName: defaultPreset.businessName,
      category: defaultPreset.category,
      highlights: defaultPreset.highlights,
      servicePartner: defaultPreset.servicePartner,
      location: defaultPreset.location,
      phone: defaultPreset.phone,
      musicStyle: defaultPreset.musicStyle,
      voice: defaultPreset.voice,
      enableIntroChime: true,
    });
    setScript({ ...defaultPreset.defaultScript });
    showToast('Configuração oficial do Mercado do Elias restaurada pelo Professor Maurício!', 'success');
  };

  const handleSaveRestorePoint = (name: string) => {
    const newPoint: RestorePoint = {
      id: 'ponto_' + Date.now(),
      name,
      createdAt: new Date().toLocaleString('pt-BR'),
      formData: { ...formData },
      script: script ? { ...script } : null,
      isInitialDefault: false,
    };
    setRestorePoints((prev) => [newPoint, ...prev]);
    showToast(`Ponto de restauração "${name}" salvo com sucesso!`, 'success');
  };

  const handleApplyRestorePoint = (point: RestorePoint) => {
    setFormData({ ...point.formData });
    setScript(point.script ? { ...point.script } : null);
    showToast(`Ponto de restauração "${point.name}" restaurado!`, 'success');
  };

  const handleDeleteRestorePoint = (id: string) => {
    // Only Professor Maurício can delete restore points!
    if (userRole !== 'professor') {
      showToast('Apenas o Professor Maurício (senha 2512) pode excluir pontos de restauração.', 'error');
      return;
    }
    setRestorePoints((prev) => prev.filter((p) => p.id !== id));
    showToast('Ponto de restauração excluído.', 'info');
  };

  const getMusicStyleName = () => {
    switch (formData.musicStyle) {
      case 'sertanejo_alegre':
        return 'Sertanejo Alegre';
      case 'modao_sertanejo':
        return 'Modão Sertanejo';
      case 'forro_piseiro':
        return 'Forró & Piseiro';
      case 'carro_de_som':
        return 'Carro de Som';
      case 'pop_acustico':
        return 'Pop Acústico';
      case 'nenhum':
        return 'Sem Fundo';
      default:
        return 'Sertanejo';
    }
  };

  // If student is not logged in, show the student login screen with password 3030
  if (!studentUser) {
    return <StudentLoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-200 border-emerald-500/50'
                : toastMessage.type === 'error'
                ? 'bg-rose-900/90 text-rose-200 border-rose-500/50'
                : 'bg-amber-900/90 text-amber-200 border-amber-500/50'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-amber-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar with Student Session & Restore Point Controls */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  PropagandaFácil
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Refrigeração & Comércio
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Áudios Ilimitados
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerador de anúncios em áudio com locução e fundo sertanejo alegre
              </p>
            </div>
          </div>

          {/* Student Status, Professor Panel, Restore Points & Logout */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Student or Professor Badge */}
            {userRole === 'professor' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-yellow-500/20 border border-amber-500/50 text-amber-300 font-bold shadow-sm">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span>Professor Maurício</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded ml-1">
                  MESTRE
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-amber-500/30 text-amber-300 font-semibold shadow-sm">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Aluno: <strong>{studentUser}</strong></span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 ml-1">
                  Senha 3030 ✓
                </span>
              </div>
            )}

            {/* Painel do Professor Button */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition active:scale-95 cursor-pointer ${
                userRole === 'professor'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
              }`}
              title="Painel de segurança e controle exclusivo do Professor Maurício"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{userRole === 'professor' ? 'Painel do Professor' : 'Área do Professor'}</span>
            </button>

            {/* Restore Point Button */}
            <button
              onClick={() => setIsRestoreModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium border border-slate-700 transition active:scale-95 cursor-pointer"
              title="Abrir gerenciador de pontos de restauração"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Pontos de Restauração</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded-full font-mono">
                {restorePoints.length}
              </span>
            </button>

            {/* Logout / Switch User */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition active:scale-95 cursor-pointer"
              title="Sair ou trocar de usuário"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Hero Banner / Instructions */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/25 p-5 sm:p-7 shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                {userRole === 'professor' ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-yellow-400" />
                    Professor Maurício &bull; Controle Total &bull; Acesso Mestre Ativo
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Aluno {studentUser} &bull; Áudios Ilimitados com Senha 3030!
                  </>
                )}
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Proteção Anti-Cópia Ativa
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
              Crie comerciais de rádio e áudios com{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                fundo musical sertanejo alegre
              </span>{' '}
              para seus clientes!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Você pode divulgar o <strong>Mercado do Elias</strong> (cerveja trincando, balcões refrigerados de primeira) ou sua própria <strong>Refrigeração Maurício</strong>. Basta clicar no botão e a inteligência artificial escreve o roteiro e gera o áudio profissional com locutor e música sertaneja!
            </p>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Processing Indicator */}
        {(isLoadingScript || isAudioLoading) && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <div className="text-xs text-amber-300 font-medium">
              <p className="font-bold">{statusStep || 'Processando propaganda...'}</p>
              <p className="text-slate-400 text-[11px]">
                Aguarde alguns segundos enquanto a IA gera o roteiro e os instrumentos sertanejos.
              </p>
            </div>
          </div>
        )}

        {/* Grid: Form on Left, Output Studio on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Presets */}
          <div className="lg:col-span-7 space-y-6">
            <AdConfigForm
              formData={formData}
              onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
              onApplyPreset={handleApplyPreset}
              onGenerateAll={handleGenerateAll}
              onGenerateScriptOnly={handleGenerateScriptOnly}
              onOpenVoiceRecorder={() => setIsVoiceModalOpen(true)}
              isLoading={isLoadingScript}
              isAudioLoading={isAudioLoading}
            />

            {/* Voice Recorder Modal for recording user's own locution */}
            <VoiceRecorderModal
              isOpen={isVoiceModalOpen}
              onClose={() => setIsVoiceModalOpen(false)}
              onRecordingComplete={handleRecordingComplete}
              scriptText={script?.narrationText || ''}
            />

            {/* Restore Point Modal */}
            <RestorePointModal
              isOpen={isRestoreModalOpen}
              onClose={() => setIsRestoreModalOpen(false)}
              currentFormData={formData}
              currentScript={script}
              restorePoints={restorePoints}
              isProfessor={userRole === 'professor'}
              onSaveRestorePoint={handleSaveRestorePoint}
              onApplyRestorePoint={handleApplyRestorePoint}
              onDeleteRestorePoint={handleDeleteRestorePoint}
            />

            {/* Admin Professor Modal (Restricted with Master Password 2512) */}
            <AdminProfessorModal
              isOpen={isAdminModalOpen}
              onClose={() => setIsAdminModalOpen(false)}
              isProfessorLoggedIn={userRole === 'professor'}
              onUnlockProfessor={handleUnlockProfessor}
              onResetMasterConfig={handleResetMasterConfig}
              onSwitchToStudent={() => {
                setUserRole('aluno');
                setStudentUser('Aluno');
                try {
                  localStorage.setItem('propaganda_user_role', 'aluno');
                  localStorage.setItem('propaganda_aluno_nome', 'Aluno');
                } catch {
                  // ignore
                }
                setIsAdminModalOpen(false);
                showToast('Modo de visão do Aluno ativado. Áudios ilimitados!', 'info');
              }}
            />

            {/* Script Display and Editing */}
            <ScriptEditor
              script={script}
              onNarrationChange={(newText) =>
                setScript((prev) => (prev ? { ...prev, narrationText: newText } : null))
              }
              onGenerateAudioFromText={handleGenerateAudioFromCurrentText}
              isAudioLoading={isAudioLoading}
            />
          </div>

          {/* Right Column: Audio Studio & Player */}
          <div className="lg:col-span-5 space-y-6">
            {/* Audio Studio Player */}
            <div className="sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-amber-400" />
                  Reprodutor & Mixador de Áudio
                </h3>
                {masterBuffer && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                    Áudio Pronto
                  </span>
                )}
              </div>

              <AudioPlayerVisualizer
                masterBuffer={masterBuffer}
                voiceBuffer={voiceBuffer}
                musicBuffer={musicBuffer}
                businessName={formData.businessName}
                musicStyleLabel={getMusicStyleName()}
                whatsappScriptText={script?.whatsappText || script?.narrationText}
                onReMix={handleReMix}
              />

              {/* Tips & Quick Guide */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <HelpCircle className="w-4 h-4" />
                  Como Usar Sua Propaganda no Dia a Dia:
                </h4>

                <ul className="space-y-2.5 text-slate-300">
                  <li className="flex items-start gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>No WhatsApp do Elias:</strong> Clique em &ldquo;Baixar Áudio (.WAV)&rdquo; e envie para o dono do mercado. Ele pode disparar para clientes e colocar nos status!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Radio className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>No Carro de Som ou Caixa da Loja:</strong> Coloque o arquivo em um pen drive ou conecte pelo Bluetooth da caixa amplificada na porta do comércio.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Divulgue sua Refrigeração:</strong> Quando fizer manutenção em balcões ou câmaras frias, dê a propaganda de presente para o comerciante! É a melhor propaganda da Refrigeração Maurício!
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Anti-Copy Copyright & Protection Seal */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-left">
            <span className="font-semibold text-slate-400">
              © PropagandaFácil &bull; Propriedade Intelectual do Professor Maurício (Refrigeração Maurício)
            </span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="text-amber-400/80 font-mono text-[11px]">
              🔒 Todos os direitos reservados. Proibida a cópia ou modificação do código por terceiros.
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Áudio gerado em alta definição (.WAV)</span>
            <span>&bull;</span>
            <span>Música Sertaneja Sintetizada</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
