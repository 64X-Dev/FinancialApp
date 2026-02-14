import cors from 'cors'
import express from 'express'
import { config } from './config'
import { errorHandler, notFoundHandler, sendSuccess, ApiError } from './middleware/error'
import { createApiRouter } from './routes/api'
import { createMemoryStore } from './store/memoryStore'
import { AppRepository } from './types'

interface CreateAppOptions {
  allowedOrigins: string[]
  repository?: AppRepository
}

function formatLogTime(date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function formatRequestLogLine(url: string, statusCode: number): string {
  return `[i] ${formatLogTime()} [backend-test] : ${url} ${statusCode}`
}

function createCorsOptions(allowedOrigins: string[]): cors.CorsOptions {
  return {
    origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new ApiError(403, 'CORS_ORIGIN_DENIED', `Origin '${origin}' is not allowed`))
    },
  }
}

export function createApp(options: CreateAppOptions) {
  const app = express()
  const repository = options.repository ?? createMemoryStore()

  app.disable('x-powered-by')

  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log(formatRequestLogLine(req.originalUrl, res.statusCode))
    })

    next()
  })
  app.use(cors(createCorsOptions(options.allowedOrigins)))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    return sendSuccess(res, {
      status: 'up',
      service: 'test-backend',
      timestamp: new Date().toISOString(),
    })
  })

  app.use('/api/v1', createApiRouter(repository))

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

export const app = createApp({ allowedOrigins: config.allowedOrigins })
