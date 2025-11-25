// Collection Theme Colors

export const THEMES = {
  blue: {
    name: 'Blue',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  },
  purple: {
    name: 'Purple',
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-600 dark:text-purple-400',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  },
  green: {
    name: 'Green',
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-600 dark:text-green-400',
    hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
    badge: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
  },
  red: {
    name: 'Red',
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
    hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
  },
  orange: {
    name: 'Orange',
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-600 dark:text-orange-400',
    hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
    badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
  },
  pink: {
    name: 'Pink',
    gradient: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-200 dark:border-pink-800',
    text: 'text-pink-600 dark:text-pink-400',
    hover: 'hover:bg-pink-100 dark:hover:bg-pink-900/30',
    badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
  },
  indigo: {
    name: 'Indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-600 dark:text-indigo-400',
    hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
    badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
  },
  teal: {
    name: 'Teal',
    gradient: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800',
    text: 'text-teal-600 dark:text-teal-400',
    hover: 'hover:bg-teal-100 dark:hover:bg-teal-900/30',
    badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
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

// Background Patterns/Textures
export const PATTERNS = {
  none: {
    name: 'None',
    description: 'No pattern'
  },
  dots: {
    name: 'Dots',
    description: 'Small dots pattern'
  },
  grid: {
    name: 'Grid',
    description: 'Grid lines'
  },
  diagonal: {
    name: 'Diagonal',
    description: 'Diagonal stripes'
  },
  waves: {
    name: 'Waves',
    description: 'Wave pattern'
  },
  zigzag: {
    name: 'Zigzag',
    description: 'Zigzag lines'
  },
  hexagon: {
    name: 'Hexagon',
    description: 'Hexagon pattern'
  },
  cross: {
    name: 'Cross',
    description: 'Cross pattern'
  },
  circles: {
    name: 'Circles',
    description: 'Concentric circles'
  },
  squares: {
    name: 'Squares',
    description: 'Square pattern'
  },
  triangles: {
    name: 'Triangles',
    description: 'Triangle pattern'
  },
  checkerboard: {
    name: 'Checkerboard',
    description: 'Checkerboard pattern'
  }
};

export const getPatternList = () => {
  return Object.keys(PATTERNS).map(key => ({
    value: key,
    label: PATTERNS[key].name,
    description: PATTERNS[key].description
  }));
};

// Get background pattern style
export const getPatternStyle = (pattern, color = 'rgba(0,0,0,0.03)') => {
  if (!pattern || pattern === 'none') {
    return {};
  }

  const patterns = {
    dots: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    grid: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
    diagonal: `repeating-linear-gradient(-45deg, transparent, transparent 20px, ${color} 20px, ${color} 21px)`,
    waves: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${color} 10px, ${color} 20px)`,
    zigzag: `repeating-linear-gradient(135deg, transparent 0px, transparent 10px, ${color} 10px, ${color} 11px, transparent 11px, transparent 21px, ${color} 21px, ${color} 22px)`,
    hexagon: `radial-gradient(circle at 50% 50%, transparent 40%, ${color} 40%, ${color} 50%, transparent 50%)`,
    cross: `linear-gradient(${color} 2px, transparent 2px), linear-gradient(90deg, ${color} 2px, transparent 2px)`,
    circles: `radial-gradient(circle, transparent 20%, ${color} 20%, ${color} 21%, transparent 21%)`,
    squares: `linear-gradient(${color} 1.5px, transparent 1.5px), linear-gradient(90deg, ${color} 1.5px, transparent 1.5px)`,
    triangles: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${color} 35px, ${color} 36px)`,
    checkerboard: `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%), linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%)`
  };
  
  const sizes = {
    dots: '20px 20px',
    grid: '20px 20px',
    diagonal: 'auto',
    waves: 'auto',
    zigzag: 'auto',
    hexagon: '30px 30px',
    cross: '30px 30px',
    circles: '40px 40px',
    squares: '25px 25px',
    triangles: 'auto',
    checkerboard: '40px 40px, 40px 40px'
  };

  const positions = {
    checkerboard: '0 0, 20px 20px'
  };
  
  return {
    backgroundImage: patterns[pattern] || '',
    backgroundSize: sizes[pattern] || '20px 20px',
    ...(positions[pattern] && { backgroundPosition: positions[pattern] })
  };
};
