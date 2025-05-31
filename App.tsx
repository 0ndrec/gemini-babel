
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm, FormData } from './components/InputForm';
import { PoOutput } from './components/PoOutput';
import { ProgressTracker, ProgressData } from './components/ProgressTracker';
import { ErrorMessage } from './components/ErrorMessage';
import { translateTextsToPo } from './services/geminiService';
import { Language, LANGUAGES } from './constants';

const App: React.FC = () => {
  const [poContent, setPoContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  const handleProgressUpdate = useCallback((data: Partial<ProgressData>) => {
    setProgressData(prev => ({
      currentText: data.currentText !== undefined ? data.currentText : prev?.currentText || '',
      currentIndex: data.currentIndex !== undefined ? data.currentIndex : prev?.currentIndex || 0,
      totalStrings: data.totalStrings !== undefined ? data.totalStrings : prev?.totalStrings || 0,
    }));
  }, []);

  const handleTranslate = useCallback(async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setPoContent('');
    setProgressData({ currentText: '', currentIndex: 0, totalStrings: 0 }); // Reset progress

    const sourceLangObj = LANGUAGES.find(l => l.code === data.sourceLanguage);
    const targetLangObj = LANGUAGES.find(l => l.code === data.targetLanguage);

    if (!sourceLangObj || !targetLangObj) {
      setError("Invalid source or target language selected.");
      setIsLoading(false);
      return;
    }
    
    if (!data.textToTranslate.trim()) {
        setError("Please enter text to translate.");
        setIsLoading(false);
        return;
    }

    try {
      const generatedPoContent = await translateTextsToPo(
        data.textToTranslate,
        sourceLangObj,
        targetLangObj,
        handleProgressUpdate
      );
      setPoContent(generatedPoContent);
    } catch (err) {
      console.error("Translation error:", err);
      if (err instanceof Error) {
        setError(`Failed to generate translations: ${err.message}. Check your API key and network connection.`);
      } else {
        setError("An unknown error occurred during translation.");
      }
    } finally {
      setIsLoading(false);
      setProgressData(null); // Clear progress on completion or error
    }
  }, [handleProgressUpdate]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 selection:bg-indigo-500 selection:text-white">
      <Header />
      <main className="container mx-auto mt-8 w-full max-w-4xl space-y-8">
        <InputForm onSubmit={handleTranslate} isLoading={isLoading} />
        {isLoading && progressData && <ProgressTracker {...progressData} />}
        {error && <ErrorMessage message={error} />}
        {poContent && !isLoading && <PoOutput content={poContent} />}
      </main>
      <footer className="w-full max-w-4xl mx-auto text-center py-8 text-sm text-gray-500">
        <p>Powered by Google Gemini. For Flask/Babel .po file generation.</p>
        <p>Ensure your <code className="bg-gray-700 px-1 rounded">process.env.API_KEY</code> is configured.</p>
      </footer>
    </div>
  );
};

export default App;