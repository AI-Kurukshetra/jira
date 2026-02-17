'use client'

import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { darkTheme, lightTheme } from './index'

interface ThemeContextValue {
  mode: 'dark' | 'light'
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  toggle: () => {
    // no-op default
  }
})

export const useThemeMode = () => useContext(ThemeContext)

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'dark' | 'light'>('dark')

  const toggle = () => {
    setMode((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode])

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
