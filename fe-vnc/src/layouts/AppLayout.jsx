import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Logout from '@mui/icons-material/Logout'
import { useAuth } from '../auth/useAuth.js'
import { NAV_ITEMS } from './navItems.js'

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'App'

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userAnchor, setUserAnchor] = useState(null)

  const handleLogout = () => {
    setUserAnchor(null)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1, flex: 1, justifyContent: 'space-between' }}>
          {/* Small screens: links move into a menu. */}
          {/* Plain link (not router Link) so it does a full page reload. */}
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{
              mr: 3,
              color: 'inherit',
              textDecoration: 'none',
              // Small screens: hide the name so the page links fit.
              display: { xs: 'none', md: 'block' },
            }}
            noWrap
          >
            {APP_NAME}
          </Typography>

          <Box
            component="nav"
            aria-label="Main"
            sx={{
              display: 'flex',
              gap: 0.5,
              flex: 1,
              minWidth: 0,
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {NAV_ITEMS.map(({ to, label }) => (
              <Button
                key={to}
                component={NavLink}
                to={to}
                sx={(t) => ({
                  position: 'relative',
                  flexShrink: 0,
                  px: 1.75,
                  color: alpha(t.palette.common.white, 0.7),
                  fontWeight: 500,
                  '&:hover': {
                    color: 'common.white',
                    bgcolor: alpha(t.palette.common.white, 0.06),
                  },
                  // Gold underline marks the current page.
                  '&.active': { color: 'common.white' },
                  '&.active::after': {
                    content: '""',
                    position: 'absolute',
                    left: 14,
                    right: 14,
                    bottom: 2,
                    height: 2,
                    borderRadius: 2,
                    bgcolor: 'secondary.main',
                  },
                })}
              >
                {label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <Button
              color="inherit"
              onClick={(e) => setUserAnchor(e.currentTarget)}
              aria-label="Open account menu"
              sx={{ gap: 1, px: 1 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  bgcolor: 'secondary.main',
                  color: 'secondary.contrastText',
                }}
              >
                {initials(user?.name)}
              </Avatar>
              <Box
                component="span"
                sx={{ display: { xs: 'none', sm: 'inline' } }}
              >
                {user?.name}
              </Box>
            </Button>
            <Menu
              anchorEl={userAnchor}
              open={Boolean(userAnchor)}
              onClose={() => setUserAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role?.name}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Log out</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}

export default AppLayout
