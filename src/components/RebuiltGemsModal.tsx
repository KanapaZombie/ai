import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ExternalLink,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Upload,
  Volume2,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { GEM_AUDIT_INVENTORY, RebuiltGemId } from '../data';

interface RebuiltGemsModalProps {
  isOpen: boolean;
  initialGem: RebuiltGemId;
  onClose: () => void;
}

type WorkbenchTab = 'safetyscan' | 'rebreather' | 'dopaminator' | 'audit';
type SafetyScanVariant = 'yellow-tts' | 'green-ui';

interface HazardFinding {
  title: string;
  severity: string;
  location: string;
  action: string;
}

interface SafetyScanResult {
  threatLevel: string;
  environment: string;
  summary: string;
  hazards: HazardFinding[];
  checklist: string[];
  spokenBriefing: string;
}

interface LiveAuditItem {
  url: string;
  finalUrl: string;
  statusCode: number | null;
  diagnosis: string;
  title: string;
  reason: string;
  checkedAt: string;
}

function mapGemToTab(gem: RebuiltGemId): {
  tab: WorkbenchTab;
  variant: SafetyScanVariant;
  breathMode: 'stopspiral' | 'box' | 'triangle';
} {
  switch (gem) {
    case 'green-ui':
      return { tab: 'safetyscan', variant: 'green-ui', breathMode: 'stopspiral' };
    case 'rebreather':
      return { tab: 'rebreather', variant: 'yellow-tts', breathMode: 'box' };
    case 'stopspiral':
      return { tab: 'rebreather', variant: 'yellow-tts', breathMode: 'stopspiral' };
    case 'dopaminator':
      return { tab: 'dopaminator', variant: 'yellow-tts', breathMode: 'stopspiral' };
    case 'link-audit':
      return { tab: 'audit', variant: 'yellow-tts', breathMode: 'stopspiral' };
    case 'yellow-tts':
    default:
      return { tab: 'safetyscan', variant: 'yellow-tts', breathMode: 'stopspiral' };
  }
}

