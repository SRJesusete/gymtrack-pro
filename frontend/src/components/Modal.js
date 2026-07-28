import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children, testid }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = "");
    }
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      data-testid={testid}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-surface border border-border sm:rounded-2xl rounded-t-2xl animate-scale-in">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-surface border-b border-border z-10">
          <h3 className="font-heading font-semibold uppercase tracking-wide text-lg text-txt">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sub hover:text-txt hover:bg-surfaceHover transition-colors"
            data-testid="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
