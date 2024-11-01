import { TriangleAlert } from 'lucide-react';

export function ErrorMessage({ error, touched }) {
  return (
    <>
      {touched && error && (
        <p className="text-red-500 text-sm flex flex-row items-center gap-2">
          <TriangleAlert width={20} />
          {error}
        </p>
      )}
    </>
  );
}

export function ErrorStyle(touched, error) {
  return touched && error ? "border-2 border-red-500" : "";
}