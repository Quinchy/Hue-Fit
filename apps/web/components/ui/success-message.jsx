// components/ui/success-message.js

export function SuccessMessage({ message, className }) {
  return message ? (
    <div className={`text-green-400 text-sm ${className}`}>{message}</div>
  ) : null;
}
