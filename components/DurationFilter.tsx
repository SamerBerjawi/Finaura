import React from 'react';
import { Duration } from '../types';

interface DurationFilterProps {
  selectedDuration: Duration;
  onDurationChange: (duration: Duration) => void;
}

const DURATION_OPTIONS: { label: string; value: Duration }[] = [
  { label: '7D', value: '7D' },
  { label: '30D', value: '30D' },
  { label: '90D', value: '90D' },
  { label: 'YTD', value: 'YTD' },
  { label: '1Y', value: '1Y' },
  { label: '2Y', value: '2Y' },
  { label: '3Y', value: '3Y' },
  { label: '4Y', value: '4Y' },
  { label: '5Y', value: '5Y' },
  { label: '10Y', value: '10Y' },
  { label: 'All Time', value: 'ALL' },
];

const DurationFilter: React.FC<DurationFilterProps> = ({ selectedDuration, onDurationChange }) => {
  return (
    <div className="relative h-10">
      <select
        value={selectedDuration}
        onChange={(e) => onDurationChange(e.target.value as Duration)}
        className="appearance-none bg-light-bg dark:bg-dark-bg text-sm font-semibold text-light-text dark:text-dark-text rounded-md pl-3 pr-8 border border-gray-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-primary-500 transition-shadow duration-200 h-full"
      >
        {DURATION_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-light-text-secondary dark:text-dark-text-secondary">
         <span className="material-symbols-outlined text-base">expand_more</span>
      </div>
    </div>
  );
};

export default DurationFilter;