import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { useHealth } from './api/health.js'

function ConnectionStatus({ isPending, isError }) {
  if (isPending) {
    return (
      <Chip
        icon={<CircularProgress size={14} />}
        label="Checking…"
        variant="outlined"
      />
    )
  }
  if (isError) {
    return <Chip color="error" label="Disconnected" />
  }
  return <Chip color="success" label="Connected" />
}

function App() {
  const { data, error, isPending, isError, isFetching, refetch } = useHealth()

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h5" component="h1">
                Backend status
              </Typography>
              <ConnectionStatus isPending={isPending} isError={isError} />
            </Stack>

            {isError && (
              <Alert severity="error">
                Could not reach the backend: {error.message}
              </Alert>
            )}

            {data && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  GET /api/health response
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'grey.100',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(data, null, 2)}
                </Box>
              </Box>
            )}

            <Box>
              <Button
                variant="contained"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? 'Checking…' : 'Check again'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}

export default App
