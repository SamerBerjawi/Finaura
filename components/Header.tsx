import React from 'react';
import { Theme, User } from '../types';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  user: User;
  setSidebarOpen: (isOpen: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  headerActions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ user, setSidebarOpen, theme, setTheme, headerActions }) => {
  return (
    <header className="flex-shrink-0 bg-light-card dark:bg-dark-card h-24 flex items-center border-b border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="text-light-text-secondary dark:text-dark-text-secondary md:hidden">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <img className="h-12 w-12 rounded-full object-cover hidden sm:block" src={user.profilePictureUrl} alt="User" />
                <div>
                    <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Welcome To Your Dashboard</h1>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {headerActions}
                <ThemeToggle theme={theme} setTheme={setTheme} />
                <img className="h-10 w-10 rounded-full object-cover sm:hidden" src={user.profilePictureUrl} alt="User" />
            </div>
        </div>
    </header>
  );
};

export default Header;