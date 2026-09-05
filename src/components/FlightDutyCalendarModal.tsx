import React, { useState } from 'react';
import { DutyRatioTable } from '../data/officialDutyRatioMatrix';
import { FlightName } from '../types';
import { Calendar, RotateCcw, X, Save } from 'lucide-react';

interface FlightDutyCalendarModalProps {
  table: DutyRatioTable;
  flight: FlightName;
  onClose: () => void;
  onSave: (newData: number[]) => void;
}

export const FlightDutyCalendarModal: React.FC<FlightDutyCalendarModalProps> = ({
  table,
  flight,
  onClose,
  onSave,
}) => {
  const [data, setData] = useState<number[]>(table.data[flight] || new Array(31).fill(0));

  const handleCellClick = (dayIdx: number) => {
    const val = data[dayIdx] || 0;
    const nextVal = val === 0 ? 1 : val === 1 ? 2 : 0;
    const newData = [...data];
    newData[dayIdx] = nextVal;
    setData(newData);
  };

  const handleReset = () => {
    setData(new Array(31).fill(0));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl w-full max-w-[400px] border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-start">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white flex items-center space-x-2 text-lg">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>{flight}</span>
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{table.title}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-bold transition-colors flex items-center space-x-1"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const val = data[i];
              const isPositive = val > 0;
              return (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    isPositive
                      ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50 cursor-pointer'
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-300 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-indigo-500 cursor-pointer'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold mb-0.5 ${
                      isPositive ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </span>

                  <div className="flex items-center justify-center h-5 w-full mt-1">
                    {val > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <div className="flex space-x-0.5">
                          {Array.from({ length: val }).map((_, ci) => (
                            <div key={ci} className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm"></div>
                          ))}
                        </div>
                        <span className="font-mono text-[10px] leading-none font-black text-indigo-700 dark:text-indigo-300">
                          {val}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={() => onSave(data)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
