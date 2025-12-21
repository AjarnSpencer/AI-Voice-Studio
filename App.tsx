import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAiBlob } from '@google/genai';
import {
  MicrophoneIcon,
  StopCircleIcon,
  SparklesIcon,
  KeyIcon,
  BookOpenIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  InformationCircleIcon,
  TrashIcon
} from './components/icons';
import { CustomVoiceModal } from './components/CustomVoiceModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PronunciationModal, type PronunciationRule } from './components/PronunciationModal';
import { TutorialModal } from './components/TutorialModal';
import { LanguageList } from './components/LanguageList';
import { type TranscriptMessage } from './types';
import {
  encode,
  decode,
  decodeAudioData,
  pcmToWavBlob,
  concatenateBuffers
} from './utils/audio';

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

type AppMode = 'conversation' | 'narration';
type SvgProvider =
  | 'gemini-2.5-tts'
  | 'gemini-3-pro'
  | 'gemini-3-flash'
  | 'gemini-2.5-flash'
  | 'elevenlabs'
  | 'resemble';

const App: React.FC = () => {
  /* =========================
     API KEYS (FIXED)
     ========================= */
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [elevenLabsKey, setElevenLabsKey] = useState<string>('');
  const [resembleKey, setResembleKey] = useState<string>('');

  /* =========================
     CORE STATE
     ========================= */
  const [mode, setMode] = useState<AppMode>('narration');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  /* =========================
     MODALS
     ========================= */
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [isCustomVoiceModalOpen, setIsCustomVoiceModalOpen] = useState(false);
  const [isPronunciationModalOpen, setIsPronunciationModalOpen] = useState(false);

  /* =========================
     NARRATION
     ========================= */
  const [narrationProvider, setNarrationProvider] =
    useState<SvgProvider>('gemini-2.5-tts');
  const [narrationText, setNarrationText] = useState('');
  const [narrationLanguage, setNarrationLanguage] = useState('English (US)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  /* =========================
     VOICES / RULES
     ========================= */
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [pronunciationRules, setPronunciationRules] = useState<PronunciationRule[]>([]);

  /* =========================
     AUDIO / SESSION REFS
     ========================= */
  const sessionRef = useRef<any | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  /* =========================
     LOAD FROM STORAGE
     ========================= */
  useEffect(() => {
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setElevenLabsKey(localStorage.getItem('elevenlabs_api_key') || '');
    setResembleKey(localStorage.getItem('resemble_api_key') || '');

    const voices = localStorage.getItem('custom_voice_profiles');
    const rules = localStorage.getItem('pronunciation_rules');

    if (voices) setCustomVoices(JSON.parse(voices));
    if (rules) setPronunciationRules(JSON.parse(rules));
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  /* =========================
     API KEY SAVE HANDLER
     ========================= */
  const handleSaveApiKey = (gemini: string, eleven: string, resemble: string) => {
    localStorage.setItem('gemini_api_key', gemini);
    localStorage.setItem('elevenlabs_api_key', eleven);
    localStorage.setItem('resemble_api_key', resemble);
    setGeminiKey(gemini);
    setElevenLabsKey(eleven);
    setResembleKey(resemble);
    setIsApiKeyModalOpen(false);
  };

  /* =========================
     LIVE SESSION
     ========================= */
  const startSession = async () => {
    if (!geminiKey) {
      setError('Gemini API key is missing.');
      return;
    }

    setIsSessionActive(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      sessionRef.current = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
        },
        callbacks: {
          onmessage: (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription?.text) {
              setTranscript(prev => [
                ...prev,
                {
                  speaker: 'model',
                  text: msg.serverContent.outputTranscription.text,
                  isFinal: true
                }
              ]);
            }
          },
          onerror: (e: any) => {
            setError(e.message || 'Gemini session error');
            stopSession();
          },
          onclose: stopSession
        }
      });
    } catch (e: any) {
      setError(e.message);
      setIsSessionActive(false);
    }
  };

  const stopSession = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    setIsSessionActive(false);
  }, []);

  /* =========================
     NARRATION GENERATION
     ========================= */
  const generateNarration = async () => {
    if (!geminiKey) {
      setError('Gemini API key is missing.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      let text = narrationText;
      pronunciationRules.forEach(r => {
        text = text.replace(new RegExp(`\\b${r.word}\\b`, 'gi'), r.alias);
      });

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO]
        }
      });

      let base64: string | undefined;
      for (const p of res.candidates?.[0]?.content?.parts || []) {
        if (p.inlineData?.data) base64 = p.inlineData.data;
      }

      if (!base64) throw new Error('No audio returned');

      const pcm = decode(base64);
      setAudioUrl(URL.createObjectURL(pcmToWavBlob(pcm, 24000, 1)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  /* =========================
     RENDER
     ========================= */
  return (
    <main className="bg-gray-900 text-white h-screen flex flex-col overflow-hidden">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Voice Studio</h1>
        <div className="flex gap-4">
          <button onClick={() => setIsTutorialModalOpen(true)}>
            <InformationCircleIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setIsPronunciationModalOpen(true)}>
            <BookOpenIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setIsApiKeyModalOpen(true)}>
            <KeyIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-grow p-4 overflow-y-auto">
        <LanguageList />

        <textarea
          className="w-full h-40 bg-gray-800 p-4 rounded"
          value={narrationText}
          onChange={e => setNarrationText(e.target.value)}
        />

        <button
          onClick={generateNarration}
          disabled={isGenerating}
          className="mt-4 bg-teal-600 px-6 py-3 rounded font-bold"
        >
          {isGenerating ? 'Generating…' : 'Generate Narration'}
        </button>

        {audioUrl && (
          <audio controls className="mt-4 w-full" src={audioUrl} />
        )}

        <div ref={transcriptEndRef} />
      </div>

      {error && (
        <div className="absolute bottom-4 right-4 bg-red-800 p-4 rounded">
          {error}
        </div>
      )}

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        geminiKey={geminiKey}
        elevenLabsKey={elevenLabsKey}
        resembleKey={resembleKey}
      />

      <CustomVoiceModal
        isOpen={isCustomVoiceModalOpen}
        onClose={() => setIsCustomVoiceModalOpen(false)}
        onSave={v => {
          const updated = [...customVoices, v];
          setCustomVoices(updated);
          localStorage.setItem('custom_voice_profiles', JSON.stringify(updated));
        }}
      />

      <PronunciationModal
        isOpen={isPronunciationModalOpen}
        onClose={() => setIsPronunciationModalOpen(false)}
        rules={pronunciationRules}
        onSave={rules => {
          setPronunciationRules(rules);
          localStorage.setItem('pronunciation_rules', JSON.stringify(rules));
        }}
      />

      <TutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
      />
    </main>
  );
};

export default App;
