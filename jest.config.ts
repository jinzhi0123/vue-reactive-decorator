import type { Config } from 'jest'

const config: Config = {
  roots: ['<rootDir>/tests'],
  setupFiles: [`<rootDir>/jest.setup.ts`],
}

export default config
