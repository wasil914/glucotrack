import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ReadingType } from '../types';

interface ReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string, time: string, value: number, type: ReadingType) => void;
}

export const ReadingModal: React.FC<ReadingModalProps> = ({ isOpen, onClose, onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [value, setValue] = useState('');
  const [type, setType] = useState<ReadingType>('Fasting');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    onSave(date, time, parseInt(value, 10), type);
    // Reset form mostly, keep date/time current
    setValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-clinical-600 flex justify-between items-center">
          <h2 className="text-white font-semibold text-lg">Add Glucose Reading</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-clinical-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-clinical-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Glucose Level (mg/dL)</label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                required
                min="0"
                max="1000"
                placeholder="e.g. 95"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full pl-3 pr-12 py-3 border border-slate-300 rounded-lg text-lg font-semibold text-slate-900 focus:ring-2 focus:ring-clinical-500 focus:border-clinical-500 outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">mg/dL</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reading Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Fasting', 'Pre-Meal', 'After Meal', 'Bedtime'] as ReadingType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                    type === t
                      ? 'bg-clinical-50 border-clinical-500 text-clinical-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-clinical-600 hover:bg-clinical-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-2"
          >
            Save Reading
          </button>
        </form>
      </div>
    </div>
  );
};