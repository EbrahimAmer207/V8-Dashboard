'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  // Prevent hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="secondary" size="icon" className="relative">
        <div className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative overflow-hidden group"
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 text-amber-500 transition-all group-hover:text-amber-600 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 text-slate-600 transition-all group-hover:text-slate-900 dark:scale-100 dark:rotate-0 dark:text-cyan-200 dark:group-hover:text-cyan-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
