import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resembleKey: string, elevenLabsKey: string) => void;
  initialResembleKey?: string;
  initialElevenLabsKey?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialResembleKey = '',
  initialElevenLabsKey = ''
}) => {
  const [resembleKey, setResembleKey] = useState(initialResembleKey);
  const [elevenLabsKey, setElevenLabsKey] = useState(initialElevenLabsKey);

  useEffect(() => {
    setResembleKey(initialResembleKey);
    setElevenLabsKey(initialElevenLabsKey);
  }, [initialResembleKey, initialElevenLabsKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(resembleKey.trim(), elevenLabsKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4 backdrop-blur-md" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-teal-500/30" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-teal-300 font-orbitron tracking-tight">Secure Connect</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Multi-Engine Synthesis Credentials</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-3xl font-light">&times;</button>
        </div>
        
        <div className="p-8 space-y-6">
          {/* Gemini Integrated Status (Non-Editable as per system security) */}
          <div className="bg-teal-500/5 p-4 rounded-xl border border-teal-500/20 flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-teal-500 uppercase tracking-wider">Google Gemini API</label>
              <p className="text-xs text-teal-100 font-bold mt-1">Cloud Integration Active</p>
              <p className="text-[9px] text-teal-500/60 uppercase mt-1">Native Core Engine • High Priority</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              <span className="text-[10px] font-black text-teal-400 uppercase">Securely Linked</span>
            </div>
          </div>

          <p className="text-gray-400 text-[10px] leading-relaxed uppercase tracking-tighter text-center italic">
            Third-party keys are stored locally in your browser cache and are transmitted only via direct encrypted TLS to provider endpoints.
          </p>
          
          <div className="space-y-4">
            {/* ElevenLabs */}
            <div className="bg-black/40 p-5 rounded-xl border border-gray-700 hover:border-teal-500/40 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-teal-300 uppercase tracking-wider">ElevenLabs Key</label>
                <a href="https://elevenlabs.io/api" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-500 hover:text-teal-400 underline">Get Key</a>
              </div>
              <input
                type="password"
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value)}
                placeholder="Enter your ElevenLabs API key..."
                className="w-full bg-transparent border-b border-gray-700 p-2 text-sm text-teal-100 outline-none focus:border-teal-500 transition-all font-mono"
              />
              <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-widest">Enables high-fidelity cloning & professional models</p>
            </div>

            {/* Resemble AI */}
            <div className="bg-black/40 p-5 rounded-xl border border-gray-700 hover:border-teal-500/40 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Resemble AI Key (Optional)</label>
              </div>
              <input
                type="password"
                value={resembleKey}
                onChange={(e) => setResembleKey(e.target.value)}
                placeholder="Legacy connector (optional)..."
                className="w-full bg-transparent border-b border-gray-700 p-2 text-sm text-gray-500 outline-none focus:border-gray-400 transition-all font-mono"
              />
              <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-widest">Support for legacy rapid-clone projects</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
              <button 
                onClick={handleSave} 
                className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-xl shadow-teal-500/20 active:scale-95 border border-teal-400/30"
              >
                Sync & Connect Engines
              </button>
              <button onClick={onClose} className="w-full py-2 text-gray-500 hover:text-gray-300 text-[10px] font-bold uppercase tracking-widest transition-colors">
                Return to Studio
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};