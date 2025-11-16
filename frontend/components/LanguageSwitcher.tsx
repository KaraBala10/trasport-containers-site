'use client';

interface LanguageSwitcherProps {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

export default function LanguageSwitcher({ language, setLanguage }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-1">
      <button
        onClick={() => setLanguage('ar')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          language === 'ar'
            ? 'bg-primary-dark text-white'
            : 'text-gray-600 hover:text-primary-dark hover:bg-gray-50'
        }`}
      >
        عربي
      </button>
      <button
        onClick={() => setLanguage('en')}
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

