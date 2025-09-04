import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ptBrTranslations } from './locales/pt-br';

const resources = {
  'pt-BR': {
    translation: ptBrTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;