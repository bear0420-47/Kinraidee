import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { registry } from './registry.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.resolve(
  dirname,
  '../../../../docs/03-implementation/openapi.json',
)

const generator = new OpenApiGeneratorV3(registry.definitions)
const document = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Kinraidee API',
    version: '0.1.0',
  },
})

await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`)
