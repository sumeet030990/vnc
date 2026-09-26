import { Link as RouterLink } from 'react-router'
import { Button, Paper, Stack, Typography } from '@mui/material'
import ConstructionOutlined from '@mui/icons-material/ConstructionOutlined'

// Stand-in for sections linked from the menu that aren't built yet.
function ComingSoonPage({ title }) {
  return (
    <Paper
      sx={{ p: { xs: 4, md: 6 }, borderRadius: '12px', textAlign: 'center' }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <ConstructionOutlined color="primary" sx={{ fontSize: 48 }} />
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        <Typography color="text.secondary">This page is on its way.</Typography>
        <Button component={RouterLink} to="/dashboard" variant="outlined">
          Back to dashboard
        </Button>
      </Stack>
    </Paper>
  )
}

export default ComingSoonPage
