
import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from './icons';

export interface PronunciationRule {
  word: string;
  alias: string;
}

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: PronunciationRule[];
  onSave: (rules: PronunciationRule[]) => void;
}

export const PronunciationModal: React.FC<PronunciationModalProps> = ({ isOpen, onClose, rules, onSave }) => {
  const [localRules, setLocalRules] = useState<PronunciationRule[]>(rules);
  const [newWord, setNewWord] = useState('');
  const [newAlias, setNewAlias] = useState('');

  if (!isOpen) return null;

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newAlias.trim()) return;
    
    setLocalRules([...localRules, { word: newWord.trim(), alias: newAlias.trim() }]);
    setNewWord('');
    setNewAlias('');
  };

  const handleRemoveRule = (index: number) => {
    setLocalRules(localRules.filter((_, i) => i !== index));
  };

  const handleFinalSave = () => {
    onSave(localRules);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 text-white border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-teal-300">Pronunciation Guide</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <p className="text-gray-400 text-sm mb-6">
          Define custom pronunciations for difficult words, names, or technical terms. 
          The app will automatically replace these words in your script before generating audio.
        </p>

        <form onSubmit={handleAddRule} className="grid grid-cols-5 gap-2 mb-6">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Word</label>
            <input 
              type="text" 
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="e.g. Gemini"
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Sounds Like</label>
            <input 
              type="text" 
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              placeholder="e.g. Jem-in-eye"
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700 p-2 rounded flex items-center justify-center transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="max-h-60 overflow-y-auto mb-6 bg-gray-900/50 rounded-lg border border-gray-700">
          {localRules.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic text-sm">
              No custom rules added yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-gray-400 font-medium">Word</th>
                  <th className="p-3 text-gray-400 font-medium">Pronunciation</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {localRules.map((rule, idx) => (
                  <tr key={idx} className="border-b border-gray-800 group hover:bg-gray-700/30 transition-colors">
                    <td className="p-3 font-semibold text-teal-100">{rule.word}</td>
                    <td className="p-3 text-gray-300 italic">{rule.alias}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => handleRemoveRule(idx)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleFinalSave}
            className="px-6 py-2 rounded-md bg-teal-600 hover:bg-teal-700 font-semibold transition-colors shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
