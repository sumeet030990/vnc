import { Avatar, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Shown inside the table when there are no rows.
function TableEmptyState({ icon, title, message, action }) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', py: 9, px: 2 }}>
      <Avatar
        variant="rounded"
        sx={{
          width: 52,
          height: 52,
          bgcolor: (t) => alpha(t.palette.secondary.main, 0.14),
          color: 'secondary.dark',
        }}
      >
        {icon}
      </Avatar>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      {action}
    </Stack>
  )
}

export default TableEmptyState
