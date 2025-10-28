import React, { useState } from 'react';
import Modal from './Modal';
import { BTN_SECONDARY_STYLE, INPUT_BASE_STYLE } from '../constants';

interface FinalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  requiredText: string;
  confirmButtonText?: string;
}

const FinalConfirmationModal: React.FC<FinalConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, message, requiredText, confirmButtonText = 'Confirm'
}) => {
  const [inputText, setInputText] = useState('');
  const isMatch = inputText === requiredText;

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title={title} zIndexClass="z-[80]">
      <div className="space-y-4">
        {message}
        <div>
          <label htmlFor="confirm-input" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
            To confirm, type "{requiredText}" in the box below.
          </label>
          <input
            id="confirm-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className={`${INPUT_BASE_STYLE} text-center`}
            autoFocus
            autoComplete="off"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-black/10 dark:border-white/10">
        <button type="button" onClick={onClose} className={BTN_SECONDARY_STYLE}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-card hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isMatch}
        >
          {confirmButtonText}
        </button>
      </div>
    </Modal>
  );
};

export default FinalConfirmationModal;
