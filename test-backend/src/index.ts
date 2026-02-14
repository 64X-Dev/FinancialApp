import { app } from './app'
import { config } from './config'

const port = Number(process.env.PORT ?? config.port)

const server = app.listen(port, () => {
  console.log('')
  console.log(`  ➜  backend-test: \x1b[36mhttp://localhost:${port}\x1b[0m`)
  console.log('')
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[test-backend] Port ${port} is already in use`)
  } else {
    console.error('[test-backend] Failed to start server', error)
  }

  process.exit(1)
})
