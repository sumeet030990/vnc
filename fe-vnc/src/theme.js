import { alpha, createTheme } from '@mui/material/styles'

// Colours and card style follow the UI/Theme Guidelines in project.md.
const PRIMARY = '#3F51B5' // indigo
const SECONDARY = '#26A69A' // soft teal

// Soft, layered shadows for the elevated "3D" card look.
const cardShadow = `0 1px 2px ${alpha(PRIMARY, 0.06)}, 0 4px 12px ${alpha(PRIMARY, 0.08)}, 0 12px 24px ${alpha('#000', 0.06)}`
const cardShadowHover = `0 2px 4px ${alpha(PRIMARY, 0.08)}, 0 8px 20px ${alpha(PRIMARY, 0.12)}, 0 20px 40px ${alpha('#000', 0.08)}`

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: PRIMARY,
    },
    secondary: {
      main: SECONDARY,
    },
    background: {
      default: '#F5F6FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2340',
      secondary: '#5C6285',
    },
    divider: alpha(PRIMARY, 0.12),
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'primary',
      },
      styleOverrides: {
        root: {
          boxShadow: `0 2px 12px ${alpha(PRIMARY, 0.25)}`,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 3,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: cardShadow,
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: cardShadowHover,
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:hover': { transform: 'none' },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background-color 200ms ease, transform 150ms ease',
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
  },
})

export default theme
