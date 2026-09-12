import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_THEME_ID,
  THEME_STORAGE_KEY,
  THEMES,
  getThemeMeta,
  isThemeId,
  type ThemeId,
  type ThemeMeta,
} from './themes'

type ThemeContextValue = {
  themeId: ThemeId
  theme: ThemeMeta
  themes: ThemeMeta[]
  setThemeId: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (isThemeId(stored)) return stored
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME_ID
}

function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme')
      if (isThemeId(attr)) return attr
    }
    return readStoredTheme()
  })

  useLayoutEffect(() => {
    applyTheme(themeId)
  }, [themeId])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId)
    } catch {
      /* ignore */
    }
  }, [themeId])

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeId,
      theme: getThemeMeta(themeId),
      themes: THEMES,
      setThemeId,
    }),
    [themeId, setThemeId],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
