
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="my-4 p-4 bg-red-700 border border-red-900 text-red-100 rounded-md shadow-lg" role="alert">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline ml-2">{message}</span>
    </div>
  );
};
