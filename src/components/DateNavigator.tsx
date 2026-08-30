import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateNavigatorProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  hideArrows?: boolean;
}

export function DateNavigator({ hideArrows, className, value, disabled, onChange, ...props }: DateNavigatorProps) {
  const addDays = (days: number) => {
    if (!value || typeof value !== 'string') return;
    const d = new Date(value);
    if (isNaN(d.getTime())) return;
    d.setDate(d.getDate() + days);
    
    if (onChange) {
      // Simulate event
      onChange({ target: { value: d.toISOString().split('T')[0] } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="flex items-center">
      {!hideArrows && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => { e.preventDefault(); addDays(-1); }}
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      <input
        type="date"
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={className || "bg-transparent border-none outline-none font-semibold cursor-pointer text-slate-900 dark:text-slate-100 text-sm w-full"}
        {...props}
      />
      {!hideArrows && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => { e.preventDefault(); addDays(1); }}
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
