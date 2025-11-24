import { useState, useEffect } from 'react';

export function useDarkMode() {
  // Initialize from localStorage
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme_mode');
    const initialValue = saved === 'dark';
    
    // Apply immediately on init
    if (initialValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return initialValue;
  });

  const toggle = () => {
    setIsDark(prev => {
      const newValue = !prev;
      
      // Apply theme change immediately in the same function
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme_mode', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme_mode', 'light');
      }
      
      return newValue;
    });
  };

  return [isDark, toggle];
}
