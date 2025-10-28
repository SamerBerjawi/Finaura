import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
        className={`bg-light-card dark:bg-dark-card rounded-xl shadow-card p-6 border border-black/5 dark:border-white/10 ${className}`} 
        onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;