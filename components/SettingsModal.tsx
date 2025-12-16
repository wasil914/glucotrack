import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { sendTestMessage } from '../services/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [chatId, setChatId] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    if (isOpen) {
      setChatId(localStorage.getItem('telegram_chat_id') || '');
      setSaveStatus('idle');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('telegram_chat_id', chatId);
    setSaveStatus('saved');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleTest = async () => {
    if (!chatId) {
      alert("Please enter a Chat ID first.");
      return;
    }
    
    setIsTesting(true);
    // Updated call: no longer passing a token, as it's handled securely in the service
    const success = await sendTestMessage(chatId);
    setIsTesting(false);

    if (success) {
      alert("Test message sent successfully! Check your Telegram.");
    } else {
      alert("Failed to send message. Please check your Chat ID.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <MessageSquare size={14} /> Telegram Chat ID
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. 123456789"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinical-500 outline-none transition-all"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500 leading-relaxed">
            <p className="flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-clinical-500" />
              <span>
                To receive alerts:
                <br/>1. Search <strong>@userinfobot</strong> on Telegram to get your ID.
                <br/>2. Enter the ID above.
                <br/>3. Start a chat with the bot to allow messages.
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleTest}
            disabled={isTesting || !chatId}
            className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            {isTesting ? 'Sending...' : 'Test Connection'}
          </button>

          <button
            onClick={handleSave}
            disabled={saveStatus === 'saved'}
            className={`w-full py-2.5 font-medium rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              saveStatus === 'saved' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            {saveStatus === 'saved' ? (
              <>
                <CheckCircle size={18} /> Saved!
              </>
            ) : (
              <>
                <Save size={18} /> Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};