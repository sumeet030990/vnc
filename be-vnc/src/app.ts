import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health'
import authRouter from './routes/auth'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)

// Set by the desktop app so one server hosts both the API and the built UI.
if (process.env.FRONTEND_DIR) {
  app.use(express.static(process.env.FRONTEND_DIR))
}

export default app
