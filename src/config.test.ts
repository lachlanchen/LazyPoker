import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { appPort } from './config/runtime'
import packageDocument from '../package.json'

describe('documented runtime endpoint', () => {
  it('pins scripts, Vite and README to loopback port 8020', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8')
    const smoke = readFileSync(join(process.cwd(), 'docs/smoke-test.md'), 'utf8')
    const viteConfig = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf8')
    const workflow = readFileSync(join(process.cwd(), '.github/workflows/ci.yml'), 'utf8')
    expect(appPort).toBe(8020)
    expect(packageDocument.scripts.dev).toContain('--port 8020 --strictPort')
    expect(packageDocument.scripts.preview).toContain('--port 8020 --strictPort')
    expect(viteConfig).toMatch(/server:\s*\{[^}]*port:\s*appPort[^}]*strictPort:\s*true/)
    expect(viteConfig).toMatch(/preview:\s*\{[^}]*port:\s*appPort[^}]*strictPort:\s*true/)
    expect(readme).toContain('http://127.0.0.1:8020/')
    expect(smoke).toContain('http://127.0.0.1:8020/')
    expect(workflow).toContain('actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683')
    expect(workflow).toContain('actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020')
    expect(workflow).not.toMatch(/uses:\s+actions\/(?:checkout|setup-node)@v\d/)
  })
})
