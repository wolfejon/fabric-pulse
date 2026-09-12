import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { LayoutProvider } from './layout/LayoutProvider'
import { ThemeProvider } from './theme/ThemeProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LayoutProvider>
        <App />
      </LayoutProvider>
    </ThemeProvider>
  </StrictMode>,
)
