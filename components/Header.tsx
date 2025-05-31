
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full text-center py-6">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
        Gemini Flask BabelGen
      </h1>
      <p className="text-gray-400 mt-2">Generate <code className="bg-gray-700 px-1 rounded">.po</code> translation files for your Flask apps with AI.</p>
    </header>
  );
};
