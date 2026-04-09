'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn('rounded-full', className)}
      aria-label='Toggle theme'
    >
      {mounted ? (
        isDark ? (
          <SunMedium className='w-4 h-4' />
        ) : (
          <Moon className='w-4 h-4' />
        )
      ) : (
        <SunMedium className='w-4 h-4 opacity-50' />
      )}
    </Button>
  );
}
