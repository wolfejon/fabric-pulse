import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_LAYOUT_ID,
  LAYOUT_STORAGE_KEY,
  LAYOUTS,
  getLayoutMeta,
  resolveLayoutId,
  type LayoutId,
  type LayoutMeta,
} from './layouts'

type LayoutContextValue = {
  layoutId: LayoutId
  layout: LayoutMeta
  layouts: LayoutMeta[]
  setLayoutId: (id: LayoutId) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

function readStoredLayout(): LayoutId {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY)
    const resolved = resolveLayoutId(stored)
    if (resolved) return resolved
  } catch {
    /* ignore */
  }
  return DEFAULT_LAYOUT_ID
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutId, setLayoutIdState] = useState<LayoutId>(() => readStoredLayout())

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, layoutId)
    } catch {
      /* ignore */
    }
  }, [layoutId])

  const setLayoutId = useCallback((id: LayoutId) => {
    setLayoutIdState(id)
  }, [])

  const value = useMemo<LayoutContextValue>(
    () => ({
      layoutId,
      layout: getLayoutMeta(layoutId),
      layouts: LAYOUTS,
      setLayoutId,
    }),
    [layoutId, setLayoutId],
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
  return ctx
}
