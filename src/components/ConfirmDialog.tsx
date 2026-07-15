import { useState } from 'react';

let globalConfirm: ((msg: string, onConfirm: () => void) => void) | null = null;

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirmCb, setOnConfirmCb] = useState<(() => void) | null>(null);

  globalConfirm = (msg: string, onConfirm: () => void) => {
    setMessage(msg);
    setOnConfirmCb(() => onConfirm);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (onConfirmCb) onConfirmCb();
    setIsOpen(false);
  };

  const ConfirmDialogComponent = () => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-coffee/40 backdrop-blur-sm p-4">
        <div className="bg-cream p-6 rounded-md shadow-xl w-full max-w-sm border border-coffee/10">
          <h3 className="font-serif text-coffee text-xl font-medium mb-3">Xác nhận</h3>
          <p className="text-sm text-coffee mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setIsOpen(false)} className="px-4 py-1.5 text-sm text-muted hover:text-coffee transition-colors">Hủy</button>
            <button onClick={handleConfirm} className="px-4 py-1.5 text-sm font-medium bg-error text-white rounded-sm hover:bg-error/90 transition-colors">Xác nhận</button>
          </div>
        </div>
      </div>
    );
  };

  return { ConfirmDialogComponent };
}

export const confirmAction = (msg: string, onConfirm: () => void) => {
  if (globalConfirm) {
    globalConfirm(msg, onConfirm);
  } else {
    // Fallback if context not mounted
    if (window.confirm(msg)) {
      onConfirm();
    }
  }
};
