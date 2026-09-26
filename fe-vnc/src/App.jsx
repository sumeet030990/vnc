import { useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import LoginPage from './pages/LoginPage.jsx'

function App() {
  const [user, setUser] = useState(null)

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  // Placeholder until the next page is built.
  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h5" component="h1">
          Welcome, {user.name}
        </Typography>
        <Button variant="outlined" onClick={() => setUser(null)}>
          Log out
        </Button>
      </Stack>
    </Box>
  )
}

export default App
