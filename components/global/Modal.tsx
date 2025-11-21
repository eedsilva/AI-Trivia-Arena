'use client';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  title?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div className="card-surface glow-border relative w-[420px] rounded-2xl border border-border p-6">
        <button
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2 text-white/70 transition hover:bg-white/10"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        {title && <h3 className="mb-4 text-xl font-semibold text-white">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
