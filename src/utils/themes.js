// Collection Theme Colors with Patterns

export const THEMES = {
  blue: {
    name: 'Blue',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    pattern: 'dots' // dots, grid, waves, diagonal
  },
  purple: {
    name: 'Purple',
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-600 dark:text-purple-400',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    pattern: 'waves'
  },
  green: {
    name: 'Green',
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-600 dark:text-green-400',
    hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
    badge: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    pattern: 'grid'
  },
  red: {
    name: 'Red',
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
    hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    pattern: 'diagonal'
  },
  orange: {
    name: 'Orange',
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-600 dark:text-orange-400',
    hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
    badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    pattern: 'dots'
  },
  pink: {
    name: 'Pink',
    gradient: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-200 dark:border-pink-800',
    text: 'text-pink-600 dark:text-pink-400',
    hover: 'hover:bg-pink-100 dark:hover:bg-pink-900/30',
    badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    pattern: 'waves'
  },
  indigo: {
    name: 'Indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-600 dark:text-indigo-400',
    hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
    badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    pattern: 'grid'
  },
  teal: {
    name: 'Teal',
    gradient: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800',
    text: 'text-teal-600 dark:text-teal-400',
    hover: 'hover:bg-teal-100 dark:hover:bg-teal-900/30',
    badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    pattern: 'diagonal'
  }
};

export const getTheme = (themeName) => {
  return THEMES[themeName] || THEMES.blue;
};

export const getThemeList = () => {
  return Object.keys(THEMES).map(key => ({
    value: key,
    label: THEMES[key].name,
    gradient: THEMES[key].gradient
  }));
};

// Get background pattern style
export const getPatternStyle = (pattern, color = 'rgba(0,0,0,0.03)') => {
  const patterns = {
    dots: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    grid: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
    waves: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${color} 10px, ${color} 20px)`,
    diagonal: `repeating-linear-gradient(-45deg, transparent, transparent 20px, ${color} 20px, ${color} 21px)`
  };
  
  const sizes = {
    dots: '20px 20px',
    grid: '20px 20px',
    waves: 'auto',
    diagonal: 'auto'
  };
  
  return {
    backgroundImage: patterns[pattern] || patterns.dots,
    backgroundSize: sizes[pattern] || '20px 20px'
  };
};
