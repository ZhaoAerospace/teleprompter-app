import { createTheme, alpha } from '@mui/material/styles'

const primary = '#2563EB'
const muted = '#64748B'
const border = '#E2E8F0'
const pageBg = '#F8FAFC'
const surface = '#FFFFFF'
const destructive = '#DC2626'
const success = '#16A34A'

export const designTokens = {
  primary,
  primaryHover: '#1D4ED8',
  muted,
  border,
  pageBg,
  surface,
  destructive,
  success,
  text: '#0F172A',
  placeholder: '#94A3B8',
  appBarDark: '#0B1220',
  appBarDarkBorder: '#1F2937',
  appBarDarkText: '#E5E7EB',
}

export function createAppTheme(mode: 'light' | 'dark') {
  const isLight = mode === 'light'
  return createTheme({
    palette: {
      mode,
      primary: { main: primary },
      error: { main: destructive },
      success: { main: success },
      divider: border,
      background: {
        default: isLight ? pageBg : '#0B1220',
        paper: isLight ? surface : '#111827',
      },
      text: {
        primary: isLight ? '#0F172A' : '#E5E7EB',
        secondary: isLight ? muted : alpha('#E5E7EB', 0.72),
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily:
        '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight ? pageBg : '#0B1220',
          },
        },
      },
    },
  })
}
