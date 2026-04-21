import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  es: { translation: es }
};


const getTelegramLanguage = () => {
  try {
    const tg = (window as any).Telegram?.WebApp;
    const lang = tg?.initDataUnsafe?.user?.language_code;
    
    if (lang && resources.hasOwnProperty(lang)) {
      return lang;
    }
  } catch (e) {
    console.error("Failed to detect TG language", e);
  }
  return 'en'; 
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getTelegramLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
