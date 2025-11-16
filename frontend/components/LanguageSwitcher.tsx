'use client';

interface LanguageSwitcherProps {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

export default function LanguageSwitcher({ language, setLanguage }: LanguageSwitcherProps) {

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    if (setLanguage) {
      setLanguage(lang);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-1" role="group" aria-label="Language selector">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleLanguageChange('ar');
        }}
        aria-label="Switch to Arabic"
        aria-pressed={language === 'ar' ? 'true' : 'false'}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          language === 'ar'
            ? 'bg-primary-dark text-white'
            : 'text-gray-600 hover:text-primary-dark hover:bg-gray-50'
        }`}
      >
        عربي
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleLanguageChange('en');
        }}
        aria-label="Switch to English"
        aria-pressed={language === 'en' ? 'true' : 'false'}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-primary-dark text-white'
            : 'text-gray-600 hover:text-primary-dark hover:bg-gray-50'
        }`}
      >
        English
      </button>
    </div>
  );
}

