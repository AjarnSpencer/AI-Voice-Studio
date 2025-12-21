import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { MicrophoneIcon, StopCircleIcon, UserIcon, SparklesIcon, PlusIcon, KeyIcon, BookOpenIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, InformationCircleIcon, TrashIcon } from './components/icons';
import { CustomVoiceModal } from './components/CustomVoiceModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PronunciationModal, type PronunciationRule } from './components/PronunciationModal';
import { TutorialModal } from './components/TutorialModal';
import { type TranscriptMessage } from './types';
import { encode, decode, decodeAudioData, pcmToWavBlob, concatenateBuffers } from './utils/audio';

declare global {
  interface Window {
    electronAPI?: {
      showInFolder: (path: string) => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      platform: string;
    };
  }
}

interface CustomVoice {
  id: string;
  name: string;
  instruction: string;
  baseVoice: string;
}

interface ExternalVoice {
  id: string;
  name: string;
  provider: 'elevenlabs' | 'resemble';
}

const AppLogo = () => (
  <div className="relative w-10 h-10 group cursor-pointer">
    <div className="absolute inset-0 bg-teal-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
    <svg viewBox="0 0 100 100" className="relative w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0891b2', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#logoGrad)" />
      <path d="M35 70 L50 30 L65 70 M42 55 L58 55" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 30 Q50 90 70 30" fill="none" stroke="white" strokeWidth="4" strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  </div>
);

const splitTextIntoChunks = (text: string, maxChars: number = 3000): string[] => {
  if (text.length <= maxChars) return [text];
  const chunks: string[] = [];
  let currentPos = 0;
  while (currentPos < text.length) {
    let endPos = currentPos + maxChars;
    if (endPos > text.length) endPos = text.length;
    if (endPos < text.length) {
      const lastSpace = text.lastIndexOf(' ', endPos);
      const lastNewline = text.lastIndexOf('\n', endPos);
      const breakPoint = Math.max(lastSpace, lastNewline);
      if (breakPoint > currentPos) endPos = breakPoint;
    }
    chunks.push(text.substring(currentPos, endPos).trim());
    currentPos = endPos;
  }
  return chunks.filter(c => c.length > 0);
};

type AppMode = 'conversation' | 'narration';
type SvgProvider = 'gemini-2.5-tts' | 'gemini-3-pro' | 'gemini-3-flash' | 'gemini-2.5-flash' | 'elevenlabs' | 'resemble';

const narrationPrebuiltVoices: { [key: string]: { description: string; voiceName: string } } = {
  'Charon (Deep Male)': {
    description: 'A very deep, resonant, and authoritative male voice.',
    voiceName: 'Charon',
  },
  'Zephyr (Warm Female)': {
    description: 'A warm and friendly female voice, suitable for conversational content.',
    voiceName: 'Zephyr',
  },
  'Hyperion (Authoritative Male)': {
    description: 'An authoritative, deep voice for documentary-style narration.',
    voiceName: 'Charon',
  },
  'Puck (Friendly Male)': {
    description: 'A friendly and engaging male voice with a clear tone.',
    voiceName: 'Puck',
  },
  'Sadachbia (Warm Male)': {
    description: 'A warm, engaging, and friendly voice, perfect for storytelling.',
    voiceName: 'Puck',
  },
  'Fenrir (Serious Male)': {
    description: 'A serious, mature voice suitable for formal narration.',
    voiceName: 'Fenrir',
  },
  'Kore (Clear Female)': {
    description: 'A clear, neutral female voice with a standard American accent.',
    voiceName: 'Kore',
  },
  'Aura (Calm Female)': {
    description: 'A calm, clear, and reassuring female voice.',
    voiceName: 'Kore',
  }
};

