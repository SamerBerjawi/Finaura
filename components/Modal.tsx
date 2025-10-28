import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  zIndexClass?: string;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title, zIndexClass = 'z-50' }) => {
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4 ${zIndexClass}`}
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-light-card to-light-bg dark:from-dark-card dark:to-dark-bg rounded-2xl shadow-neu-raised-light dark:shadow-neu-raised-dark w-full max-w-lg border border-black/5 dark:border-white/10"
        onClick={handleContentClick}
      >
        <header className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
          <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">{title}</h2>
          <button onClick={onClose} className="text-light-text-secondary dark:text-dark-text-secondary p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
