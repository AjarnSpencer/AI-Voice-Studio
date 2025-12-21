# 🎙️ AI Voice Studio (Advanced Multi-Engine Suite)

<p align="center">
  <img src="https://github.com/AjarnSpencer/AI-Voice-Studio/blob/main/assets/appicon_x4.png" alt="AI Voice Studio Banner" width="60%" style="text-align:center;">
</p>

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-teal.svg)](https://opensource.org/licenses/Apache-2.0)
[![Engines](https://img.shields.io/badge/Engines-Gemini%20%7C%20ElevenLabs%20%7C%20Resemble-cyan.svg)](https://aistudio.google.com)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-black.svg)]()

**AI Voice Studio** is a professional-grade audio production environment designed for high-fidelity documentary narration. It bridges the gap between mechanical Text-to-Speech and genuine human-like performance by connecting your production pipeline directly to frontier AI models.

---

## 🚀 Key Features

- **Multi-Engine Synthesis**: Seamlessly switch between **Gemini 2.5/3.0**, **ElevenLabs Multilingual v2**, and **Resemble AI**.
- **Universal Translation Layer**: Utilizes Gemini 3 Pro to translate your script while preserving SSML tags and emotional cues before synthesis.
- **Vocal Identity Cloning**: Create instruction-based voice profiles. Analyze your own voice samples to generate "Identity instruction" sets for the Gemini TTS engine.
- **Long-Form Production**: Automatic script chunking for narrations exceeding 10,000+ characters with gapless concatenation.
- **Pronunciation Dictionary**: Define custom rules for technical terms, names, or localized jargon.
- **Store-Ready Architecture**: Full support for Mac App Store (MAS) Sandboxing, Microsoft AppX, and Linux Flatpak distribution.

---

## 🌍 Supported Languages (Hybrid Registry)

The Universal Translation Layer and multi-engine synthesis now support the following 41 languages and classical/indigenous dialects:

- **Arabic (AR)**
- **Aymara**
- **Catalan**
- **Cherokee**
- **Chinese (ZH)**
- **Danish**
- **Dutch (NL)**
- **English (UK & US)**
- **Flemish**
- **French (FR)**
- **Georgian**
- **German (DE)**
- **Guarani**
- **Hindi (IN)**
- **Indonesian (ID)**
- **Italian (IT)**
- **Japanese (JP)**
- **Kannada**
- **Khmer**
- **Korean (KR)**
- **Lao**
- **Latin**
- **Latvian**
- **Maltese**
- **Maya (Yucatec)**
- **Nahuatl**
- **Navajo**
- **Nepali**
- **Norwegian**
- **Polish (PL)**
- **Portuguese (BR)**
- **Quechua**
- **Russian (RU)**
- **Sinhala**
- **Spanish (ES)**
- **Swedish (SE)**
- **Tamil**
- **Thai (TH)**
- **Turkish (TR)**
- **Vietnamese (VN)**

---

### Narrator Creator Academy help Section
<p align="center">
  <img src="https://github.com/AjarnSpencer/AI-Voice-Studio/blob/main/assets/ai-voice--studio%20(1).png" alt="AI Voice Studio Academy" width="60%" style="text-align:center;">
</p>

<p align="center"><img src="https://github.com/AjarnSpencer/AI-Voice-Studio/blob/main/assets/ai--studio%20(4).pnghttps://github.com/AjarnSpencer/AI-Voice-Studio/blob/main/assets/ai--studio%20(4).png" alt="AI Voice Studio Academy tutorials" width="60%" style="text-align:center;"></p>

<p align="center"><img src="https://github.com/AjarnSpencer/AI-Voice-Studio/blob/main/assets/ai--studio%20(3).png" alt="AI Voice Studio Academy" width="60%" style="text-align:center;"></p>

<p align="center"><img src="https://github.com/AjarnSpencer/AI-Voice-Studio/blob/main/assets/ai--studio%20(2).png" alt="AI Voice Studio Academy" width="60%" style="text-align:center;"></p>


## 🛠️ How it Works

### 1. Neural Identity Analysis
The "Custom Voice" feature uses a **Zero-Shot Analysis** technique. When you provide a sample, the Gemini model decomposes the audio into a parametric text-based instruction set (Pitch, Tone, Pace, Prosody). This instruction is then fed as a system prompt to the TTS engine to modulate the base voice into your "Identity."

### 2. Hybrid Translation Pipeline
When narrating in a non-English language:
1. **Source Script** is passed to **Gemini 3 Pro**.
2. **SSML-Aware Translation** is performed, ensuring `<break>` and `[Whisper]` tags remain in the correct semantic position.
3. **Target Language Audio** is synthesized by your selected engine (ElevenLabs, Gemini, or Resemble).

---

## 🏗️ Build & Publish

```bash
# 1. Install Production Dependencies
npm install

# 2. Compile Web Application
npm run build

# 3. Package for Distribution (Windows/Mac/Linux)
npm run electron:package
```

---

<p align="center">
  <i>"Perform your narrative, don't just generate it."</i>
  <br>
  <b>Developed by Ajarn Spencer Littlewood</b>
</p>
