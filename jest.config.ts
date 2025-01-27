import type { Config } from 'jest'

const config: Config = {
  projects: [
    {
      displayName: 'legacy',
      roots: ['<rootDir>/tests'],
      setupFiles: ['<rootDir>/jest.setup.ts'],
      transform: {
        '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: './babel.legacy.cjs' }],
      },
      testMatch: [
        '<rootDir>/tests/**/*.legacy.test.ts',
        '<rootDir>/tests/**/!(*.stage3|*.legacy).test.ts',
      ],
    },
    {
      displayName: 'stage3',
      roots: ['<rootDir>/tests'],
      setupFiles: ['<rootDir>/jest.setup.ts'],
      transform: {
        '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: './babel.stage3.cjs' }],
      },
      testMatch: [
        '<rootDir>/tests/**/*.stage3.test.ts',
        '<rootDir>/tests/**/!(*.stage3|*.legacy).test.ts',
      ],
    },
  ],
}

export default config
