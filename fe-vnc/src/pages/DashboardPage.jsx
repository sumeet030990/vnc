import { Link as RouterLink } from 'react-router'
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import ChevronRight from '@mui/icons-material/ChevronRight'
import InsightsOutlined from '@mui/icons-material/InsightsOutlined'
import { useAuth } from '../auth/authContext.js'
import { useStatsSummary } from '../api/stats.js'
import { NAV_ITEMS } from '../layouts/navItems.js'

const SECTIONS = NAV_ITEMS.filter((item) => item.to !== '/dashboard')

// Maps each count from /api/stats to its section.
const STAT_KEYS = { '/users': 'users', '/roles': 'roles', '/items': 'items' }

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function WelcomeHeader({ user }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        color: 'primary.contrastText',
        backgroundImage: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.85 }}>
        {new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </Typography>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mt: 0.5 }}>
        {greeting()}, {user?.name}
      </Typography>
      {user?.role?.name && (
        <Chip
          label={user.role.name}
          size="small"
          sx={{
            mt: 1.5,
            color: 'inherit',
            bgcolor: (theme) => alpha(theme.palette.common.white, 0.2),
          }}
        />
      )}
    </Paper>
  )
}

function StatCard({ label, icon: Icon, value, isPending }) {
  return (
    <Card sx={{ height: '100%', '&:hover': { transform: 'none' } }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            <Icon />
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total {label.toLowerCase()}
            </Typography>
            <Typography variant="h5" component="p">
              {isPending ? <Skeleton width={40} /> : (value ?? '—')}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const stats = useStatsSummary()

  return (
    <Stack spacing={4}>
      <Box component="section">
        {stats.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Could not load totals: {stats.error.message}
          </Alert>
        )}
        <Grid container spacing={2}>
          {SECTIONS.map((section) => (
            <Grid key={section.to} size={{ xs: 12, sm: 4 }}>
              <StatCard
                label={section.label}
                icon={section.icon}
                value={stats.data?.[STAT_KEYS[section.to]]}
                isPending={stats.isPending}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}

export default DashboardPage
