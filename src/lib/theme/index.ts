'use client'

import { alpha, createTheme, type ThemeOptions, type Shadows } from '@mui/material/styles'

const darkTokens = {
  bg: {
    default: '#0A0A0F',
    subtle: '#111118',
    elevated: '#16161F',
    overlay: '#1C1C27',
    hover: '#1E1E2B'
  },
  border: {
    default: '#1E1E2E',
    subtle: '#252535',
    strong: '#2E2E42'
  },
  text: {
    primary: '#F0F0FF',
    secondary: '#9B9BB8',
    tertiary: '#5C5C78'
  },
  accent: {
    main: '#7C3AED',
    light: '#8B5CF6',
    lighter: '#A78BFA',
    bg: '#1A0F35',
    border: '#2D1B5E'
  }
} as const

const shadows: Shadows = [
  'none',
  '0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
  '0 4px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
  '0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
  '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none',
  'none'
]

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: darkTokens.bg.default,
      paper: darkTokens.bg.elevated
    },
    primary: {
      main: darkTokens.accent.main,
      light: darkTokens.accent.light,
      dark: '#5B21B6',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#1D4ED8'
    },
    error: { main: '#EF4444' },
    warning: { main: '#F97316' },
    success: { main: '#059669' },
    info: { main: '#3B82F6' },
    text: {
      primary: darkTokens.text.primary,
      secondary: darkTokens.text.secondary,
      disabled: darkTokens.text.tertiary,
      tertiary: darkTokens.text.tertiary
    },
    divider: darkTokens.border.default
  },
  typography: {
    fontFamily: '"Inter", -apple-system, sans-serif',
    h1: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.02em' },
    h2: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.015em' },
    h3: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em' },
    h4: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '1rem' },
    h5: { fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.9375rem' },
    h6: { fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.875rem' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.4 },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase'
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      letterSpacing: '0.01em',
      textTransform: 'none'
    }
  },
  shape: { borderRadius: 8 },
  spacing: 4,
  shadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box', scrollbarWidth: 'thin', scrollbarColor: '#2E2E42 transparent' },
        '*::-webkit-scrollbar': { width: '6px', height: '6px' },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': { background: '#2E2E42', borderRadius: '3px' },
        html: { scrollBehavior: 'smooth' },
        body: { backgroundColor: darkTokens.bg.default, overflowX: 'hidden' },
        '::selection': { background: alpha(darkTokens.accent.main, 0.3), color: darkTokens.text.primary },
        '[data-nextjs-dev-indicator]': { display: 'none !important' },
        '#__next-build-watcher': { display: 'none !important' },
        '#nextjs-portal [data-nextjs-dev-indicator]': { display: 'none !important' },
        '[data-nextjs-devtools]': { display: 'none !important' },
        '#__nextjs__devtools': { display: 'none !important' },
        '#nextjs__devtools': { display: 'none !important' },
        '[data-nextjs-dialog-overlay]': { display: 'none !important' },
        '[data-nextjs-dialog]': { display: 'none !important' },
        '[data-nextjs-route-info]': { display: 'none !important' },
        '[data-nextjs-route-info-panel]': { display: 'none !important' },
        '[data-nextjs-route-info-dialog]': { display: 'none !important' },
        '[data-nextjs-preferences]': { display: 'none !important' }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '6px 14px',
          transition: 'all 0.15s ease',
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' }
        },
        contained: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
          boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(124,58,237,0.5)',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
          }
        },
        outlined: {
          borderColor: darkTokens.border.strong,
          color: darkTokens.text.primary,
          '&:hover': { borderColor: darkTokens.accent.main, backgroundColor: alpha(darkTokens.accent.main, 0.06) }
        },
        text: {
          color: darkTokens.text.secondary,
          '&:hover': { backgroundColor: darkTokens.bg.hover, color: darkTokens.text.primary }
        },
        sizeSmall: { fontSize: '0.8125rem', padding: '4px 10px' },
        sizeLarge: { fontSize: '0.9375rem', padding: '10px 20px' }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          color: darkTokens.text.secondary,
          transition: 'all 0.15s ease',
          '&:hover': { backgroundColor: darkTokens.bg.hover, color: darkTokens.text.primary }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: darkTokens.bg.elevated,
          border: `1px solid ${darkTokens.border.default}`
        },
        elevation1: { boxShadow: shadows[1] },
        elevation2: { boxShadow: shadows[2] },
        elevation3: { boxShadow: shadows[3] }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: darkTokens.bg.elevated,
          border: `1px solid ${darkTokens.border.default}`,
          borderRadius: 10,
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': { borderColor: darkTokens.border.strong, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }
        }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: darkTokens.bg.subtle,
            borderRadius: 6,
            fontSize: '0.875rem',
            '& fieldset': { borderColor: darkTokens.border.default },
            '&:hover fieldset': { borderColor: darkTokens.border.strong },
            '&.Mui-focused fieldset': {
              borderColor: darkTokens.accent.main,
              boxShadow: `0 0 0 3px ${alpha(darkTokens.accent.main, 0.15)}`
            },
            '& input': { color: darkTokens.text.primary, '&::placeholder': { color: darkTokens.text.tertiary } }
          },
          '& .MuiInputLabel-root': { color: darkTokens.text.secondary, fontSize: '0.875rem' },
          '& .MuiInputLabel-root.Mui-focused': { color: darkTokens.accent.main }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: darkTokens.bg.subtle,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTokens.border.default },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTokens.border.strong },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTokens.accent.main }
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: darkTokens.bg.overlay,
          border: `1px solid ${darkTokens.border.subtle}`,
          borderRadius: 8,
          boxShadow: shadows[3],
          minWidth: 160
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: darkTokens.text.secondary,
          padding: '8px 12px',
          borderRadius: 4,
          margin: '1px 4px',
          '&:hover': { backgroundColor: darkTokens.bg.hover, color: darkTokens.text.primary },
          '&.Mui-selected': { backgroundColor: darkTokens.accent.bg, color: darkTokens.accent.lighter },
          '&.Mui-selected:hover': { backgroundColor: alpha(darkTokens.accent.main, 0.2) }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 500,
          height: 22,
          '& .MuiChip-label': { padding: '0 8px' }
        },
        filled: {
          backgroundColor: darkTokens.bg.overlay,
          color: darkTokens.text.secondary,
          border: `1px solid ${darkTokens.border.subtle}`
        },
        outlined: {
          borderColor: darkTokens.border.strong,
          color: darkTokens.text.secondary
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: darkTokens.bg.overlay,
          border: `1px solid ${darkTokens.border.subtle}`,
          color: darkTokens.text.primary,
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '6px 10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        },
        arrow: { color: darkTokens.bg.overlay }
      },
      defaultProps: { arrow: true, enterDelay: 400 }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: darkTokens.bg.elevated,
          backgroundImage: 'none',
          border: `1px solid ${darkTokens.border.subtle}`,
          borderRadius: 12,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
        },
        backdrop: { backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 600,
          color: darkTokens.text.primary,
          padding: '20px 24px 12px',
          fontFamily: '"DM Sans", sans-serif'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: darkTokens.border.default }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: { padding: 0 }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '7px 10px',
          margin: '1px 0',
          color: darkTokens.text.secondary,
          fontSize: '0.875rem',
          transition: 'all 0.1s ease',
          '&:hover': { backgroundColor: darkTokens.bg.hover, color: darkTokens.text.primary },
          '&.Mui-selected': { backgroundColor: darkTokens.accent.bg, color: darkTokens.accent.lighter },
          '&.Mui-selected:hover': { backgroundColor: alpha(darkTokens.accent.main, 0.18) }
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 28,
          height: 28,
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: darkTokens.accent.bg,
          color: darkTokens.accent.lighter,
          border: `1px solid ${darkTokens.accent.border}`
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: darkTokens.border.default, borderRadius: 4, height: 4 },
        bar: { backgroundColor: darkTokens.accent.main, borderRadius: 4 }
      }
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: darkTokens.border.default },
        wave: { '&::after': { background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)' } }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, border: '1px solid', fontSize: '0.875rem' },
        standardError: {
          backgroundColor: alpha('#EF4444', 0.08),
          borderColor: alpha('#EF4444', 0.2),
          color: '#FCA5A5'
        },
        standardSuccess: {
          backgroundColor: alpha('#059669', 0.08),
          borderColor: alpha('#059669', 0.2),
          color: '#6EE7B7'
        },
        standardWarning: {
          backgroundColor: alpha('#F97316', 0.08),
          borderColor: alpha('#F97316', 0.2),
          color: '#FED7AA'
        },
        standardInfo: {
          backgroundColor: alpha('#3B82F6', 0.08),
          borderColor: alpha('#3B82F6', 0.2),
          color: '#93C5FD'
        }
      }
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: '#EF4444',
          color: '#FFFFFF',
          fontSize: '0.625rem',
          fontWeight: 700,
          minWidth: 16,
          height: 16,
          padding: '0 4px',
          borderRadius: 8,
          border: `2px solid ${darkTokens.bg.default}`
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: darkTokens.text.secondary,
          textTransform: 'none',
          minHeight: 40,
          padding: '8px 16px',
          '&.Mui-selected': { color: darkTokens.text.primary }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: darkTokens.accent.main, height: 2, borderRadius: 2 },
        root: { borderBottom: `1px solid ${darkTokens.border.default}`, minHeight: 40 }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${darkTokens.border.default}`,
          color: darkTokens.text.secondary,
          fontSize: '0.875rem',
          padding: '10px 16px'
        },
        head: {
          color: darkTokens.text.tertiary,
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          backgroundColor: darkTokens.bg.subtle
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        thumb: { boxShadow: 'none' },
        track: { backgroundColor: darkTokens.border.strong, opacity: 1 },
        switchBase: {
          '&.Mui-checked': {
            '& + .MuiSwitch-track': { backgroundColor: darkTokens.accent.main, opacity: 1 }
          }
        }
      }
    }
  }
}

export const darkTheme = createTheme(darkThemeOptions)

export const lightTheme = createTheme({
  ...darkThemeOptions,
  palette: {
    mode: 'light',
    background: { default: '#FAFAFA', paper: '#FFFFFF' },
    primary: { main: '#7C3AED', light: '#8B5CF6', dark: '#5B21B6', contrastText: '#FFFFFF' },
    text: { primary: '#0A0A0F', secondary: '#6B7280', disabled: '#D1D5DB', tertiary: '#9CA3AF' },
    divider: '#E5E5EF'
  }
})
