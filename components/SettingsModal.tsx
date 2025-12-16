import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [chatId, setChatId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setChatId(localStorage.getItem('telegram_chat_id') || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('telegram_chat_id', chatId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Chat ID</label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Enter Chat ID"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinical-500 outline-none"
          />
          <p className="text-xs text-slate-400 mt-2">
            This ID is stored locally for notification configurations.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </div>
  );
};