// utils/themeHelper.ts
export function applyTheme(theme: 'light' | 'dark' | 'auto') {
    const root = document.documentElement;
  
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }
  