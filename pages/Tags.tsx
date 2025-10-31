import React from 'react';
import { Page } from '../types';

interface TagsProps {
  setCurrentPage: (page: Page) => void;
}

const Tags: React.FC<TagsProps> = ({ setCurrentPage }) => {
  return (
    <div>
      <header>
        <div className="flex items-center gap-4">
            <button onClick={() => setCurrentPage('Settings')} className="text-light-text-secondary dark:text-dark-text-secondary p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <span onClick={() => setCurrentPage('Settings')} className="hover:underline cursor-pointer">Settings</span>
                <span> / </span>
                <span className="text-light-text dark:text-dark-text font-medium">Tags</span>
            </div>
        </div>
      </header>
      <div className="mt-4">
        {/* <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Tags</h2> */}
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">This page is under construction. Check back soon for tag management tools!</p>
      </div>
    </div>
  );
};

export default Tags;