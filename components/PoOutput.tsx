
import React, { useState, useEffect } from 'react';

interface PoOutputProps {
  content: string;
}

export const PoOutput: React.FC<PoOutputProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy content. Please try manually.');
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/x-gettext-translation;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations.po';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 p-6 bg-gray-800 shadow-2xl rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-200">Generated <code className="bg-gray-700 px-1 rounded">.po</code> Content</h2>
        <div className="space-x-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors duration-150"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
             <button
              onClick={handleDownload}
              className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors duration-150"
            >
              Download .po
            </button>
        </div>
      </div>
      <textarea
        value={content}
        readOnly
        rows={15}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 font-mono text-sm resize-none"
        aria-label="Generated PO content"
      />
    </div>
  );
};
