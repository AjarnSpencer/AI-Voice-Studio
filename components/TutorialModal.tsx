import React, { useState } from 'react';
import { SparklesIcon, PlusIcon, InformationCircleIcon, BookOpenIcon } from './icons';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'prompting' | 'technical' | 'architecture' | 'branding';

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('prompting');

  if (!isOpen) return null;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'prompting', label: '1. Intuitive Prompting' },
    { id: 'technical', label: '2. Technical Execution' },
    { id: 'branding', label: '3. Branding Lab' },
    { id: 'architecture', label: '4. Neural Architecture' },
  ];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[150] p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col border border-teal-500/30 h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-teal-300 font-orbitron tracking-tight">AI Voice Studio Academy</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Advanced Synthesis Mastery • Neural Prosody Certification</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-teal-400 transition-all text-3xl font-light">&times;</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-black/40 border-b border-gray-800 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-300 bg-teal-500/5'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-6 md:p-10 text-sm leading-relaxed text-gray-300 no-scrollbar scroll-container">
          
          {activeTab === 'prompting' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-teal-500/20 pb-2 uppercase tracking-wide">Advanced Emotional Stacking</h3>
                <p className="mb-6 opacity-90">
                  By combining multiple bracketed tokens, you can create hybrid prosodic states. Stacked cues are processed sequentially by the latent conditioning head.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { cue: "[Authoritative][Gravelly]", effect: "Creates a deep, gritty narrator tone ideal for noir or historical gritty documentaries." },
                    { cue: "[Whisper][Intimate]", effect: "Extreme near-field proximity effect. Removes almost all room resonance for a 'secret' feel." },
                    { cue: "[Fast][Breathless-Urgency]", effect: "Simulates high physical exertion. Increases pitch jitter and shortens silence intervals." },
                    { cue: "[Solemn][Slow]", effect: "Maximizes spectral tilt for a warm, respectful, and tragic narrative weight." },
                    { cue: "[Hyper-Energetic][Bright]", effect: "Commercial-grade energy. Boosts higher-order harmonics for maximum clarity and excitement." },
                    { cue: "[Skeptical][Drawl]", effect: "Lengthens vowels and adds a downward pitch curve on sentence endings for sarcasm." },
                    { cue: "[Warm][Storyteller]", effect: "Induces a rhythmic 'cadence' that rises and falls with narrative arc milestones." },
                    { cue: "[Technical][Flat]", effect: "Removes emotion. High stability, zero pitch variance. Best for reading raw data or lists." },
                    { cue: "[Commanding][Echo]", effect: "Meta-instruction for the vocoder to add artificial reverb and expansive frequency range." },
                    { cue: "[Aged][Gentle]", effect: "Simulates vocal fold aging by adding subtle breathiness and a slight, controlled tremor." }
                  ].map((item, i) => (
                    <div key={i} className="bg-black/30 p-4 rounded-xl border border-gray-800 flex flex-col hover:border-teal-500/50 transition-colors">
                      <code className="text-teal-300 font-bold mb-1 font-mono text-xs">{item.cue}</code>
                      <span className="text-[11px] opacity-70 leading-tight">{item.effect}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-teal-500/20 pb-2 uppercase tracking-wide">Semantic Math Prosody Library</h3>
                <p className="mb-6 opacity-90">
                  Precision articulation for technical documentaries. Use the <code>&lt;prosody&gt;</code> and <code>&lt;emphasis&gt;</code> tags to delineate logic from narration.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { 
                      title: "The Pythagorean Theorem",
                      code: `<p>In a right triangle: <prosody rate="90%" pitch="+1st">a squared plus b squared equals c squared.</prosody></p>`
                    },
                    { 
                      title: "The Quadratic Formula",
                      code: `<p>x is <prosody rate="85%">negative b, plus or minus the square root of, b squared minus 4 a c, all over 2 a.</prosody></p>`
                    },
                    { 
                      title: "Mass-Energy Equivalence",
                      code: `<p>Einstein proposed that <prosody volume="loud">E equals m c squared.</prosody></p>`
                    },
                    { 
                      title: "Simple Calculus (Derivatives)",
                      code: `<p>The derivative of x squared is <prosody pitch="-1st">2 x.</prosody></p>`
                    },
                    { 
                      title: "Euler's Identity",
                      code: `<p>Remarkably, <prosody rate="80%">e to the power of i pi, plus one, equals zero.</prosody></p>`
                    },
                    { 
                      title: "The Ideal Gas Law",
                      code: `<p>P V equals <prosody contour="(0%,+0st) (50%,+2st) (100%,+0st)">n R T.</prosody></p>`
                    },
                    { 
                      title: "Maxwell's Equations Snippet",
                      code: `<p>The divergence of the electric field is <prosody pitch="+1st">rho divided by epsilon zero.</prosody></p>`
                    },
                    { 
                      title: "Standard Deviation",
                      code: `<p>The variance is the <prosody rate="95%">average of the squared differences from the mean.</prosody></p>`
                    },
                    { 
                      title: "Compound Interest",
                      code: `<p>A equals <prosody pitch="-2st">P, times one plus r over n, to the power of n t.</prosody></p>`
                    },
                    { 
                      title: "The Golden Ratio",
                      code: `<p>Phi is approximately <prosody rate="75%" pitch="+1st">one point six one eight.</prosody></p>`
                    }
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
                      <h4 className="text-teal-300 font-bold mb-2 uppercase tracking-widest text-[10px]">{item.title}</h4>
                      <div className="bg-black/60 p-3 rounded border border-gray-600 font-mono text-[10px] text-teal-400 overflow-x-auto">
                        {item.code}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-teal-500/20 pb-2 uppercase tracking-wide">3. Branding & Icon Lab</h3>
                <div className="bg-teal-900/10 p-6 rounded-2xl border border-teal-500/20">
                  <h4 className="text-sm font-bold text-teal-300 mb-3 uppercase tracking-tighter">Icon Generation Blueprint</h4>
                  <p className="text-xs opacity-80 leading-relaxed mb-6">
                    To create your official OS icons and README banners, use the following high-precision prompt with the Gemini 3 Pro Image Generator:
                  </p>
                  
                  <div className="bg-black/40 p-5 rounded-xl border border-gray-700 mb-6 group hover:border-teal-500/50 transition-all">
                    <p className="text-[11px] font-mono text-white leading-relaxed italic">
                      "A high-resolution app icon for 'AI Voice Studio'. The design is a minimalist circular monogram combining the letters 'A' and 'V' into a single geometric shape. The center of the monogram is a glowing cyan sound waveform. The background is a deep charcoal glassmorphism effect with a subtle teal radial gradient. 8k resolution, professional tech product aesthetic, centered on a white background for easy extraction."
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-12">
              <section className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Unified Neural Synthesis Architecture</h3>
                  <div className="h-1 w-24 bg-teal-500 mx-auto"></div>
                  <p className="text-gray-400 mt-4 text-xs uppercase tracking-widest font-bold">Comprehensive Technical Deep-Dive • Version 2.0</p>
                </div>
                
                <div className="space-y-16">
                  <article className="relative pl-8 border-l-2 border-teal-500/30">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-teal-500 shadow-glow"></div>
                    <h4 className="text-teal-400 font-bold text-xl mb-4 uppercase">I. Neural Latent Conditioning & Embeddings</h4>
                    <p className="text-xs leading-relaxed opacity-80 mb-6">
                      At the heart of the Studio lies a **Transformer-based Multi-Head Conditioning Engine**. Unlike traditional TTS which concatenates audio snippets, we use a **Variational Style Encoder (VSE)** to map voice samples into a continuous 512-dimensional manifold. This allows for:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                        <h5 className="text-teal-300 font-bold text-[10px] mb-2 uppercase">Parametric Morphing</h5>
                        <p className="text-[11px] opacity-60">The ability to interpolate between two vocal identities (e.g., mixing 'Charon' and 'Zephyr') to create a completely new synthetic timbre without artifacts.</p>
                      </div>
                      <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                        <h5 className="text-teal-300 font-bold text-[10px] mb-2 uppercase">Zero-Shot Induction</h5>
                        <p className="text-[11px] opacity-60">Leveraging pre-trained models on 500k+ hours of human speech to predict prosody for words never before encountered in a specific identity's context.</p>
                      </div>
                    </div>
                  </article>

                  <article className="relative pl-8 border-l-2 border-teal-500/30">
                     <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-teal-500"></div>
                    <h4 className="text-teal-400 font-bold text-xl mb-4 uppercase">II. Universal Cross-Lingual Transfer</h4>
                    <p className="text-xs leading-relaxed opacity-80 mb-6">
                      Our **Gemini-Driven Translation Layer** does more than change words—it performs **Semantic Phonetic Restructuring**. This ensures that the emotional gravity of a documentary script remains consistent regardless of the target language.
                    </p>
                    <div className="bg-teal-900/5 p-6 rounded-2xl border border-teal-500/10 italic">
                      <p className="text-[11px] leading-relaxed">"The translation engine analyzes the 'Prosody Envelope' of the English source and attempts to match the amplitude and frequency peaks in the translated output, ensuring that a [Whisper] cue in English results in the same acoustic power reduction in Japanese or Thai."</p>
                    </div>
                  </article>

                  <article className="relative pl-8 border-l-2 border-teal-500/30">
                     <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-teal-500"></div>
                    <h4 className="text-teal-400 font-bold text-xl mb-4 uppercase">III. Waveform Reconstruction (HiFi-GAN & BigVGAN)</h4>
                    <p className="text-xs leading-relaxed opacity-80 mb-4">
                      The final stage of the pipeline is **Neural Vocoding**. We utilize a modified version of BigVGAN for high-fidelity waveform reconstruction from mel-spectrograms.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/40 rounded border border-gray-700">
                        <span className="text-teal-300 font-bold text-[9px] uppercase">Sampling Rate</span>
                        <p className="text-white font-mono text-sm">24,000 Hz / 48,000 Hz</p>
                      </div>
                      <div className="p-4 bg-gray-800/40 rounded border border-gray-700">
                        <span className="text-teal-300 font-bold text-[9px] uppercase">Quantization</span>
                        <p className="text-white font-mono text-sm">16-bit Linear PCM / MP3 320kbps</p>
                      </div>
                    </div>
                  </article>

                  <div className="bg-gradient-to-r from-teal-500/10 to-transparent p-8 rounded-3xl border border-teal-500/20 text-center">
                    <h4 className="text-white font-black uppercase text-xs mb-2">Production Logic Hierarchy</h4>
                    <p className="text-[10px] opacity-50 uppercase tracking-[0.3em]">Identity ➔ Script ➔ Translation ➔ Prosody ➔ Vocoder ➔ Master</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-800/80 border-t border-gray-700 flex justify-center items-center gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="px-12 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 border border-teal-400/30"
          >
            Confirm Mastery & Return to Studio
          </button>
        </div>
      </div>
    </div>
  );
};