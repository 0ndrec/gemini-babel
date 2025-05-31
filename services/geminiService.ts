import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language } from '../constants';
import { ProgressData } from "../components/ProgressTracker";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. Gemini API calls will fail.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const GEMINI_MODEL = "gemini-2.5-flash-preview-04-17";

interface GeminiTranslationRequestItem {
  id: number;
  text: string;
}

interface GeminiTranslationResponseItem {
  id: number;
  translation: string;
}

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

export const translateTextsToPo = async (
  inputText: string,
  sourceLanguage: Language,
  targetLanguage: Language,
  onProgress: (data: Partial<ProgressData>) => void
): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini AI SDK not initialized. API_KEY might be missing.");
  }

  const msgids = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const totalStrings = msgids.length;
  if (totalStrings === 0) {
    return generatePoHeader(targetLanguage);
  }

  onProgress({ totalStrings, currentIndex: 0, currentText: `Preparing to translate ${totalStrings} strings...` });

  const textsToTranslate: GeminiTranslationRequestItem[] = msgids.map((text, index) => ({ id: index, text: text }));

  const prompt = `
Translate each text string in the provided JSON array from ${sourceLanguage.name} to ${targetLanguage.name}.
Return a JSON array of objects. Each object in the output array must have:
1. An "id" field, exactly matching the "id" from the input object.
2. A "translation" field, containing only the translated string.

Strict rules for EACH translation:
- Preserve placeholders (e.g., %(name)s, %s, {variable_name}, {{placeholder}}).
- Preserve HTML tags (e.g., <b>, <i>, <a href="...">).
- Correctly handle special characters like newlines (\\n), tabs (\\t). The output translation string itself should not be JSON escaped unless the special characters are part of the actual translation (e.g. a translated string literally containing '\\n').
- The "translation" field must contain ONLY the translated text, no extra explanations or markdown.

Input array of texts to translate:
${JSON.stringify(textsToTranslate)}

Respond ONLY with the JSON array of translation results. Ensure the output is a valid JSON array.
Example of a single item in the output array: {"id": 0, "translation": "Translated text here"}
`;

  try {
    onProgress({ currentText: `Translating ${totalStrings} strings in a batch...` });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Omitting thinkingConfig to use default (enabled thinking for higher quality)
      }
    });

    let jsonStr = response.text?.trim() || "";
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/si;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    let translatedItems: GeminiTranslationResponseItem[] = [];
    try {
      translatedItems = JSON.parse(jsonStr);
      if (!Array.isArray(translatedItems) || !translatedItems.every(item => typeof item.id === 'number' && typeof item.translation === 'string')) {
        console.error("Parsed JSON is not an array of {id: number, translation: string}:", translatedItems);
        throw new Error("Translation service returned an unexpected data structure. Ensure the model provides a valid JSON array of {id, translation} objects.");
      }
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", e);
      console.error("Raw response text (check for malformed JSON or non-JSON error message):", response.text);
      throw new Error(`Failed to parse translations from AI. The AI response was not valid JSON or did not match the expected format. Raw response: "${response.text.substring(0, 500)}${response.text.length > 500 ? '...' : ''}"`);
    }
    
    onProgress({ currentText: `Received ${translatedItems.length} translations, formatting .po file...` });

    const translationsMap = new Map<number, string>();
    translatedItems.forEach(item => {
      translationsMap.set(item.id, item.translation);
    });

    let poFileContent = generatePoHeader(targetLanguage);
    let processedCount = 0;

    for (let i = 0; i < totalStrings; i++) {
      const msgid = msgids[i];
      const translatedText = translationsMap.get(i);

      const escapedMsgid = msgid.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      let escapedTranslatedText: string;

      if (translatedText !== undefined) {
        // The translation from Gemini should be the direct string.
        // Escape it for .po format here.
        escapedTranslatedText = translatedText.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      } else {
        console.warn(`No translation found for msgid (id: ${i}): "${msgid}". Using original with error marker.`);
        // Escape the original msgid to ensure valid PO format for the error message
        escapedTranslatedText = `TRANSLATION_ERROR_MISSING: ${escapedMsgid}`;
      }

      poFileContent += `\n`;
      poFileContent += `#. Automatically-generated entry by Gemini BabelGen\n`;
      poFileContent += `msgid "${escapedMsgid}"\n`;
      poFileContent += `msgstr "${escapedTranslatedText}"\n`;
      processedCount++;
    }
    
    onProgress({ currentIndex: processedCount, currentText: `All ${processedCount} strings processed.` });
    return poFileContent;

  } catch (error) {
    console.error(`Error in batch translation:`, error);
    // Add more context to the error if it's a known type from the SDK
    if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(`Batch translation failed: ${error.message}`);
    }
    throw new Error(`An unknown error occurred during batch translation.`);
  }
};
