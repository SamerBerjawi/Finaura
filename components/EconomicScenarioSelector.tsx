import React from 'react';
import { EconomicScenario } from '../types';

interface EconomicScenarioSelectorProps {
  selectedScenario: EconomicScenario;
  onScenarioChange: (scenario: EconomicScenario) => void;
}

const SCENARIO_OPTIONS: { label: string; value: EconomicScenario, icon: string }[] = [
    { label: 'Recession', value: 'recession', icon: 'trending_down' },
    { label: 'Neutral', value: 'neutral', icon: 'trending_flat' },
    { label: 'Growth', value: 'growth', icon: 'trending_up' },
];

const EconomicScenarioSelector: React.FC<EconomicScenarioSelectorProps> = ({ selectedScenario, onScenarioChange }) => {
  return (
    <div className="flex bg-light-bg dark:bg-dark-bg p-1 rounded-lg shadow-neu-inset-light dark:shadow-neu-inset-dark h-11 items-center">
        {SCENARIO_OPTIONS.map(opt => (
            <button
                key={opt.value}
                type="button"
                onClick={() => onScenarioChange(opt.value)}
                className={`w-full flex items-center justify-center gap-2 text-center text-sm font-semibold py-1.5 px-3 rounded-md transition-all duration-200 ${
                    selectedScenario === opt.value
                    ? 'bg-light-card dark:bg-dark-card shadow-neu-raised-light dark:shadow-neu-raised-dark'
                    : 'text-light-text-secondary dark:text-dark-text-secondary'
                }`}
                aria-pressed={selectedScenario === opt.value}
            >
                <span className="material-symbols-outlined text-base">{opt.icon}</span>
                {opt.label}
            </button>
        ))}
    </div>
  );
};

export default EconomicScenarioSelector;
