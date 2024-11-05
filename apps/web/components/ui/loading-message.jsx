// components/ui/LoadingMessage.js
import { Loader } from 'lucide-react';

export function LoadingMessage({ message = "Loading...", className = "" }) {
  return (
    <div className={`flex items-center gap-2 text-gray-600 ${className}`}>
      <Loader className="animate-spin" width={20} />
      <p>{message}</p>
    </div>
  );
}
