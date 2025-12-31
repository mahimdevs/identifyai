import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Language code to display name mapping
export const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  ru: 'Russian',
  nl: 'Dutch',
  pl: 'Polish',
  tr: 'Turkish',
  vi: 'Vietnamese',
  th: 'Thai',
  id: 'Indonesian',
  ms: 'Malay',
  sv: 'Swedish',
  da: 'Danish',
  no: 'Norwegian',
  fi: 'Finnish',
  cs: 'Czech',
  el: 'Greek',
  he: 'Hebrew',
  uk: 'Ukrainian',
  ro: 'Romanian',
  hu: 'Hungarian',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
  ur: 'Urdu',
  fa: 'Persian',
  sw: 'Swahili',
  tl: 'Filipino',
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
