import { env } from '@/config/env'
import { logger } from '@/lib/logger'
import { createApp } from './app.js'

const app = createApp()

app.listen(env.PORT, (error) => {
  // Express 5 reports startup failures here, such as a port another process already uses.
  // Rethrowing stops the process with the cause instead of claiming the API is listening.
  if (error) throw error
  logger.info({ port: env.PORT }, 'Kinraidee API listening')
})
