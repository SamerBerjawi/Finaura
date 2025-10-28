import React from 'react';
import Modal from './Modal';
import { Widget } from '../types';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableWidgets: Widget[];
  onAddWidget: (widgetId: string) => void;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, availableWidgets, onAddWidget }) => {
  if (!isOpen) return null;
  
  const handleAdd = (widgetId: string) => {
    onAddWidget(widgetId);
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Add Widget">
      <div className="space-y-3">
        {availableWidgets.length > 0 ? (
          availableWidgets.map(widget => (
            <button
              key={widget.id}
              onClick={() => handleAdd(widget.id)}
              className="w-full text-left p-3 rounded-lg bg-light-bg dark:bg-dark-bg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
            >
              {widget.name}
            </button>
          ))
        ) : (
          <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-4">
            All available widgets are already on display.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default AddWidgetModal;