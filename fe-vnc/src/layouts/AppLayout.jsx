import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import Logout from '@mui/icons-material/Logout'
import { useAuth } from '../auth/authContext.js'
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
  const [navAnchor, setNavAnchor] = useState(null)
  const [userAnchor, setUserAnchor] = useState(null)

  const handleLogout = () => {
    setUserAnchor(null)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          {/* Small screens: links move into a menu. */}
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Open navigation"
            onClick={(e) => setNavAnchor(e.currentTarget)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={navAnchor}
            open={Boolean(navAnchor)}
            onClose={() => setNavAnchor(null)}
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <MenuItem
                key={to}
                component={NavLink}
                to={to}
                onClick={() => setNavAnchor(null)}
                sx={{ '&.active': { color: 'primary.main', fontWeight: 600 } }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {label}
              </MenuItem>
            ))}
          </Menu>

          <Typography variant="h6" component="div" sx={{ mr: 3 }} noWrap>
            {APP_NAME}
          </Typography>

          <Stack
            component="nav"
            direction="row"
            spacing={0.5}
            sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Button
                key={to}
                component={NavLink}
                to={to}
                color="inherit"
                startIcon={<Icon />}
                sx={{
                  opacity: 0.85,
                  '&:hover': { opacity: 1 },
                  '&.active': {
                    opacity: 1,
                    bgcolor: (theme) => alpha(theme.palette.common.white, 0.16),
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

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
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}

export default AppLayout
