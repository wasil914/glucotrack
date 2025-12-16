import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Activity, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  Download,
  Filter,
  Droplet
} from 'lucide-react';
import { Reading, FilterRange, Stats, ReadingType, DateRange } from './types';
import { ReadingModal } from './components/ReadingModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsCard } from './components/StatsCard';
import { generateReport } from './services/pdfGenerator';
import { generateId, formatDate, formatTime, getGlucoseStatus, getStatusColor, getStatusDotColor } from './utils/helpers';

const App: React.FC = () => {
  // State
  const [readings, setReadings] = useState<Reading[]>([]);
  const [filter, setFilter] = useState<FilterRange>('1Week');
  const [customRange, setCustomRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('glucose_readings');
    if (saved) {
      try {
        setReadings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse readings", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('glucose_readings', JSON.stringify(readings));
  }, [readings]);

  // Filter Logic
  const filteredReadings = useMemo(() => {
    const now = new Date();
    // Reset time part for accurate date comparison
    now.setHours(23, 59, 59, 999);
    const todayTs = now.getTime();
    
    let startTs = 0;

    if (filter === '3Days') {
      startTs = todayTs - (3 * 24 * 60 * 60 * 1000);
    } else if (filter === '1Week') {
      startTs = todayTs - (7 * 24 * 60 * 60 * 1000);
    } else if (filter === '1Month') {
      startTs = todayTs - (30 * 24 * 60 * 60 * 1000);
    } else if (filter === 'Custom') {
      const start = new Date(customRange.start);
      start.setHours(0, 0, 0, 0);
      startTs = start.getTime();
      
      const end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);
      // Filter strictly within range
      return readings
        .filter(r => r.timestamp >= startTs && r.timestamp <= end.getTime())
        .sort((a, b) => b.timestamp - a.timestamp);
    }

    return readings
      .filter(r => r.timestamp >= startTs)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [readings, filter, customRange]);

  // Stats Logic
  const stats: Stats = useMemo(() => {
    if (filteredReadings.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
    
    const values = filteredReadings.map(r => r.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      avg: Math.round(sum / values.length),
      min,
      max,
      count: values.length
    };
  }, [filteredReadings]);

  // Handlers
  const handleAddReading = (date: string, time: string, value: number, type: ReadingType) => {
    const dateTime = new Date(`${date}T${time}`);
    const newReading: Reading = {
      id: generateId(),
      date,
      time,
      value,
      type,
      timestamp: dateTime.getTime()
    };
    setReadings(prev => [newReading, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      setReadings(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleExportPDF = () => {
    generateReport(filteredReadings, stats, filter === 'Custom' ? `${customRange.start} to ${customRange.end}` : filter);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-clinical-600 p-2 rounded-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Gluco<span className="text-clinical-600">Track</span></h1>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 hover:text-clinical-600 hover:bg-clinical-50 rounded-full transition-colors"
          >
            <Settings size={22} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {(['3Days', '1Week', '1Month', 'Custom'] as FilterRange[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f
                    ? 'bg-white text-clinical-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === '3Days' ? '3 Days' : f === '1Week' ? '1 Week' : f === '1Month' ? '1 Month' : 'Custom'}
              </button>
            ))}
          </div>

          {/* PDF Button */}
          <button 
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>

        {/* Custom Date Inputs */}
        {filter === 'Custom' && (
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">From</label>
              <input 
                type="date" 
                value={customRange.start}
                onChange={(e) => setCustomRange(p => ({...p, start: e.target.value}))}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-clinical-500 outline-none" 
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">To</label>
              <input 
                type="date" 
                value={customRange.end}
                onChange={(e) => setCustomRange(p => ({...p, end: e.target.value}))}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-clinical-500 outline-none" 
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            label="Average Glucose" 
            value={stats.avg} 
            unit="mg/dL" 
            icon={Activity} 
            colorClass="bg-blue-500" 
          />
          <StatsCard 
            label="Lowest Reading" 
            value={stats.min} 
            unit="mg/dL" 
            icon={TrendingDown} 
            colorClass="bg-emerald-500" 
          />
          <StatsCard 
            label="Highest Reading" 
            value={stats.max} 
            unit="mg/dL" 
            icon={TrendingUp} 
            colorClass="bg-red-500" 
          />
        </div>

        {/* Reading List Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-slate-400" />
            History 
            <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {stats.count}
            </span>
          </h2>
        </div>

        {/* Data Display */}
        {filteredReadings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplet className="text-slate-300" size={32} />
            </div>
            <h3 className="text-slate-800 font-medium">No readings found</h3>
            <p className="text-slate-400 text-sm mt-1">Add a new reading to get started</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredReadings.map((reading) => {
                const status = getGlucoseStatus(reading.value, reading.type);
                const statusColor = getStatusColor(status);
                const dotColor = getStatusDotColor(status);
                
                return (
                  <div key={reading.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                          <span className="font-bold text-slate-800 text-lg">{reading.value} <span className="text-xs text-slate-400 font-normal">mg/dL</span></span>
                        </div>
                        <p className="text-xs text-slate-500">{formatDate(reading.date)} at {formatTime(reading.time)}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                        {status}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <span className="text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                        {reading.type}
                      </span>
                      <button 
                        onClick={() => handleDelete(reading.id)}
                        className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Glucose</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReadings.map((reading) => {
                      const status = getGlucoseStatus(reading.value, reading.type);
                      const statusColor = getStatusColor(status);

                      return (
                        <tr key={reading.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">{formatDate(reading.date)}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{formatTime(reading.time)}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {reading.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-800">{reading.value}</span>
                            <span className="text-xs text-slate-400 ml-1">mg/dL</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDelete(reading.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-clinical-600 text-white p-4 rounded-full shadow-lg hover:bg-clinical-700 hover:scale-110 active:scale-95 transition-all focus:ring-4 focus:ring-clinical-300 focus:outline-none"
        aria-label="Add Reading"
      >
        <Plus size={28} />
      </button>

      {/* Modals */}
      <ReadingModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddReading} 
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default App;