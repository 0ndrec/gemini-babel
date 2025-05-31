
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language } from '../constants';
import { ProgressData } from "../components/ProgressTracker"; // Assuming ProgressData is exported from ProgressTracker or a types file

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. Gemini API calls will fail.");
}
// Initialize GoogleGenAI with the API key from environment variables
// Ensure this is only initialized once
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const GEMINI_MODEL = "gemini-2.5-flash-preview-04-17";

const generatePoHeader = (targetLanguage: Language): string => {
  const now = new Date();
  const potCreationDate = `${now.toISOString().replace('T', ' ').substring(0, 19)}+0000`;
  const pluralForms = targetLanguage.pluralForms || "nplurals=2; plural=(n != 1);";

  return `msgid ""
msgstr ""
"Project-Id-Version: PACKAGE VERSION\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: ${potCreationDate}\\n"
"PO-Revision-Date: ${potCreationDate}\\n"
"Last-Translator: Gemini BabelGen <noreply@example.com>\\n"
"Language-Team: ${targetLanguage.name} <${targetLanguage.code}@li.org>\\n"
"Language: ${targetLanguage.code}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: Gemini BabelGen v0.1\\n"
"${pluralForms}\\n"
`;
};


const translateSingleText = async (
  text: string,
  sourceLanguage: Language,
  targetLanguage: Language
): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini AI SDK not initialized. API_KEY might be missing.");
  }

  const prompt = `
You are an expert multilingual translator specializing in software internationalization for Python Flask applications using Babel.
Your task is to translate the given text string accurately from ${sourceLanguage.name} to ${targetLanguage.name}.

Crucial Instructions:
1.  **Preserve Placeholders**: Retain all Python-style formatting placeholders (e.g., \`%(name)s\`, \`%s\`, \`%d\`, \`{variable}\`) and HTML tags (e.g. \`<b>\`, \`<a>\`) exactly as they appear in the original string. Do not translate the content of these placeholders.
2.  **Exact Output**: Provide *only* the translated string as your response. Do not include any explanations, apologies, conversational filler, or markdown formatting like backticks around the translated string.
3.  **Context**: The string is part of a software application and will be used with gettext.
4.  **Special Characters**: Ensure all special characters (like newlines \`\\n\`, tabs \`\\t\`) are preserved or correctly represented in the translation if they are part of the original string's meaning.

Original Text (${sourceLanguage.name}):
"${text.replace(/"/g, '\\"')}"

Translated Text (${targetLanguage.name}):
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{text: prompt}] }],
        config: {
            // For translation, higher quality is preferred. Default thinking behavior.
            // temperature: 0.3, // Lower temperature for more deterministic translations
        }
    });
    const translation = response.text?.trim() || "";
    if (translation.startsWith('"') && translation.endsWith('"')) {
        return translation.substring(1, translation.length - 1).replace(/\\"/g, '"');
    }
    return translation.replace(/\\"/g, '"');

  } catch (error) {
    console.error(`Error translating text "${text}":`, error);
    return `TRANSLATION_ERROR: ${text}`; 
  }
};

export const translateTextsToPo = async (
  inputText: string,
  sourceLanguage: Language,
  targetLanguage: Language,
  onProgress: (data: Partial<ProgressData>) => void
): Promise<string> => {
  const msgids = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  onProgress({ totalStrings: msgids.length, currentIndex: 0, currentText: '' });

  if (msgids.length === 0) {
    return generatePoHeader(targetLanguage);
  }

  let poFileContent = generatePoHeader(targetLanguage);
  let currentIndex = 0;

  for (const msgid of msgids) {
    currentIndex++;
    onProgress({ currentIndex, currentText: msgid });

    const escapedMsgid = msgid.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const translatedText = await translateSingleText(msgid, sourceLanguage, targetLanguage);
    const escapedTranslatedText = translatedText.replace(/"/g, '\\"').replace(/\n/g, '\\n');

    poFileContent += `\n`;
    poFileContent += `#. Automatically-generated entry by Gemini BabelGen\n`;
    poFileContent += `msgid "${escapedMsgid}"\n`;
    poFileContent += `msgstr "${escapedTranslatedText}"\n`;
  }

  return poFileContent;
};