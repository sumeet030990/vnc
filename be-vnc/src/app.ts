import path from 'path'
import express from 'express'
import cors from 'cors'
import healthRouter from './routes/healthRoutes'
import authRouter from './routes/authRoutes'
import statsRouter from './routes/statsRoutes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/stats', statsRouter)

// Set by the desktop app so one server hosts both the API and the built UI.
if (process.env.FRONTEND_DIR) {
  const frontendDir = process.env.FRONTEND_DIR
  app.use(express.static(frontendDir))

  // Page URLs like /dashboard are handled by the UI, so serve index.html for them.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(path.join(frontendDir, 'index.html'))
  })
}

export default app
