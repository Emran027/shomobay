import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in-up" 
         style={{ animationDuration: '0.2s' }}>
      <div 
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-2 pr-6">{title}</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isDestructive ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'
            }`}
          >
            {isLoading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
