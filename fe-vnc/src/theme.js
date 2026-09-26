import { alpha, createTheme } from '@mui/material/styles'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/600.css'
import '@fontsource/roboto/700.css'

const NAVY = '#1E2A32'
const GOLD = '#C9A227'
const TEXT = '#2B2B2B'

// Soft shadows tinted with the navy, so depth feels warm instead of grey.
const shadow = (y, blur, opacity) =>
  `0 ${y}px ${blur}px ${alpha(NAVY, opacity)}`
const SHADOW_SM = `${shadow(1, 2, 0.06)}, ${shadow(2, 8, 0.05)}`
const SHADOW_MD = `${shadow(1, 3, 0.06)}, ${shadow(8, 24, 0.08)}`
const SHADOW_LG = `${shadow(2, 6, 0.08)}, ${shadow(24, 48, 0.16)}`

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: NAVY,
      light: '#3E4C56',
      dark: '#10181D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: GOLD,
      light: '#E0C158',
      dark: '#9A7B1A',
      contrastText: NAVY,
    },
    background: {
      default: '#FAF7F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: TEXT,
      secondary: alpha(TEXT, 0.7),
    },
    divider: alpha(NAVY, 0.08),
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: `'Roboto', -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`,
    h4: { fontWeight: 600, color: NAVY, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, color: NAVY },
    overline: { fontWeight: 600, letterSpacing: '0.12em' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
})

// Component defaults are built on the base theme so they can use its palette.
const theme = createTheme(baseTheme, {
  customShadows: { sm: SHADOW_SM, md: SHADOW_MD, lg: SHADOW_LG },
  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderBottom: `1px solid ${alpha('#FFFFFF', 0.06)}` },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
          transition: 'background-color 150ms ease, box-shadow 150ms ease',
        },
        sizeLarge: { paddingBlock: 10 },
        containedPrimary: {
          boxShadow: SHADOW_SM,
          '&:hover': { backgroundColor: '#2A3842', boxShadow: SHADOW_MD },
        },
        outlined: {
          borderColor: alpha(NAVY, 0.16),
          '&:hover': {
            borderColor: alpha(NAVY, 0.32),
            backgroundColor: alpha(NAVY, 0.03),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background-color 150ms ease, color 150ms ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 12 },
        elevation1: { boxShadow: SHADOW_SM },
        elevation2: { boxShadow: SHADOW_SM },
        elevation3: { boxShadow: SHADOW_MD },
      },
    },
    // Cards lift a little on hover; pages turn this off for cards that aren't clickable.
    MuiCard: {
      defaultProps: { elevation: 3 },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${alpha(NAVY, 0.05)}`,
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          '&:hover': { transform: 'scale(1.02)', boxShadow: SHADOW_LG },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: SHADOW_LG },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          // Only the plain dialog backdrop, not the invisible one menus use.
          '&:not(.MuiBackdrop-invisible)': {
            backgroundColor: alpha(NAVY, 0.4),
            backdropFilter: 'blur(3px)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          transition: 'box-shadow 150ms ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(NAVY, 0.14),
            transition: 'border-color 150ms ease',
          },
          '&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline':
            { borderColor: alpha(NAVY, 0.32) },
          '&.Mui-focused:not(.Mui-error)': {
            boxShadow: `0 0 0 4px ${alpha(GOLD, 0.16)}`,
          },
          '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: NAVY,
            borderWidth: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { '&.Mui-focused:not(.Mui-error)': { color: NAVY } },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 4,
          borderRadius: 10,
          boxShadow: SHADOW_LG,
          border: `1px solid ${alpha(NAVY, 0.06)}`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          marginInline: 6,
          '&.Mui-selected': {
            backgroundColor: alpha(GOLD, 0.14),
            '&:hover': { backgroundColor: alpha(GOLD, 0.2) },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: 8 },
        outlined: { borderColor: alpha(NAVY, 0.14) },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: alpha(NAVY, 0.06) },
        head: {
          color: alpha(TEXT, 0.6),
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: NAVY,
          fontSize: 12,
          fontWeight: 500,
          borderRadius: 6,
          padding: '6px 10px',
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: NAVY,
          borderRadius: 10,
          boxShadow: SHADOW_LG,
          fontWeight: 500,
        },
      },
    },
    MuiSwitch: {
      defaultProps: { color: 'secondary' },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
  },
})

export default theme
