import React from 'react';
import Modal from './Modal';
import { BTN_PRIMARY_STYLE } from '../constants';

interface EditRecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSingle: () => void;
  onEditSeries: () => void;
}

const EditRecurrenceModal: React.FC<EditRecurrenceModalProps> = ({ isOpen, onClose, onEditSingle, onEditSeries }) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Edit Recurring Event">
      <div className="space-y-4">
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Do you want to change only this occurrence, or the entire series?
        </p>
        <div className="flex flex-col gap-4 pt-4">
          <button onClick={onEditSingle} className={BTN_PRIMARY_STYLE}>
            This Occurrence Only
          </button>
          <button onClick={onEditSeries} className={BTN_PRIMARY_STYLE}>
            The Entire Series
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditRecurrenceModal;
