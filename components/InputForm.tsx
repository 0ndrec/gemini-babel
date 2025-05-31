
import React, { useState, useRef } from 'react';
import { Language, LANGUAGES } from '../constants';

export interface FormData {
  textToTranslate: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [textToTranslate, setTextToTranslate] = useState<string>('');
  const [sourceLanguage, setSourceLanguage] = useState<string>('en');
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ textToTranslate, sourceLanguage, targetLanguage });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setTextToTranslate(fileContent);
      };
      reader.onerror = (e) => {
        console.error("File reading error:", e);
        setSelectedFileName(null);
        // Optionally, display an error to the user
        alert("Error reading file. Please ensure it's a valid text file.");
      }
      reader.readAsText(file);
    } else {
      setSelectedFileName(null);
      // If no file is selected (e.g., user cancels dialog), don't clear existing text
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleClearFile = () => {
    setTextToTranslate('');
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-800 shadow-2xl rounded-lg">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="textToTranslate" className="block text-sm font-medium text-gray-300">
            Text to Translate (one string per line or upload a file)
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-100 bg-gray-700 hover:bg-gray-600 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
              aria-label="Upload a text file"
            >
              Upload File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.po,.pot,text/plain"
              id="fileUpload"
            />
            {selectedFileName && (
               <button
                type="button"
                onClick={handleClearFile}
                className="px-2 py-1 text-xs font-medium text-red-400 hover:text-red-200 bg-gray-700 hover:bg-red-700 rounded-md border border-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                title="Clear uploaded file and text content"
                aria-label="Clear uploaded file and text content"
              >
                Clear
              </button>
            )}
          </div>
        </div>
         {selectedFileName && (
          <p className="text-xs text-gray-400 mt-1 mb-2">
            Selected file: <span className="font-medium text-indigo-400">{selectedFileName}</span> (Content loaded into textarea)
          </p>
        )}
        <textarea
          id="textToTranslate"
          value={textToTranslate}
          onChange={(e) => {
            setTextToTranslate(e.target.value);
            // If user types, they are no longer using the "uploaded file" directly
            // You might want to clear selectedFileName here, or leave it to indicate origin
            // For simplicity, let's keep selectedFileName until a new file is uploaded or cleared.
          }}
          rows={10}
          placeholder="Enter strings like:\nHello, %(name)s!\nWelcome to our application.\nThis item costs {price}.\nOr upload a .txt, .po, or .pot file."
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-100 placeholder-gray-500 resize-none font-mono text-sm"
          required
          aria-describedby={selectedFileName ? "file-upload-status" : undefined}
        />
        {selectedFileName && (
            <p id="file-upload-status" className="sr-only">File {selectedFileName} has been loaded into the text area.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sourceLanguage" className="block text-sm font-medium text-gray-300 mb-1">
            Source Language
          </label>
          <select
            id="sourceLanguage"
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-300 mb-1">
            Target Language
          </label>
          <select
            id="targetLanguage"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {isLoading ? 'Translating...' : 'Generate .po File'}
        </button>
      </div>
    </form>
  );
};
