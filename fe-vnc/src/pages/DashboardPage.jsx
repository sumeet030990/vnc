import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import TodayOutlined from '@mui/icons-material/TodayOutlined'
import CalendarViewWeekOutlined from '@mui/icons-material/CalendarViewWeekOutlined'
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined'
import { useAuth } from '../auth/useAuth.js'
import { useStatsSummary } from '../api/stats.js'

// Each card reads its profit value from /api/stats by `key`.
const PROFIT_STATS = [
  { key: 'todayProfit', label: 'Today', icon: TodayOutlined },
  { key: 'weeklyProfit', label: 'This week', icon: CalendarViewWeekOutlined },
  { key: 'monthlyProfit', label: 'This month', icon: CalendarMonthOutlined },
  { key: 'yearlyProfit', label: 'This year', icon: TrendingUpOutlined },
]

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const formatProfit = (value) =>
  typeof value === 'number' ? currency.format(value) : '—'

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
            {label} profit
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
          {isPending ? <Skeleton width={120} /> : formatProfit(value)}
        </Typography>
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const stats = useStatsSummary()

  return (
    <Stack spacing={5}>
      <WelcomeHeader user={user} />

      <Box component="section" aria-label="Profit">
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
            We couldn't load your profit right now.
          </Alert>
        )}
        <Grid container spacing={3}>
          {PROFIT_STATS.map((stat) => (
            <Grid key={stat.key} size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label={stat.label}
                icon={stat.icon}
                value={stats.data?.[stat.key]}
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
