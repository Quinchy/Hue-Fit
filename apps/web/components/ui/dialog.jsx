// components/ui/dialog.js
import { useEffect } from 'react';
import { X } from 'lucide-react';

const Dialog = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-md shadow-lg relative">
        {children}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-700"
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default Dialog;
