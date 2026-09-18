import { env } from '@/config/env'
import { logger } from '@/lib/logger'
import { createApp } from './app.js'

const app = createApp()

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Kinraidee API listening')
})
