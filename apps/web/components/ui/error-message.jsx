import { TriangleAlert } from 'lucide-react';

export function InputErrorMessage({ error, touched, condition = true }) {
  const shouldShowError = condition && error && touched;

  return (
    <>
      {shouldShowError && (
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

export function ErrorMessage({ message, className = "", condition = true }) {
  if (!message || !condition) return null;

  return (
    <p className={`text-red-500 flex flex-row items-center justify-center text-sm gap-2 ${className}`}>
      <TriangleAlert width={20} />
      {message}
    </p>
  );
}