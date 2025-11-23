'use client';
import { X } from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';

interface ModalProps {
  title?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  preventClose?: boolean; // Prevent closing via X button
}

export function Modal({ title, open, onClose, children, preventClose = false }: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      // Start closing animation when open becomes false
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  const handleClose = () => {
    if (preventClose) return;

    setIsClosing(true);
    // Wait for animation before calling onClose
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={!preventClose ? handleClose : undefined}
    >
      <div
        className={`card-surface glow-border relative w-[420px] rounded-2xl border border-border p-6 transition-all duration-300 ${
          isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!preventClose && (
          <button
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full p-2 text-white/70 transition hover:bg-white/10"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {title && <h3 className="mb-4 text-xl font-semibold text-white">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
