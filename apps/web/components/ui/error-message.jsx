import { TriangleAlert } from 'lucide-react';

export function InputErrorMessage({ error, touched }) {
  return (
    <>
      {error && touched && (
        <p className="text-red-500 text-sm flex flex-row items-center gap-2">
          <TriangleAlert width={20} />
          {error}
        </p>
      )}
    </>
  );
}

export function InputErrorStyle(error, touched) {
  return error && touched ? "border-2 border-red-500" : "border-none";
}

export function ErrorMessage({ message, className = "" }) {
  if (!message) return null;

  return (
    <p className={`text-red-500 text-sm text-center ${className}`}>
      {message}
    </p>
  );
}