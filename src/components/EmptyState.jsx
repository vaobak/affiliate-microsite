import { getTheme } from '../utils/themes';

export default function EmptyState({ theme = 'blue', message = 'Belum ada produk', description = 'Tambahkan produk pertama Anda' }) {
  const themeColors = getTheme(theme);
  
  return (
    <div className="text-center py-20 animate-fade-in">
      <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${themeColors.gradient} opacity-10 flex items-center justify-center animate-pulse-slow`}>
        <svg className={`w-12 h-12 ${themeColors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-2">
        {message}
      </h3>
      <p className="text-base text-gray-500 dark:text-gray-400 font-sans">
        {description}
      </p>
    </div>
  );
}
