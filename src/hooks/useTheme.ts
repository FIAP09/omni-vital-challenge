import { useState, useCallback, useEffect, useMemo } from 'react'

const THEME_KEY = 'omni-vital:theme'
type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return (localStorage.getItem(THEME_KEY) as Theme) || 'dark'
}

function applyThemeToDOM(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

// Apply initial theme immediately (module-level side effect, same as Vue version)
if (typeof window !== 'undefined') {
  applyThemeToDOM(getInitialTheme())
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  const isDark = useMemo(() => theme === 'dark', [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
    applyThemeToDOM(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // Sync DOM on mount (handles SSR hydration edge case)
  useEffect(() => {
    applyThemeToDOM(theme)
  }, [theme])

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  }
}
