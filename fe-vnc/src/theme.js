import { createTheme } from '@mui/material/styles'

const themeA = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E2A32',
      light: '#3E4C56',
      dark: '#10181D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C9A227',
      light: '#E0C158',
      dark: '#9A7B1A',
      contrastText: '#1E2A32',
    },
    background: {
      default: '#FAF7F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2B2B2B',
      secondary: '#6B6B6B',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: `'Roboto', 'Georgia', serif`,
    h5: { fontWeight: 700, color: '#1E2A32' },
    h6: { fontWeight: 600 },
  },
})

export default themeA
