import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useFormik } from 'formik'
import * as yup from 'yup'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grow,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useLogin, useLoginUsers } from '../api/auth.js'
import { useAuth } from '../auth/useAuth.js'
import loginBg from '../assets/login-bg.png'

// Bundled by Vite — replace src/assets/login-bg.avif to change it.
const BACKGROUND_IMAGE = loginBg
const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'App'

const validationSchema = yup.object({
  user_name: yup.string().required('Please select a user'),
  password: yup.string().required('Please enter your password'),
})

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const users = useLoginUsers()
  const login = useLogin()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Send the user back to the page they tried to open, else the dashboard.
  const redirectTo = location.state?.from?.pathname ?? '/dashboard'

  const handleSubmit = (values) => {
    login
      .mutateAsync(values)
      .then((loginResponse) => {
        // Save { token, user } in Redux.
        auth.login(loginResponse)
        navigate(redirectTo, { replace: true })
      })
      .catch(() => {
        // Error is shown from login.error; keep the form usable.
      })
  }

  const formik = useFormik({
    initialValues: { user_name: 'deepak', password: '' },
    validationSchema,
    onSubmit: handleSubmit,
  })

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : ''

  if (auth.isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        bgcolor: 'primary.dark',
        // Navy-to-gold overlay on top of the image keeps the card easy to read.
        backgroundImage: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.75)}, ${alpha(theme.palette.secondary.dark, 0.55)}), url(${BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Grow in appear timeout={400}>
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            // Slightly see-through card; the blur keeps the form readable.
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
            // A form card shouldn't grow while the user is typing in it.
            '&:hover': { transform: 'none' },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} component="form" onSubmit={formik.handleSubmit}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h5" component="h1">
                  {APP_NAME}
                </Typography>
              </Stack>

              {users.isError && (
                <Alert severity="error">
                  Could not load users: {users.error.message}
                </Alert>
              )}

              {login.isError && (
                <Alert severity="error">{login.error.message}</Alert>
              )}

              <TextField
                select
                id="user_name"
                name="user_name"
                label="User name"
                value={formik.values.user_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(fieldError('user_name'))}
                helperText={fieldError('user_name')}
                disabled={users.isPending || users.isError}
                slotProps={{
                  input: users.isPending
                    ? {
                        endAdornment: (
                          <InputAdornment position="end" sx={{ mr: 3 }}>
                            <CircularProgress size={18} />
                          </InputAdornment>
                        ),
                      }
                    : undefined,
                }}
              >
                {users.data?.map((user) => (
                  <MenuItem key={user.id} value={user.user_name}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                id="password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(fieldError('password'))}
                helperText={fieldError('password')}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                          onClick={() => setShowPassword((show) => !show)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  )
}

export default LoginPage
