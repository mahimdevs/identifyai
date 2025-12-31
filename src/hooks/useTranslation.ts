import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Language code to display name mapping
export const languageNames: Record<string, string> = {
  // Major World Languages
  en: 'English',
  zh: 'Chinese (Mandarin)',
  es: 'Spanish',
  hi: 'Hindi',
  ar: 'Arabic',
  bn: 'Bengali',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  pa: 'Punjabi',
  de: 'German',
  jv: 'Javanese',
  ko: 'Korean',
  fr: 'French',
  te: 'Telugu',
  vi: 'Vietnamese',
  mr: 'Marathi',
  ta: 'Tamil',
  tr: 'Turkish',
  ur: 'Urdu',
  it: 'Italian',
  th: 'Thai',
  gu: 'Gujarati',
  pl: 'Polish',
  uk: 'Ukrainian',
  ml: 'Malayalam',
  kn: 'Kannada',
  or: 'Odia',
  my: 'Burmese',
  
  // European Languages
  nl: 'Dutch',
  ro: 'Romanian',
  el: 'Greek',
  cs: 'Czech',
  hu: 'Hungarian',
  sv: 'Swedish',
  be: 'Belarusian',
  bg: 'Bulgarian',
  sr: 'Serbian',
  hr: 'Croatian',
  sk: 'Slovak',
  da: 'Danish',
  fi: 'Finnish',
  no: 'Norwegian',
  lt: 'Lithuanian',
  lv: 'Latvian',
  sl: 'Slovenian',
  et: 'Estonian',
  mk: 'Macedonian',
  sq: 'Albanian',
  bs: 'Bosnian',
  ga: 'Irish',
  cy: 'Welsh',
  is: 'Icelandic',
  mt: 'Maltese',
  lb: 'Luxembourgish',
  ca: 'Catalan',
  gl: 'Galician',
  eu: 'Basque',
  
  // Middle Eastern & Central Asian
  fa: 'Persian (Farsi)',
  he: 'Hebrew',
  ku: 'Kurdish',
  ps: 'Pashto',
  uz: 'Uzbek',
  kk: 'Kazakh',
  az: 'Azerbaijani',
  hy: 'Armenian',
  ka: 'Georgian',
  tg: 'Tajik',
  tk: 'Turkmen',
  ky: 'Kyrgyz',
  mn: 'Mongolian',
  
  // South & Southeast Asian
  id: 'Indonesian',
  ms: 'Malay',
  tl: 'Filipino (Tagalog)',
  ne: 'Nepali',
  si: 'Sinhala',
  km: 'Khmer',
  lo: 'Lao',
  
  // African Languages
  sw: 'Swahili',
  am: 'Amharic',
  ha: 'Hausa',
  yo: 'Yoruba',
  ig: 'Igbo',
  zu: 'Zulu',
  xh: 'Xhosa',
  af: 'Afrikaans',
  so: 'Somali',
  rw: 'Kinyarwanda',
  mg: 'Malagasy',
  
  // Other Languages
  eo: 'Esperanto',
  la: 'Latin',
  yi: 'Yiddish',
  haw: 'Hawaiian',
  mi: 'Maori',
  sm: 'Samoan',
};

export const useTranslation = () => {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [detectedLanguageName, setDetectedLanguageName] = useState<string>('English');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // Detect user's preferred language from browser
    const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
    const langCode = browserLang.split('-')[0].toLowerCase();
    setDetectedLanguage(langCode);
    setDetectedLanguageName(languageNames[langCode] || browserLang);
    
    // Set default selected language to detected language (if not English)
    if (langCode !== 'en') {
      setSelectedLanguage(langCode);
    }
  }, []);

  const translateContent = async <T extends Record<string, any>>(
    content: T,
    targetLangCode?: string
  ): Promise<T | null> => {
    const langCode = targetLangCode || selectedLanguage || detectedLanguage;
    const langName = languageNames[langCode] || langCode;
    
    if (langCode === 'en') {
      toast.info('Content is already in English');
      return null;
    }

    setIsTranslating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: {
          content,
          targetLanguage: langName,
        },
      });

      if (error) {
        console.error('Translation error:', error);
        toast.error('Translation failed. Please try again.');
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      toast.success(`Translated to ${langName}`);
      return data.translated as T;
    } catch (err) {
      console.error('Translation error:', err);
      toast.error('Translation service unavailable');
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    detectedLanguage,
    detectedLanguageName,
    selectedLanguage,
    setSelectedLanguage,
    isTranslating,
    translateContent,
    isEnglish: detectedLanguage === 'en',
    availableLanguages: languageNames,
  };
};
