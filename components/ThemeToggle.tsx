import React from 'react';
import { Theme } from '../types';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-14 h-8 rounded-full p-1 bg-gray-200 dark:bg-gray-700 flex items-center transition-colors duration-300"
      aria-label="Toggle theme"
    >
      <div
        className={`w-6 h-6 rounded-full bg-light-card dark:bg-dark-card shadow-lg transform transition-transform duration-300 flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        <span className="material-symbols-outlined text-sm text-primary-500">
            {theme === 'light' ? 'light_mode' : 'dark_mode'}
        </span>
      </div>
    </button>
  );
};

export default ThemeToggle;