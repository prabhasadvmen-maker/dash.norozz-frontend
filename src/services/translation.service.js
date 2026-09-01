import { axiosInstance } from '../api/axiosInstance.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'কন্নড়', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'od-IN', name: 'Odia', nativeName: 'ওড়িয়া', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
];

export const translationService = {
  /**
   * Send single translation request to backend API
   */
  translateText: async ({ text, sourceLanguage = 'en-IN', targetLanguage = 'hi-IN' }) => {
    const res = await axiosInstance.post('/translation/translate', {
      text,
      sourceLanguage,
      targetLanguage,
    });
    return res;
  },

  /**
   * Send batch translation request to backend API
   */
  translateBatch: async ({ texts, sourceLanguage = 'en-IN', targetLanguage = 'hi-IN' }) => {
    const res = await axiosInstance.post('/translation/translate-batch', {
      texts,
      sourceLanguage,
      targetLanguage,
    });
    return res;
  },

  /**
   * Fetch list of supported languages from backend API
   */
  getSupportedLanguages: async () => {
    const res = await axiosInstance.get('/translation/languages');
    return res;
  },
};
