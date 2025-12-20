import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { MicrophoneIcon, UploadIcon, SparklesIcon } from './icons';

interface CustomVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (voice: { name: string; instruction: string; baseVoice: string }) => void;
}

type ModalView = 'initial' | 'analyzing' | 'refining';

export const CustomVoiceModal: React.FC<CustomVoiceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ModalView>('initial');
  const [analysisResult, setAnalysisResult] = useState<{ instruction: string; baseVoice: string } | null>(null);
  const [editedInstruction, setEditedInstruction] = useState('');
  const [voiceName, setVoiceName] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      setView('initial');
      setAudioBlob(null);
      setError(null);
      setIsRecording(false);
      setAnalysisResult(null);
      setEditedInstruction('');
      setVoiceName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError("Microphone access denied.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('audio/')) setAudioBlob(file);
    else setError("Invalid audio file.");
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setView('analyzing');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      await new Promise(r => reader.onload = r);
      const base64Audio = (reader.result as string).split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [
          { inlineData: { mimeType: audioBlob.type, data: base64Audio } },
          { text: "Analyze the tone, pitch, and prosody of this voice. Provide a JSON object with 'instruction' (detailed description for AI mimicking) and 'baseVoice' (either 'Charon' or 'Kore' as the structural foundation)." }
        ]},
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              instruction: { type: Type.STRING },
              baseVoice: { type: Type.STRING }
            }
          }
        }
      });
      
      const parsed = JSON.parse(response.text);
      setAnalysisResult(parsed);
      setEditedInstruction(parsed.instruction);
      setVoiceName(`Inducted Identity ${Date.now().toString().slice(-4)}`);
      setView('refining');
    } catch (err) {
      setError("Neural analysis failed.");
      setView('initial');
    }
  };

  const handleSave = () => {
    if (!analysisResult) return;
    onSave({
      name: voiceName || "Custom Identity",
      instruction: editedInstruction,
      baseVoice: analysisResult.baseVoice,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[250] p-4 backdrop-blur-md" onClick={onClose}>
      <div className="bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 border border-teal-500/30 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
           <SparklesIcon className="w-6 h-6 text-teal-400" />
           <h2 className="text-2xl font-bold text-teal-300 font-orbitron">Neural Induction</h2>
        </div>
        
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6 leading-relaxed">
           Induction creates a textual "blueprint" of your voice for Gemini engines. 
           For authentic clones, use ElevenLabs or Resemble library sync.
        </p>
        
        {view === 'initial' && (
          <div className="space-y-6">
            <div className="flex bg-gray-800 p-1 rounded-xl">
               <button onClick={() => setActiveTab('record')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'record' ? 'bg-teal-600' : 'text-gray-500'}`}>Capture Sample</button>
               <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'upload' ? 'bg-teal-600' : 'text-gray-500'}`}>Upload Master</button>
            </div>
            <div className="min-h-[160px] flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl p-4 transition-all hover:border-teal-500/40">
              {activeTab === 'record' ? (
                <button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`p-6 rounded-full shadow-2xl transition-all ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-teal-500 hover:scale-105'}`}>
                  <MicrophoneIcon className="w-8 h-8"/>
                </button>
              ) : (
                <label className="cursor-pointer flex flex-col items-center group">
                  <UploadIcon className="w-10 h-10 text-teal-500 mb-2 group-hover:scale-110 transition-transform"/>
                  <span className="text-xs font-bold uppercase text-gray-400">Select Audio Identity</span>
                  <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
              {audioBlob && <p className="mt-4 text-[10px] text-teal-400 font-black uppercase tracking-widest">Acoustic Vector Cached</p>}
            </div>
          </div>
        )}

        {view === 'analyzing' && (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold uppercase tracking-widest animate-pulse">Decomposing Identity...</h3>
          </div>
        )}

        {view === 'refining' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-widest">Inducted Label</label>
                <input type="text" value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-teal-300 outline-none" placeholder="e.g. Documentary Lead" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-widest">Prosody Blueprint</label>
                <textarea value={editedInstruction} onChange={(e) => setEditedInstruction(e.target.value)} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-xs text-white custom-scrollbar outline-none focus:ring-1 focus:ring-teal-500/30" />
            </div>
            <div className="text-[10px] font-black uppercase text-teal-500/60 flex justify-between">
               <span>Base Topology: {analysisResult?.baseVoice}</span>
               <span>Confidence: High</span>
            </div>
          </div>
        )}
        
        {error && <p className="text-red-400 text-center text-[10px] mt-4 uppercase font-bold tracking-widest">{error}</p>}
        
        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Abort</button>
          {view === 'initial' && <button onClick={handleAnalyze} disabled={!audioBlob} className="flex-1 py-4 bg-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 disabled:opacity-30">Extract Blueprint</button>}
          {view === 'refining' && <button onClick={handleSave} className="flex-1 py-4 bg-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-500/20">Finalize Identity</button>}
        </div>
      </div>
    </div>
  );
};