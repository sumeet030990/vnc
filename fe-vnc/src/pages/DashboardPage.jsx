import { Link as RouterLink } from 'react-router'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { useAuth } from '../auth/useAuth.js'
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

// Soft gold tile behind icons: gold stays a small accent.
const iconTileSx = {
  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.14),
  color: 'secondary.dark',
}

function WelcomeHeader({ user }) {
  return (
    <Box component="header">
      <Typography variant="overline" color="text.secondary">
        {new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </Typography>
      <Stack
        direction="row"
        spacing={1.5}
        useFlexGap
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {greeting()}, {user?.name}
        </Typography>
        {user?.role?.name && (
          <Chip label={user.role.name} size="small" variant="outlined" />
        )}
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Here's an overview of your workspace.
      </Typography>
    </Box>
  )
}

function StatCard({ label, icon: Icon, value, isPending }) {
  return (
    // Not clickable, so no hover lift.
    <Card sx={{ height: '100%', '&:hover': { transform: 'none' } }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Typography variant="body2" color="text.secondary">
            Total {label.toLowerCase()}
          </Typography>
          <Avatar
            variant="rounded"
            sx={{ ...iconTileSx, width: 36, height: 36 }}
          >
            <Icon fontSize="small" />
          </Avatar>
        </Stack>
        <Typography
          variant="h3"
          component="p"
          sx={{ fontWeight: 600, mt: 1, letterSpacing: '-0.02em' }}
        >
          {isPending ? <Skeleton width={64} /> : (value ?? '—')}
        </Typography>
      </CardContent>
    </Card>
  )
}

function QuickLinkCard({ to, label, icon: Icon, description }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea component={RouterLink} to={to} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar variant="rounded" sx={iconTileSx}>
              <Icon />
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" component="h3">
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
            <ChevronRight sx={{ color: 'text.secondary' }} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const stats = useStatsSummary()

  return (
    <Stack spacing={5}>
      <WelcomeHeader user={user} />

      <Box component="section" aria-label="Totals">
        {stats.isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => stats.refetch()}
              >
                Try again
              </Button>
            }
          >
            We couldn't load your totals right now.
          </Alert>
        )}
        <Grid container spacing={3}>
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

      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Quick links
        </Typography>
        <Grid container spacing={3}>
          {SECTIONS.map((section) => (
            <Grid key={section.to} size={{ xs: 12, md: 4 }}>
              <QuickLinkCard {...section} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}

export default DashboardPage
