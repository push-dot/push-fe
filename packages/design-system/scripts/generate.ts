import { writeFileSync } from 'node:fs'
import { outputs, sourceUrl } from './sources.ts'

for (const [path, content] of Object.entries(outputs())) writeFileSync(sourceUrl(path), content)
