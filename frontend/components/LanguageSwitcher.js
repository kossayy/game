import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full font-display text-sm tracking-widest border transition-all duration-300 bg-dark-900"
      style={{
        borderColor: language === 'en' ? '#00f0ff' : '#bf00ff',
        color: language === 'en' ? '#00f0ff' : '#bf00ff',
        boxShadow: `0 0 10px ${language === 'en' ? 'rgba(0,240,255,0.3)' : 'rgba(191,0,255,0.3)'}`,
      }}
      whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${language === 'en' ? 'rgba(0,240,255,0.5)' : 'rgba(191,0,255,0.5)'}` }}
      whileTap={{ scale: 0.95 }}
    >
      {language === 'en' ? 'العربية' : 'ENGLISH'}
    </motion.button>
  );
}
