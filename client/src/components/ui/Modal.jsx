import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  showClose = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2F3A2C]/30 dark:bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            className={`relative w-full ${maxWidth} glass-panel-strong rounded-3xl shadow-warm p-6 sm:p-8 border border-border-glass z-10 max-h-[90vh] flex flex-col`}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between pb-3.5 border-b border-border-glass-subtle mb-4">
                {title && (
                  <h3 className="text-xl font-editorial font-bold text-text-main">
                    {title}
                  </h3>
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-text-muted hover:text-text-main hover:bg-primary-soft/50 transition-colors"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto pr-1 flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
