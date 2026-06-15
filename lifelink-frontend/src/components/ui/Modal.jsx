/**
 * @file Modal.jsx
 * @description Re-usable UI overlay modal component with backdrop blur styling.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-strong" onClick={(e) => e.stopPropagation()}>
        {title && <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 20 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