function createSampleHazardScene(sceneId: 'fire-exit' | 'electrical' | 'flood'): {
  dataUrl: string;
  mimeType: string;
  label: string;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: '', mimeType: 'image/png', label: sceneId };
  }

  // Dark industrial background
  ctx.fillStyle = '#14171a';
  ctx.fillRect(0, 0, 800, 500);

  // Wall & floor split
  ctx.fillStyle = '#21262c';
  ctx.fillRect(0, 0, 800, 340);
  ctx.fillStyle = '#111317';
  ctx.fillRect(0, 340, 800, 160);

  if (sceneId === 'fire-exit') {
    // Exit door frame
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(280, 70, 220, 270);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(280, 70, 220, 270);

    // Illuminated EXIT sign
    ctx.fillStyle = '#059669';
    ctx.fillRect(335, 24, 110, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('EXIT ->', 348, 49);

    // Push bar
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(300, 195, 180, 14);

    // Stacked crates & chain blocking door
    ctx.fillStyle = '#b45309';
    ctx.fillRect(250, 235, 145, 125);
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(250, 235, 145, 125);

    ctx.fillStyle = '#d97706';
    ctx.fillRect(380, 255, 140, 110);
    ctx.strokeRect(380, 255, 140, 110);

    // Padlock / hazard tape
    ctx.fillStyle = '#facc15';
    ctx.fillRect(220, 368, 340, 24);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('OBSTRUCTED EGRESS / LOCKED BAR', 255, 385);
  } else if (sceneId === 'electrical') {
    // Wall outlet
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(150, 150, 70, 100);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(175, 175, 20, 16);
    ctx.fillRect(175, 210, 20, 16);

    // Daisy-chained power strips on floor
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(185, 220);
    ctx.bezierCurveTo(210, 360, 260, 380, 320, 380);
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(310, 360, 250, 42);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(310, 360, 250, 42);

    // Multiple tangled plugs & scorch mark
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7'];
    colors.forEach((c, idx) => {
      ctx.fillStyle = c;
      ctx.fillRect(330 + idx * 42, 345, 24, 24);
      ctx.strokeStyle = c;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(342 + idx * 42, 345);
      ctx.lineTo(420 + idx * 55, 450);
      ctx.stroke();
    });

    // Scorch glow + spark
    const grad = ctx.createRadialGradient(185, 218, 5, 185, 218, 55);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(120, 150, 130, 130);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('DAISY-CHAINED OVERLOAD + SCORCH MARK', 235, 110);
  } else {
    // Flooded utility substation
    ctx.fillStyle = '#334155';
    ctx.fillRect(240, 80, 320, 260);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.strokeRect(240, 80, 320, 260);

    // High voltage sign
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(400, 120);
    ctx.lineTo(455, 215);
    ctx.lineTo(345, 215);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('⚡', 385, 195);

    // Standing water on floor with cable submerged
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.beginPath();
    ctx.ellipse(400, 415, 320, 62, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(310, 340);
    ctx.quadraticCurveTo(360, 425, 490, 410);
    ctx.stroke();

    ctx.fillStyle = '#bae6fd';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('STANDING WATER NEAR LIVE CONDUIT', 225, 52);
  }

  return {
    dataUrl: canvas.toDataURL('image/png'),
    mimeType: 'image/png',
    label: sceneId,
  };
}

export const RebuiltGemsModal: React.FC<RebuiltGemsModalProps> = ({
  isOpen,
  initialGem,
  onClose,
}) => {
  const mapped = mapGemToTab(initialGem);
  const [activeTab, setActiveTab] = useState<WorkbenchTab>(mapped.tab);

  // SafetyScan YELLOW-TTS / GREEN-UI state
  const [variant, setVariant] = useState<SafetyScanVariant>(mapped.variant);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/png');
  const [scanContext, setScanContext] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<SafetyScanResult | null>(null);
  const [ttsVoice, setTtsVoice] = useState<'Fenrir' | 'Kore' | 'Zephyr' | 'Puck'>('Fenrir');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // Rebreather / StopSpiral state
  const [breathProtocol, setBreathProtocol] = useState<'stopspiral' | 'box' | 'triangle'>(
    mapped.breathMode
  );
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);
  const [breathAudioCue, setBreathAudioCue] = useState(true);
  const breathCtxRef = useRef<AudioContext | null>(null);

  // Dopaminator 2.0 state
  const [focusMinutes, setFocusMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [compassionShield, setCompassionShield] = useState(true);
  const [expTotal, setExpTotal] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('zombie_dopaminator_exp') || '0');
    } catch {
      return 0;
    }
  });
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('zombie_dopaminator_sessions') || '0');
    } catch {
      return 0;
    }
  });

  // Live Link Audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [liveAuditResults, setLiveAuditResults] = useState<LiveAuditItem[] | null>(null);
  const [lastAuditedAt, setLastAuditedAt] = useState<string | null>(null);

  // Sync tab & variant whenever initialGem changes on open
  useEffect(() => {
    if (isOpen) {
      const next = mapGemToTab(initialGem);
      setActiveTab(next.tab);
      setVariant(next.variant);
      setBreathProtocol(next.breathMode);
    }
  }, [isOpen, initialGem]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Cleanup audio URL on unmount/change
  useEffect(() => {
    return () => {
      if (ttsAudioUrl && ttsAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(ttsAudioUrl);
      }
    };
  }, [ttsAudioUrl]);

  const playTone = (freq: number, duration = 0.25) => {
    try {
      if (!breathCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        breathCtxRef.current = new Ctx();
      }
      const ctx = breathCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Ignore Web Audio autoplay blocks
    }
  };

  const BREATH_PROTOCOLS = {
    stopspiral: {
      name: 'StopSpiral · Panic Breaker',
      subtitle: 'Slows acute overwhelm with a 6-second physiological sigh exhale.',
      phases: [
        { label: 'INHALE', seconds: 4, freq: 329.63, scale: 1.32 },
        { label: 'HOLD', seconds: 2, freq: 392.0, scale: 1.32 },
        { label: 'LONG EXHALE', seconds: 6, freq: 246.94, scale: 0.78 },
      ],
    },
    box: {
      name: 'Box Grounding · Dissociation Reset',
      subtitle: 'Even 4-4-4-4 square cadence to re-anchor nervous system rhythm.',
      phases: [
        { label: 'INHALE', seconds: 4, freq: 329.63, scale: 1.3 },
        { label: 'HOLD FULL', seconds: 4, freq: 392.0, scale: 1.3 },
        { label: 'EXHALE', seconds: 4, freq: 261.63, scale: 0.8 },
        { label: 'HOLD EMPTY', seconds: 4, freq: 220.0, scale: 0.8 },
      ],
    },
    triangle: {
      name: 'Triangle Focus · Noise Clear',
      subtitle: 'Balanced 4-4-4 cadence before starting deep work.',
      phases: [
        { label: 'INHALE', seconds: 4, freq: 349.23, scale: 1.28 },
        { label: 'HOLD', seconds: 4, freq: 440.0, scale: 1.28 },
        { label: 'EXHALE', seconds: 4, freq: 261.63, scale: 0.8 },
      ],
    },
  };

  // Breathing timer loop
  useEffect(() => {
    if (!isBreathing || !isOpen) return;
    const protocol = BREATH_PROTOCOLS[breathProtocol];
    const timer = setInterval(() => {
      setBreathSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setBreathPhaseIndex((idx) => {
          const nextIdx = (idx + 1) % protocol.phases.length;
          if (nextIdx === 0) setBreathCycles((c) => c + 1);
          const nextPhase = protocol.phases[nextIdx];
          if (breathAudioCue) playTone(nextPhase.freq, 0.3);
          setBreathSecondsLeft(nextPhase.seconds);
          return nextIdx;
        });
        return 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isBreathing, breathProtocol, breathAudioCue, isOpen]);

  // Dopaminator timer loop
  useEffect(() => {
    if (!isTimerRunning || !isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setIsTimerRunning(false);
        const earned = focusMinutes * 10 + 15;
        setExpTotal((curr) => {
          const next = curr + earned;
          try {
            localStorage.setItem('zombie_dopaminator_exp', String(next));
          } catch {}
          return next;
        });
        setCompletedSessions((curr) => {
          const next = curr + 1;
          try {
            localStorage.setItem('zombie_dopaminator_sessions', String(next));
          } catch {}
          return next;
        });
        playTone(523.25, 0.25);
        setTimeout(() => playTone(659.25, 0.35), 180);
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, focusMinutes, isOpen]);

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
        setImageMime(file.type || 'image/jpeg');
        setScanResult(null);
        setScanError(null);
        setTtsAudioUrl(null);
        setTtsError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = (sceneId: 'fire-exit' | 'electrical' | 'flood') => {
    const sample = createSampleHazardScene(sceneId);
    setImagePreview(sample.dataUrl);
    setImageMime(sample.mimeType);
    setScanResult(null);
    setScanError(null);
    setTtsAudioUrl(null);
    setTtsError(null);
  };

  const handleGenerateTts = async (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;
    setIsGeneratingAudio(true);
    setTtsError(null);
    try {
      const resp = await fetch('/api/safetyscan/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voiceName: ttsVoice,
          style:
            variant === 'yellow-tts'
              ? 'Crisp, urgent-yet-calm emergency safety dispatcher'
              : 'Measured tactical field reconnaissance briefing',
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || `TTS error (${resp.status})`);
      }
      const dataUri = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
      setTtsAudioUrl(dataUri);
      setTimeout(() => {
        audioElRef.current?.play().catch(() => {});
      }, 60);
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : 'Failed to generate TTS audio.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!imagePreview) return;
    setIsScanning(true);
    setScanError(null);
    setTtsError(null);
    setTtsAudioUrl(null);
    try {
      const resp = await fetch('/api/safetyscan/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageMime,
          context: scanContext,
          uiVariant: variant,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || `Analysis failed (${resp.status})`);
      }
      setScanResult(data);
      if (autoSpeak && data.spokenBriefing) {
        handleGenerateTts(data.spokenBriefing);
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Failed to run SafetyScan.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSpeakBrowserFallback = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.02;
      window.speechSynthesis.speak(utter);
    }
  };

  const handleRunLiveAudit = async () => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      const resp = await fetch('/api/links/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || `Audit failed (${resp.status})`);
      }
      setLiveAuditResults(data.results || []);
      setLastAuditedAt(data.auditedAt || new Date().toISOString());
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'Audit request failed.');
    } finally {
      setIsAuditing(false);
    }
  };

  const isYellow = variant === 'yellow-tts';
  const accentText = isYellow ? 'text-[#FFE600]' : 'text-[#33FF66]';
  const accentBorder = isYellow ? 'border-[#FFE600]/60' : 'border-[#33FF66]/60';
  const accentBgSolid = isYellow
    ? 'bg-[#FFE600] text-black hover:bg-[#fff04d]'
    : 'bg-[#33FF66] text-black hover:bg-[#5cff85]';

  const currentProtocol = BREATH_PROTOCOLS[breathProtocol];
  const activePhase = currentProtocol.phases[breathPhaseIndex] || currentProtocol.phases[0];

  const formatClock = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-5xl max-h-[92vh] bg-[#0a0b0e] border border-zinc-700 rounded-lg shadow-2xl flex flex-col overflow-hidden text-zinc-100"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-[#0e1015]">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-[#FFE600]" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold tracking-wide text-white">
                    Rebuilt Gem Workbench & Link Recovery
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Self-hosted replacements for login-gated Gemini & Claude share links
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-zinc-700 hover:border-zinc-500 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 pt-3 border-b border-zinc-800 bg-[#0c0e13] flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('safetyscan')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'safetyscan'
                    ? 'border-[#FFE600] text-[#FFE600] bg-zinc-900/70'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>SafetyScan (Yellow-TTS / Green)</span>
              </button>
              <button
                onClick={() => setActiveTab('rebreather')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'rebreather'
                    ? 'border-emerald-400 text-emerald-300 bg-zinc-900/70'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Rebreather / StopSpiral</span>
              </button>
              <button
                onClick={() => setActiveTab('dopaminator')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'dopaminator'
                    ? 'border-lime-400 text-lime-300 bg-zinc-900/70'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Dopaminator 2.0</span>
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'audit'
                    ? 'border-sky-400 text-sky-300 bg-zinc-900/70'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Link Audit & Fixes ({GEM_AUDIT_INVENTORY.length})</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: SAFETYSCAN YELLOW-TTS & GREEN UI */}
              {activeTab === 'safetyscan' && (
                <div className="space-y-5">
                  {/* Hazard Stripe + Variant Switcher */}
                  <div
                    className="h-2 w-full rounded-sm"
                    style={{
                      background: isYellow
                        ? 'repeating-linear-gradient(-45deg, #FFE600, #FFE600 10px, #111 10px, #111 20px)'
                        : 'repeating-linear-gradient(-45deg, #33FF66, #33FF66 10px, #0b1910 10px, #0b1910 20px)',
                    }}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className={`text-lg font-black tracking-wide uppercase ${accentText}`}>
                        {isYellow
                          ? 'SafetyScan · Yellow-TTS Edition'
                          : 'SafetyScan · Green Tactical UI'}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Replaces broken Gemini share links with live Gemini 4 Vision hazard triage and Gemini 3.8 Neural TTS audio briefings.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded">
                      <button
                        onClick={() => setVariant('yellow-tts')}
                        className={`px-3 py-1.5 text-xs font-mono font-bold rounded cursor-pointer transition-colors ${
                          variant === 'yellow-tts'
                            ? 'bg-[#FFE600] text-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Yellow-TTS
                      </button>
                      <button
                        onClick={() => setVariant('green-ui')}
                        className={`px-3 py-1.5 text-xs font-mono font-bold rounded cursor-pointer transition-colors ${
                          variant === 'green-ui'
                            ? 'bg-[#33FF66] text-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Green UI
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Image Capture / Upload / Samples */}
                    <div className={`p-4 rounded-lg border bg-[#0f1116] space-y-4 ${accentBorder}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          1. Target Photo or Test Scene
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => handleLoadSample('fire-exit')}
                            className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded cursor-pointer"
                          >
                            Sample: Blocked Exit
                          </button>
                          <button
                            onClick={() => handleLoadSample('electrical')}
                            className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded cursor-pointer"
                          >
                            Sample: Overload
                          </button>
                          <button
                            onClick={() => handleLoadSample('flood')}
                            className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded cursor-pointer"
                          >
                            Sample: Flooded Node
                          </button>
                        </div>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelected(file);
                        }}
                      />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg min-h-[220px] flex flex-col items-center justify-center p-3 cursor-pointer bg-black/50 transition-colors overflow-hidden"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Target safety scan preview"
                            className="max-h-[260px] w-auto object-contain rounded"
                          />
                        ) : (
                          <div className="text-center space-y-2 py-8">
                            <Upload className={`w-8 h-8 mx-auto ${accentText}`} />
                            <p className="text-sm font-semibold text-zinc-200">
                              Upload photo, capture camera frame, or pick a sample above
                            </p>
                            <p className="text-xs text-zinc-500">PNG, JPEG, or WebP</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs text-zinc-400">
                          Optional scene context (e.g. "basement corridor", "hotel stairwell")
                        </label>
                        <input
                          type="text"
                          value={scanContext}
                          onChange={(e) => setScanContext(e.target.value)}
                          placeholder="Add location or concern context..."
                          className="w-full px-3 py-2 text-xs bg-black border border-zinc-700 focus:border-zinc-400 rounded text-zinc-100 outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={autoSpeak}
                              onChange={(e) => setAutoSpeak(e.target.checked)}
                              className="accent-yellow-400"
                            />
                            <span>Auto-speak TTS briefing</span>
                          </label>
                          <select
                            value={ttsVoice}
                            onChange={(e) =>
                              setTtsVoice(e.target.value as 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck')
                            }
                            className="px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-200"
                            aria-label="TTS Voice"
                          >
                            <option value="Fenrir">Voice: Fenrir</option>
                            <option value="Kore">Voice: Kore</option>
                            <option value="Zephyr">Voice: Zephyr</option>
                            <option value="Puck">Voice: Puck</option>
                          </select>
                        </div>

                        <button
                          onClick={handleAnalyzePhoto}
                          disabled={!imagePreview || isScanning}
                          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${accentBgSolid}`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isScanning ? 'Scanning...' : 'Scan & Speak'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Analysis Results + Neural TTS Audio */}
                    <div className="p-4 rounded-lg border border-zinc-800 bg-[#0f1116] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          2. Threat Report & Voice Briefing
                        </span>
                        {scanResult && (
                          <span
                            className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                              ['CRITICAL', 'HIGH'].includes(scanResult.threatLevel.toUpperCase())
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : scanResult.threatLevel.toUpperCase() === 'MODERATE'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {scanResult.threatLevel}
                          </span>
                        )}
                      </div>

                      {scanError && (
                        <div className="p-3 rounded border border-red-500/50 bg-red-950/30 text-xs text-red-200 space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>Scan Error</span>
                          </div>
                          <p>{scanError}</p>
                        </div>
                      )}

                      {!scanResult && !scanError && (
                        <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
                          <Volume2 className="w-7 h-7 mx-auto opacity-50" />
                          <p>
                            Select a sample scene or upload a photo, then click <strong>Scan & Speak</strong>.
                          </p>
                          <p className="text-[11px]">
                            Community Edition standalone mirror:{' '}
                            <a
                              href="https://kanapazombie.github.io/"
                              target="_blank"
                              rel="noreferrer"
                              className="underline text-zinc-300 hover:text-white"
                            >
                              kanapazombie.github.io
                            </a>
                          </p>
                        </div>
                      )}

                      {scanResult && (
                        <div className="space-y-4 text-xs">
                          <div>
                            <div className="text-zinc-400 font-mono text-[11px]">
                              Environment: {scanResult.environment}
                            </div>
                            <p className="mt-1 text-sm text-zinc-100 leading-relaxed">
                              {scanResult.summary}
                            </p>
                          </div>

                          {/* Neural TTS Briefing Box */}
                          <div className={`p-3 rounded border bg-black/60 space-y-2 ${accentBorder}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className={`font-mono font-bold uppercase ${accentText}`}>
                                Spoken Briefing ({ttsVoice})
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleGenerateTts(scanResult.spokenBriefing)}
                                  disabled={isGeneratingAudio}
                                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold cursor-pointer disabled:opacity-50"
                                >
                                  {isGeneratingAudio ? 'Synthesizing...' : 'Regenerate WAV'}
                                </button>
                                <button
                                  onClick={() =>
                                    handleSpeakBrowserFallback(scanResult.spokenBriefing)
                                  }
                                  className="px-2.5 py-1 rounded border border-zinc-700 hover:border-zinc-500 text-zinc-300 cursor-pointer"
                                  title="Use local browser speech synthesis"
                                >
                                  Device Voice
                                </button>
                              </div>
                            </div>
                            <p className="text-zinc-200 leading-relaxed">
                              "{scanResult.spokenBriefing}"
                            </p>
                            {ttsError && (
                              <p className="text-[11px] text-amber-300">
                                Gemini TTS notice: {ttsError}
                              </p>
                            )}
                            {ttsAudioUrl && (
                              <audio
                                ref={audioElRef}
                                controls
                                src={ttsAudioUrl}
                                className="w-full h-9 mt-1"
                              />
                            )}
                          </div>

                          {/* Hazards list */}
                          {scanResult.hazards?.length > 0 && (
                            <div className="space-y-2">
                              <div className="font-mono uppercase text-[11px] text-zinc-400">
                                Detected Hazards ({scanResult.hazards.length})
                              </div>
                              {scanResult.hazards.map((h, i) => (
                                <div
                                  key={i}
                                  className="p-2.5 rounded border border-zinc-800 bg-zinc-900/60 space-y-1"
                                >
                                  <div className="flex items-center justify-between font-bold text-zinc-100">
                                    <span>{h.title}</span>
                                    <span className="font-mono text-[10px] text-amber-300">
                                      {h.severity} · {h.location}
                                    </span>
                                  </div>
                                  <p className="text-zinc-300">{h.action}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Immediate Checklist */}
                          {scanResult.checklist?.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="font-mono uppercase text-[11px] text-zinc-400">
                                Action Checklist
                              </div>
                              <ul className="space-y-1">
                                {scanResult.checklist.map((step, i) => (
                                  <li key={i} className="flex items-start gap-2 text-zinc-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: REBREATHER / STOPSPIRAL */}
              {activeTab === 'rebreather' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-emerald-300 tracking-wide">
                        Rebreather & StopSpiral · Rebuilt Gem 1 & 2
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Zero-login breathing pacer rebuilt from the original Rebreather & StopSpiral specifications.
                      </p>
                    </div>
                    <a
                      href="https://github.com/KanapaZombie/kanapa-download/blob/speak/REBREATHER_DOWNLOAD_1.html"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-mono border border-zinc-700 hover:border-emerald-400 text-zinc-300 hover:text-emerald-300 rounded flex items-center gap-1.5"
                    >
                      <span>Standalone HTML</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Protocol selector */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(Object.keys(BREATH_PROTOCOLS) as Array<'stopspiral' | 'box' | 'triangle'>).map(
                      (key) => {
                        const item = BREATH_PROTOCOLS[key];
                        const selected = breathProtocol === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setBreathProtocol(key);
                              setIsBreathing(false);
                              setBreathPhaseIndex(0);
                              setBreathSecondsLeft(item.phases[0].seconds);
                            }}
                            className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                              selected
                                ? 'border-emerald-400 bg-emerald-950/30 text-white'
                                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                            }`}
                          >
                            <div className="text-xs font-bold">{item.name}</div>
                            <p className="text-[11px] opacity-80 mt-1">{item.subtitle}</p>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Breathing Visualizer */}
                  <div className="p-8 rounded-lg border border-zinc-800 bg-[#0d1112] flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-52 h-52 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: isBreathing ? activePhase.scale : 1,
                        }}
                        transition={{
                          duration: isBreathing ? activePhase.seconds : 0.4,
                          ease: 'easeInOut',
                        }}
                        className="w-36 h-36 rounded-full border-2 border-emerald-400/80 bg-emerald-500/10 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                      >
                        <span className="text-xs font-mono tracking-widest text-emerald-300">
                          {isBreathing ? activePhase.label : 'READY'}
                        </span>
                        <span className="text-4xl font-black font-mono tabular-nums text-white mt-1">
                          {isBreathing ? breathSecondsLeft : activePhase.seconds}
                        </span>
                      </motion.div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          if (!isBreathing) {
                            setBreathPhaseIndex(0);
                            setBreathSecondsLeft(currentProtocol.phases[0].seconds);
                            if (breathAudioCue) playTone(currentProtocol.phases[0].freq, 0.3);
                          }
                          setIsBreathing((prev) => !prev);
                        }}
                        className="px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                      >
                        {isBreathing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isBreathing ? 'Pause' : 'Start Session'}</span>
                      </button>

                      <button
                        onClick={() => setBreathAudioCue((p) => !p)}
                        className="px-3.5 py-2.5 rounded border border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
                      >
                        Audio Cue: {breathAudioCue ? 'ON' : 'OFF'}
                      </button>

                      <span className="text-xs font-mono tabular-nums text-zinc-400">
                        Cycles: {breathCycles}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DOPAMINATOR 2.0 */}
              {activeTab === 'dopaminator' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-lime-300 tracking-wide">
                        Jumpstart / Dopaminator 2.0 · Rebuilt Gem
                      </h3>
                      <p className="text-xs text-zinc-400">
                        ADHD-friendly initiation timer with instant EXP rewards and zero-guilt Compassion Shield.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                      <span className="text-lime-300 font-bold">Total EXP: {expTotal}</span>
                      <span className="text-zinc-400">Sessions: {completedSessions}</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border border-zinc-800 bg-[#0d110c] flex flex-col items-center space-y-6">
                    {/* Preset duration selector */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {[3, 5, 15, 30, 60].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => {
                            setIsTimerRunning(false);
                            setFocusMinutes(mins);
                            setSecondsLeft(mins * 60);
                          }}
                          className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold border cursor-pointer transition-colors ${
                            focusMinutes === mins
                              ? 'bg-lime-400 text-black border-lime-300'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-lime-400/60'
                          }`}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>

                    <div className="text-6xl font-black font-mono tabular-nums tracking-tight text-white">
                      {formatClock(secondsLeft)}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          if (secondsLeft === 0) setSecondsLeft(focusMinutes * 60);
                          setIsTimerRunning((r) => !r);
                        }}
                        className="px-5 py-2.5 rounded bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                      >
                        {isTimerRunning ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsTimerRunning(false);
                          setSecondsLeft(focusMinutes * 60);
                        }}
                        className="px-4 py-2.5 rounded border border-zinc-700 hover:border-zinc-500 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsTimerRunning(false);
                          const bonus = 15;
                          setExpTotal((curr) => {
                            const next = curr + bonus;
                            try {
                              localStorage.setItem('zombie_dopaminator_exp', String(next));
                            } catch {}
                            return next;
                          });
                          playTone(440, 0.2);
                        }}
                        className="px-4 py-2.5 rounded border border-lime-500/40 text-lime-300 hover:bg-lime-500/10 text-xs font-mono cursor-pointer"
                      >
                        Claim Micro-Start (+15 EXP)
                      </button>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compassionShield}
                        onChange={(e) => setCompassionShield(e.target.checked)}
                        className="accent-lime-400"
                      />
                      <span>
                        Compassion Shield active (pausing or stopping early never deducts EXP)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 4: DEEP-DIVE LINK AUDIT & FIXES */}
              {activeTab === 'audit' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-sky-300 tracking-wide">
                        Deep-Dive Audit: Broken Google Gem & Share Links
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Why links like <span className="font-mono text-zinc-200">YELLOW-TTS</span> fail for visitors, and how each one was resolved or rebuilt.
                      </p>
                    </div>
                    <button
                      onClick={handleRunLiveAudit}
                      disabled={isAuditing}
                      className="px-4 py-2 rounded bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                      <span>{isAuditing ? 'Running Live Audit...' : 'Re-Run Live HTTP Audit'}</span>
                    </button>
                  </div>

                  {/* Key Technical Findings Summary */}
                  <div className="p-4 rounded-lg border border-sky-500/30 bg-sky-950/15 space-y-2 text-xs text-zinc-300">
                    <div className="font-bold text-sky-300">
                      Root Cause Analysis (Verified via Live Redirect & Payload Trace)
                    </div>
                    <p>
                      1. <strong>Google Account & Consent Gate:</strong> All 6 Gemini links (including{' '}
                      <span className="font-mono">gemini.google.com/share/db75accb5fc8?skid=...</span> and{' '}
                      <span className="font-mono">share.gemini.google/*</span> 301-redirects) serve a client-side WIZ SPA that bounces unauthenticated, incognito, EU consent-pending, or Workspace-restricted visitors to{' '}
                      <span className="font-mono">accounts.google.com/ServiceLogin</span>.
                    </p>
                    <p>
                      2. <strong>Embed Blocking & Header Overflow:</strong> Gemini responds with{' '}
                      <span className="font-mono">X-Frame-Options: DENY / SAMEORIGIN</span> (blocking embeds) and &gt;16KB response headers (causing Node <span className="font-mono">UND_ERR_HEADERS_OVERFLOW</span> in standard link monitors).
                    </p>
                    <p>
                      3. <strong>Private Claude Chat Link:</strong> SafetyScan's{' '}
                      <span className="font-mono">CLAUDE ARTIFACT</span> URL points to a private{' '}
                      <span className="font-mono">claude.ai/chat/</span> ID (HTTP 403) rather than a published <span className="font-mono">claude.site</span> artifact.
                    </p>
                  </div>

                  {/* Curated Inventory with Rebuilt Launchers */}
                  <div className="space-y-3">
                    {GEM_AUDIT_INVENTORY.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 rounded-lg border border-zinc-800 bg-[#0f1218] space-y-2 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-bold text-sm text-white">
                            {entry.project} — {entry.label}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => {
                                const next = mapGemToTab(entry.rebuiltGemId);
                                setVariant(next.variant);
                                setBreathProtocol(next.breathMode);
                                setActiveTab(next.tab);
                              }}
                              className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer"
                            >
                              Launch Rebuilt
                            </button>
                            {entry.fallbackUrl && (
                              <a
                                href={entry.fallbackUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded border border-zinc-700 hover:border-zinc-500 text-zinc-200 flex items-center gap-1"
                              >
                                <span>Mirror</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <a
                              href={entry.originalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 rounded border border-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                            >
                              <span>Original URL</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <div className="font-mono text-[11px] text-zinc-500 break-all">
                          Resolved: {entry.resolvedUrl}
                        </div>
                        <div className="text-amber-200/90">
                          <strong>Cause:</strong> {entry.rootCause}
                        </div>
                        <div className="text-emerald-300/90">
                          <strong>Solution:</strong> {entry.solution}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Audit Output */}
                  {auditError && (
                    <div className="p-3 rounded border border-red-500/40 bg-red-950/30 text-xs text-red-200">
                      {auditError}
                    </div>
                  )}

                  {liveAuditResults && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                        <span>Live Server Probe Results</span>
                        {lastAuditedAt && <span>Checked: {new Date(lastAuditedAt).toLocaleTimeString()}</span>}
                      </div>
                      <div className="overflow-x-auto border border-zinc-800 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-900/90 text-zinc-400 font-mono">
                            <tr>
                              <th className="p-2.5">Diagnosis</th>
                              <th className="p-2.5">HTTP</th>
                              <th className="p-2.5">Target URL</th>
                              <th className="p-2.5">Finding</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/80">
                            {liveAuditResults.map((r, i) => (
                              <tr key={i} className="bg-black/30">
                                <td className="p-2.5 font-mono font-bold whitespace-nowrap">
                                  <span
                                    className={
                                      r.diagnosis === 'LIVE'
                                        ? 'text-emerald-400'
                                        : r.diagnosis === 'BOT_SHIELD_403'
                                          ? 'text-sky-300'
                                          : 'text-amber-300'
                                    }
                                  >
                                    {r.diagnosis}
                                  </span>
                                </td>
                                <td className="p-2.5 font-mono tabular-nums text-zinc-300">
                                  {r.statusCode ?? 'ERR'}
                                </td>
                                <td className="p-2.5 font-mono text-[11px] text-zinc-400 max-w-[240px] truncate">
                                  {r.url}
                                </td>
                                <td className="p-2.5 text-zinc-300">{r.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