const LANGUAGES = [
  'Arabic (AR)', 'Aymara', 'Catalan', 'Cherokee', 'Chinese (ZH)', 'Danish', 'Dutch (NL)',
  'English (UK)', 'English (US)', 'Flemish', 'French (FR)', 'Georgian', 'German (DE)',
  'Guarani', 'Hindi (IN)', 'Indonesian (ID)', 'Italian (IT)', 'Japanese (JP)', 'Kannada',
  'Khmer', 'Korean (KR)', 'Lao', 'Latin', 'Latvian', 'Maltese', 'Maya (Yucatec)', 'Nahuatl',
  'Navajo', 'Nepali', 'Norwegian', 'Polish (PL)', 'Portuguese (BR)', 'Quechua', 'Russian (RU)',
  'Sinhala', 'Spanish (ES)', 'Swedish (SE)', 'Tamil', 'Thai (TH)', 'Turkish (TR)', 'Vietnamese (VN)'
];

const MASTER_NARRATION_DEMO = `<speak>
  [Authoritative][Professional Gravitas]
  In the silence of the cosmic void, a single particle began its journey toward the dawn of time.
  
  <break time="1.5s"/>
  
  [Whisper][Intimate]
  Can you feel it? The subtle shift in the neural landscape where machine and human identity finally converge?
  
  <break time="800ms"/>
  
  [Excitedly][Hyper-Energetic][Bright]
  Welcome to AI Voice Studio! We are now processing at speeds previously thought impossible, utilizing the full logic stack of Gemini 3 Pro for real-time semantic restructuring!
  
  [Instruction: Use a slightly questioning upward lilt on the technical term 'Singularity']
  The singularity is no longer a theory; it is an audible reality.
  
  <break time="1500ms"/>
  
  [Solemnly][Narrative-Deep][Gravelly]
  Precision is the language of the universe. In the Semantic Math Prosody Library, we express the fundamental laws of nature with absolute clarity.
  
  <p>
    Consider Einstein's mass-energy equivalence:
    <prosody rate="80%" pitch="+2st">
      Energy, E, equals mass, m, times the square of the speed of light, c-squared.
    </prosody>
  </p>
  
  <break time="1s"/>
  
  [Skeptical][Drawl][Sarcastic]
  They said a machine could never master the irony of human speech. 
  [Whisper]
  But then again... they've been wrong before.
  
  <break time="1.5s"/>
  
  [Aged][Gentle][Breathless]
  The light is fading now. We must prepare for the next production cycle.
  
  [Instruction: End with a profound, resonant tone that lingers in the lower frequencies, extremely slow]
  <break time="2000ms"/>
  
  <prosody rate="60%" pitch="-3st">Final master recording verified. Studio out.</prosody>
  
  <break time="2s"/>
  
  [Technical][Flat][Speed: Fast]
  System status: All neural nodes stable. Latency: 42ms. Buffer: Clear. 
  [Commanding][Echo]
  DEPLOYING NEXT SEQUENCE.
  
  <break time="1s"/>
  
  [Angry][Aggressive]
  "Who told you that you could enter this facility without authorization?"
  <break time="500ms"/>
  [Fearful][Stuttering]
  "I... I didn't know... I was just looking for the exit!"
  
  <break time="1s"/>
  
  [Warm][Nostalgic]
  I remember the first time I saw the stars from the observatory. 
  [Awe-Struck]
  It was as if the universe was breathing with me.
</speak>`;

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('narration');
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoiceKey, setSelectedVoiceKey] = useState<string>('Charon (Deep Male)');
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [isCustomVoiceModalOpen, setIsCustomVoiceModalOpen] = useState(false);
  const [narrationProvider, setNarrationProvider] = useState<SvgProvider>('gemini-2.5-tts');
  
  const [elevenLabsVoices, setElevenLabsVoices] = useState<ExternalVoice[]>([]);
  const [resembleVoices, setResembleVoices] = useState<ExternalVoice[]>([]);
  const [isSyncingVoices, setIsSyncingVoices] = useState(false);

  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState<string>('');
  const [resembleProjectId, setResembleProjectId] = useState<string>('');
  const [resembleVoiceId, setResembleVoiceId] = useState<string>('');
  
  const [resembleKey, setResembleKey] = useState<string>('');
  const [elevenLabsKey, setElevenLabsKey] = useState<string>('');
  
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState<boolean>(false);

  const [narrationText, setNarrationText] = useState<string>(MASTER_NARRATION_DEMO);
  const [narrationLanguage, setNarrationLanguage] = useState<string>('English (US)');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pronunciationRules, setPronunciationRules] = useState<PronunciationRule[]>([]);
  const [isPronunciationModalOpen, setIsPronunciationModalOpen] = useState(false);

  const sessionRef = useRef<any | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const currentInputTranscriptionRef = useRef<string>('');
  const currentOutputTranscriptionRef = useRef<string>('');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedResembleKey = localStorage.getItem('resemble_api_key');
    const storedElevenLabsKey = localStorage.getItem('elevenlabs_api_key');
    const storedVoices = localStorage.getItem('custom_voice_profiles');
    const storedRules = localStorage.getItem('pronunciation_rules');
    const storedElevenLabsVoice = localStorage.getItem('elevenlabs_voice_id');
    const storedResembleProj = localStorage.getItem('resemble_project_id');
    const storedResembleVoice = localStorage.getItem('resemble_voice_id');

    if (storedResembleKey) setResembleKey(storedResembleKey);
    if (storedElevenLabsKey) setElevenLabsKey(storedElevenLabsKey);
    if (storedElevenLabsVoice) setElevenLabsVoiceId(storedElevenLabsVoice);
    if (storedResembleProj) setResembleProjectId(storedResembleProj);
    if (storedResembleVoice) setResembleVoiceId(storedResembleVoice);

    if (storedVoices) {
      try { setCustomVoices(JSON.parse(storedVoices)); } catch (e) {}
    }
    if (storedRules) {
      try { setPronunciationRules(JSON.parse(storedRules)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const syncExternalVoices = async () => {
    setIsSyncingVoices(true);
    setError(null);
    try {
      if (narrationProvider === 'elevenlabs' && elevenLabsKey) {
        const res = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': elevenLabsKey }
        });
        if (!res.ok) throw new Error('ElevenLabs Sync Failed - Check API Key');
        const data = await res.json();
        const voices = data.voices.map((v: any) => ({ id: v.voice_id, name: v.name, provider: 'elevenlabs' }));
        setElevenLabsVoices(voices);
      } else if (narrationProvider === 'resemble' && resembleKey) {
        const res = await fetch('https://app.resemble.ai/api/v2/voices', {
          headers: { 'Authorization': `Token token=${resembleKey}` }
        });
        if (!res.ok) throw new Error('Resemble Sync Failed - Check API Key');
        const data = await res.json();
        const voices = data.items.map((v: any) => ({ id: v.uuid, name: v.name, provider: 'resemble' }));
        setResembleVoices(voices);
      } else {
        throw new Error(`Please provide an API key for ${narrationProvider} in Settings.`);
      }
    } catch (err: any) {
      setError(`Sync Error: ${err.message}`);
    } finally {
      setIsSyncingVoices(false);
    }
  };

  const handleSaveApiKey = (resemble: string, eleven: string) => {
    localStorage.setItem('resemble_api_key', resemble);
    localStorage.setItem('elevenlabs_api_key', eleven);
    setResembleKey(resemble);
    setElevenLabsKey(eleven);
  };

  const handleSaveCustomVoice = (voiceData: Omit<CustomVoice, 'id'>) => {
    const newVoice: CustomVoice = { ...voiceData, id: `custom-${Date.now()}` };
    const updated = [...customVoices, newVoice];
    setCustomVoices(updated);
    localStorage.setItem('custom_voice_profiles', JSON.stringify(updated));
    setSelectedVoiceKey(newVoice.id);
    setIsCustomVoiceModalOpen(false);
  };

  const handleSavePronunciationRules = (rules: PronunciationRule[]) => {
    setPronunciationRules(rules);
    localStorage.setItem('pronunciation_rules', JSON.stringify(rules));
  };

  const exportVoices = () => {
    const blob = new globalThis.Blob([JSON.stringify(customVoices, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-profiles-${Date.now()}.json`;
    a.click();
  };

  const importVoices = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re: any) => {
        try {
          const imported = JSON.parse(re.target.result);
          const merged = [...customVoices, ...imported.filter((iv: any) => !customVoices.some(cv => cv.id === iv.id))];
          setCustomVoices(merged);
          localStorage.setItem('custom_voice_profiles', JSON.stringify(merged));
        } catch (e) { setError("Invalid Voice Profile File"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const exportScript = () => {
    const blob = new globalThis.Blob([narrationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${Date.now()}.txt`;
    a.click();
  };

  const importScript = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'text/plain';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re: any) => setNarrationText(re.target.result);
      reader.readAsText(file);
    };
    input.click();
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((track) => track.stop()); streamRef.current = null; }
    if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
    if (inputAudioContextRef.current) { inputAudioContextRef.current.close(); inputAudioContextRef.current = null; }
    if (outputAudioContextRef.current) { sourcesRef.current.forEach(s => s.stop()); sourcesRef.current.clear(); outputAudioContextRef.current.close(); outputAudioContextRef.current = null; }
    setIsSessionActive(false);
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';
    setTranscript(prev => prev.map(m => ({ ...m, isFinal: true })));
  }, []);

  const startSession = async () => {
    setError(null); setIsSessionActive(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const customProfile = customVoices.find(v => v.id === selectedVoiceKey);
      const voiceInstruction = customProfile ? customProfile.instruction : '';
      const baseVoiceName = customProfile ? customProfile.baseVoice : (narrationPrebuiltVoices[selectedVoiceKey]?.voiceName || 'Charon');
      const systemInstruction = `You are a professional documentary narrator. Identity Tone: ${voiceInstruction}. Focus on technical accuracy and dramatic gravity.`;
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: baseVoiceName } } },
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const pcmBlob: Blob = { data: encode(new Uint8Array(new Int16Array(input.map(f => f * 32768)).buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentInputTranscriptionRef.current += text;
              setTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last?.speaker === 'user' && !last.isFinal) {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...last, text: currentInputTranscriptionRef.current };
                  return updated;
                }
                return [...prev, { speaker: 'user', text: currentInputTranscriptionRef.current, isFinal: false }];
              });
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              currentOutputTranscriptionRef.current += text;
              setTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last?.speaker === 'model' && !last.isFinal) {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...last, text: currentOutputTranscriptionRef.current };
                  return updated;
                }
                return [...prev, { speaker: 'model', text: currentOutputTranscriptionRef.current, isFinal: false }];
              });
            }
            if (message.serverContent?.turnComplete) {
              setTranscript(prev => prev.map(m => ({ ...m, isFinal: true })));
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
              const s = outputAudioContextRef.current!.createBufferSource();
              s.buffer = audioBuffer;
              s.connect(outputAudioContextRef.current!.destination);
              const startTime = Math.max(outputAudioContextRef.current!.currentTime, nextStartTimeRef.current);
              s.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
              sourcesRef.current.add(s);
              s.onended = () => sourcesRef.current.delete(s);
            }
          },
          onerror: (err: any) => { setError(`Engine Exception: ${err.message}`); stopSession(); },
          onclose: () => stopSession(),
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) { setError(err.message); setIsSessionActive(false); }
  };

  const generateNarration = async () => {
    setIsGenerating(true); setGenerationStatus('Calibrating Neural Synthesis...'); setError(null); setAudioUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let ruleAppliedText = narrationText;
      pronunciationRules.forEach(r => ruleAppliedText = ruleAppliedText.replace(new RegExp(`\\b${r.word}\\b`, 'gi'), r.alias));

      const isSsml = ruleAppliedText.includes('<speak>');

      if (narrationLanguage !== 'English (US)') {
        setGenerationStatus(`Translating to ${narrationLanguage}...`);
        const transResponse = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `Translate to ${narrationLanguage}. Keep SSML tags <speak>, <break>, <prosody> intact. Script:\n${ruleAppliedText}`
        });
        ruleAppliedText = transResponse.text || ruleAppliedText;
      }

      const chunks = splitTextIntoChunks(ruleAppliedText);
      const audioParts: Uint8Array[] = [];

      for (let i = 0; i < chunks.length; i++) {
        setGenerationStatus(`Synthesizing Sequence ${i + 1}/${chunks.length}...`);
        
        let chunkToSynthesize = chunks[i];
        if (isSsml) {
            if (!chunkToSynthesize.startsWith('<speak>')) chunkToSynthesize = '<speak>' + chunkToSynthesize;
            if (!chunkToSynthesize.endsWith('</speak>')) chunkToSynthesize = chunkToSynthesize + '</speak>';
        }

        try {
          if (narrationProvider === 'elevenlabs') {
            const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenLabsKey },
              body: JSON.stringify({ text: chunkToSynthesize, model_id: 'eleven_multilingual_v2' })
            });
            if (!res.ok) throw new Error(`ElevenLabs API Failed.`);
            audioParts.push(new Uint8Array(await res.arrayBuffer()));
          } else if (narrationProvider === 'resemble') {
             const res = await fetch(`https://app.resemble.ai/api/v2/projects/${resembleProjectId}/clips`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Token token=${resembleKey}` },
               body: JSON.stringify({ body: chunkToSynthesize, voice_uuid: resembleVoiceId })
             });
             if (!res.ok) throw new Error(`Resemble AI API error.`);
             const data = await res.json();
             const audioFetch = await fetch(data.item.link);
             audioParts.push(new Uint8Array(await audioFetch.arrayBuffer()));
          } else {
            let targetModel = 'gemini-2.5-flash-preview-tts';
            if (narrationProvider === 'gemini-3-pro') targetModel = 'gemini-3-pro-preview';
            else if (narrationProvider === 'gemini-3-flash') targetModel = 'gemini-3-flash-preview';
            else if (narrationProvider === 'gemini-2.5-flash') targetModel = 'gemini-2.5-flash-native-audio-preview-09-2025';

            const customProfile = customVoices.find(v => v.id === selectedVoiceKey);
            const baseVoiceName = customProfile ? customProfile.baseVoice : (narrationPrebuiltVoices[selectedVoiceKey]?.voiceName || 'Charon');

            const res = await ai.models.generateContent({
                model: targetModel,
                contents: [{ parts: [{ text: customProfile ? `[Instruction: ${customProfile.instruction}] ${chunkToSynthesize}` : chunkToSynthesize }] }],
                config: { 
                  responseModalities: [Modality.AUDIO], 
                  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: baseVoiceName } } } 
                },
            });
            
            let base64: string | undefined;
            const candidate = res.candidates?.[0];
            if (candidate?.content?.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData?.data) { base64 = part.inlineData.data; break; }
                }
            }
            if (base64) audioParts.push(decode(base64));
          }
          await new Promise(r => setTimeout(r, 100));
        } catch (chunkErr: any) { throw new Error(`Sequence ${i+1} Failed: ${chunkErr.message}`); }
      }
      
      const concatenated = concatenateBuffers(audioParts);
      const isMpeg = narrationProvider === 'elevenlabs' || narrationProvider === 'resemble';
      setAudioUrl(URL.createObjectURL(isMpeg ? new globalThis.Blob([concatenated], { type: 'audio/mpeg' }) : new globalThis.Blob([pcmToWavBlob(concatenated, 24000, 1)], { type: 'audio/wav' })));
    } catch (err: any) { setError(err.message); } finally { setIsGenerating(false); }
  };

  const renderGeminiVoiceSelector = () => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-1">
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Neural Induction (Gemini Only)</label>
        <div className="flex gap-2">
           <button onClick={exportVoices} className="text-[8px] text-gray-500 hover:text-teal-400 font-black uppercase flex items-center gap-1 transition-colors"><ArrowDownTrayIcon className="w-3 h-3" /> Export Profiles</button>
           <button onClick={importVoices} className="text-[8px] text-gray-500 hover:text-teal-400 font-black uppercase flex items-center gap-1 transition-colors"><ArrowUpTrayIcon className="w-3 h-3" /> Import Profiles</button>
        </div>
      </div>
      <div className="flex gap-2">
        <select 
          value={selectedVoiceKey} 
          onChange={(e) => setSelectedVoiceKey(e.target.value)} 
          className="flex-grow bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-xs outline-none focus:ring-1 focus:ring-teal-500/50"
        >
          <optgroup label="Core Presets" className="bg-gray-900">
            {Object.keys(narrationPrebuiltVoices).map(v => <option key={v} value={v}>{v}</option>)}
          </optgroup>
          {customVoices.length > 0 && (
            <optgroup label="Inducted Identity Blueprints" className="bg-gray-900">
              {customVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </optgroup>
          )}
        </select>
        <button 
          onClick={() => setIsCustomVoiceModalOpen(true)} 
          className="px-4 bg-teal-600/20 border border-teal-500/40 rounded-lg text-teal-400 hover:bg-teal-600/30 flex items-center gap-2 transition-all"
          title="Analyze your audio to create a text-based induction instruction"
        >
          <SparklesIcon className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Clone Voice (Gemini Induction)</span>
        </button>
      </div>
    </div>
  );

  return (
    <main className="bg-gray-900 text-white h-screen flex flex-col font-sans overflow-hidden">
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex flex-col items-center gap-4 shrink-0 shadow-2xl relative z-10">
        <div className="flex items-center gap-3">
          <AppLogo />
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-cyan-300 font-orbitron tracking-tighter text-center">AI Voice Studio</h1>
            <div className="mt-2 text-center">
              <span className="text-[7px] bg-teal-500/10 text-teal-400 px-2 py-1 rounded border border-teal-500/20 font-black uppercase tracking-[0.2em]">Authentic Voice Synthesis Production</span>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-between items-center max-w-md">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsTutorialModalOpen(true)} className="text-gray-400 hover:text-teal-300 transition-colors" title="Help & Documentation"><InformationCircleIcon className="w-6 h-6" /></button>
              <button onClick={() => setIsPronunciationModalOpen(true)} className="text-gray-400 hover:text-teal-300 transition-colors" title="Pronunciation Dictionary"><BookOpenIcon className="w-6 h-6" /></button>
            </div>
            <div className="inline-flex bg-gray-900 border border-gray-700 rounded-lg p-1">
                <button onClick={() => { stopSession(); setMode('conversation'); }} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${mode === 'conversation' ? 'bg-teal-600 shadow-lg' : 'text-gray-400'}`}>Live Chat</button>
                <button onClick={() => { stopSession(); setMode('narration'); }} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${mode === 'narration' ? 'bg-teal-600 shadow-lg' : 'text-gray-400'}`}>Narration Studio</button>
            </div>
             <button onClick={() => setIsApiKeyModalOpen(true)} className="text-gray-400 hover:text-teal-300 transition-colors" title="Settings & API Keys"><KeyIcon className="w-6 h-6" /></button>
        </div>
      </header>

      <div className="flex-grow flex flex-col overflow-hidden relative">
        {mode === 'conversation' ? (
          <div className="flex-grow w-full max-w-4xl mx-auto flex flex-col p-4 relative min-h-0">
            <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 mb-4 shrink-0">
               {renderGeminiVoiceSelector()}
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pb-32 scroll-container min-h-0 px-2">
              {transcript.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                  <SparklesIcon className="w-16 h-16 text-teal-500 mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Neural Core Standby...</p>
                </div>
              )}
              {transcript.map((msg, i) => (
                <div key={i} className={`flex items-start gap-4 ${msg.speaker === 'user' ? 'justify-end' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] border shadow-xl ${msg.speaker === 'model' ? 'bg-gray-800 border-gray-700 text-teal-50' : 'bg-teal-900/40 border-teal-500/30 text-teal-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${msg.speaker === 'model' ? 'border-teal-500/30 text-teal-400' : 'border-teal-300/30 text-teal-200'}`}>
                        {msg.speaker === 'model' ? 'Neural Link' : 'Vocal Ingress'}
                       </span>
                    </div>
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.text || 'Syncing...'}</p>
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg flex items-center gap-4 px-4 z-20">
                <button onClick={() => setTranscript([])} className="p-4 bg-gray-900 border border-gray-700 rounded-2xl hover:bg-gray-800 text-gray-500 transition-all shadow-xl"><TrashIcon className="w-5 h-5" /></button>
                <div className="flex-grow">
                  <button onClick={isSessionActive ? stopSession : startSession} className={`w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] border shadow-2xl transition-all ${isSessionActive ? 'bg-red-600 border-red-400' : 'bg-teal-600 border-teal-400 shadow-teal-500/30'}`}>
                    {isSessionActive ? <><StopCircleIcon className="w-5 h-5" /> Terminate Link</> : <><MicrophoneIcon className="w-5 h-5" /> Initialize Sync</>}
                  </button>
                </div>
                <button onClick={stopSession} disabled={!isSessionActive} className="p-4 bg-gray-900 border border-gray-700 rounded-2xl hover:bg-gray-800 text-gray-400 transition-all shadow-xl disabled:opacity-20"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
          </div>
        ) : (
          <div className="flex-grow w-full max-w-5xl mx-auto p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar scroll-container">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800/40 p-5 rounded-3xl border border-gray-700/50">
                <div>
                    <label className="block text-[9px] font-black text-gray-500 mb-1 uppercase tracking-widest">Synthesis Pipeline</label>
                    <select value={narrationProvider} onChange={(e) => setNarrationProvider(e.target.value as SvgProvider)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-xs outline-none">
                      <option value="gemini-2.5-tts">Gemini 2.5 TTS (Induction)</option>
                      <option value="gemini-3-pro">Gemini 3 Pro (Precision)</option>
                      <option value="gemini-3-flash">Gemini 3 Flash (Speed)</option>
                      <option value="elevenlabs">ElevenLabs (Account Library)</option>
                      <option value="resemble">Resemble AI (Studio Clones)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[9px] font-black text-gray-500 mb-1 uppercase tracking-widest">Vocal Target Language</label>
                    <select value={narrationLanguage} onChange={(e) => setNarrationLanguage(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-xs outline-none">
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                  {narrationProvider === 'elevenlabs' ? (
                     <div className="flex flex-col gap-1">
                        <div className="flex justify-between">
                           <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Account Clones & Public Library</label>
                           <button onClick={syncExternalVoices} className="text-[8px] text-teal-400 font-black uppercase hover:text-white transition-colors">{isSyncingVoices ? 'Contacting Server...' : '↻ Sync Account Voices'}</button>
                        </div>
                        <div className="flex gap-2">
                          <select 
                            value={elevenLabsVoiceId} 
                            onChange={(e) => { setElevenLabsVoiceId(e.target.value); localStorage.setItem('elevenlabs_voice_id', e.target.value); }} 
                            className="flex-grow bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-xs outline-none"
                          >
                            <option value="">Choose an Authentic Clone...</option>
                            {elevenLabsVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                        </div>
                     </div>
                  ) : narrationProvider === 'resemble' ? (
                     <div className="flex flex-col gap-1">
                         <div className="flex justify-between">
                           <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Resemble Project Voices</label>
                           <button onClick={syncExternalVoices} className="text-[8px] text-teal-400 font-black uppercase hover:text-white transition-colors">↻ Sync Library</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select 
                            value={resembleVoiceId} 
                            onChange={(e) => { setResembleVoiceId(e.target.value); localStorage.setItem('resemble_voice_id', e.target.value); }} 
                            className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-xs outline-none"
                          >
                            <option value="">Choose Profile...</option>
                            {resembleVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                          <input type="text" value={resembleProjectId} onChange={(e) => { setResembleProjectId(e.target.value); localStorage.setItem('resemble_project_id', e.target.value); }} className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-[10px]" placeholder="Resemble Project UUID" />
                        </div>
                     </div>
                  ) : renderGeminiVoiceSelector()}
                </div>
            </div>
            <div className="flex flex-col flex-grow min-h-[300px]">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">NARATIVE MANUSCRIPT (PROSODY STACK ACTIVE (PROSODY STACK ACTIVE)</label>
                    <div className="flex gap-3">
                       <button onClick={exportScript} className="text-[8px] text-gray-500 hover:text-teal-400 font-black uppercase flex items-center gap-1 transition-colors"><ArrowDownTrayIcon className="w-3 h-3" /> Export Script</button>
                       <button onClick={importScript} className="text-[8px] text-gray-500 hover:text-teal-400 font-black uppercase flex items-center gap-1 transition-colors"><ArrowUpTrayIcon className="w-3 h-3" /> Import Script</button>
                    </div>
                 </div>
                 <textarea value={narrationText} onChange={(e) => setNarrationText(e.target.value)} className="w-full flex-grow bg-gray-800 border border-gray-700 rounded-3xl p-6 text-white font-mono text-xs leading-relaxed custom-scrollbar shadow-2xl focus:ring-1 focus:ring-teal-500/30 outline-none" disabled={isGenerating} />
            </div>
            <div className="flex justify-center my-4">
                 <button onClick={generateNarration} disabled={isGenerating || !narrationText} className="px-20 py-5 rounded-full bg-teal-600 hover:bg-teal-500 font-black uppercase text-[11px] tracking-[0.2em] border border-teal-400/40 shadow-2xl transition-all active:scale-95">
                    {isGenerating ? <div className="flex items-center gap-3"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> {generationStatus}</div> : "Start Production Sequence"}
                </button>
            </div>
            {audioUrl && (
                <div className="mb-6 p-6 bg-gray-800 rounded-3xl border border-teal-500/20 shadow-2xl animate-in zoom-in duration-500 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-teal-500 tracking-widest">
                        <span>Production Master Ready</span>
                        <span className="opacity-50">PCM 24bit Equivalent</span>
                    </div>
                    <audio controls src={audioUrl} className="w-full rounded-full bg-gray-900 border border-gray-700"></audio>
                    <a href={audioUrl} download={`studio-master-${Date.now()}.wav`} className="block text-center px-4 py-4 rounded-2xl bg-teal-500 hover:bg-teal-600 font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-teal-500/20">Download Production Master</a>
                </div>
            )}
          </div>
        )}
      </div>

      <footer className="bg-gray-800 border-t border-gray-700 p-2 flex justify-between px-6 shrink-0 text-[7px] font-black text-gray-600 uppercase tracking-widest relative z-10">
        <span>System v1.5.0 • Mastering Architecture Active</span>
        <span>© 2025 AI Voice Studio Master Suite</span>
      </footer>

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-950/95 border border-red-500 text-red-100 p-5 rounded-3xl shadow-2xl max-w-sm z-[300] animate-in slide-in-from-right-8 duration-500">
          <p className="text-[10px] font-black uppercase mb-2 tracking-widest text-red-400 font-orbitron">Engine Alert</p>
          <div className="max-h-40 overflow-y-auto custom-scrollbar pr-2">
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="absolute top-4 right-4 text-red-400 text-xl hover:text-white transition-all">&times;</button>
        </div>
      )}
      <CustomVoiceModal isOpen={isCustomVoiceModalOpen} onClose={() => setIsCustomVoiceModalOpen(false)} onSave={handleSaveCustomVoice} />
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} onSave={handleSaveApiKey} initialResembleKey={resembleKey} initialElevenLabsKey={elevenLabsKey} />
      <PronunciationModal isOpen={isPronunciationModalOpen} onClose={() => setIsPronunciationModalOpen(false)} rules={pronunciationRules} onSave={handleSavePronunciationRules} />
      <TutorialModal isOpen={isTutorialModalOpen} onClose={() => setIsTutorialModalOpen(false)} />
    </main>
  );
};

export default App;