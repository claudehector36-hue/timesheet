import React from 'react';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  showLabel = true, 
  size = 'md',
  className = '' 
}) => {
  const clamped = Math.min(Math.max(percentage, 0), 100);

  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';

  if (percentage > 100) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-700 font-bold';
  } else if (percentage >= 80) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700 font-semibold';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3.5' : 'h-2.5';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="font-medium text-slate-600">Consommation</span>
          <span className={`font-mono ${textColor}`}>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div 
          className={`${barColor} ${heightClass} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
