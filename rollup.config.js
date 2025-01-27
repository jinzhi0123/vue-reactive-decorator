import fs from 'node:fs/promises'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

const PACKAGE_NAME = 'vue-reactive-reactive'

// 生成 CJS 入口文件的函数
async function generateCJSEntry() {
  const template = await fs.readFile('./scripts/cjs-entry-template.js', 'utf-8')
  await fs.mkdir('./dist', { recursive: true })
  await fs.writeFile('./dist/index.js', template)
}

function createConfig(isProduction) {
  return {
    input: './src/index.ts',
    external: ['@vue/reactivity'],
    plugins: [
      replace({
        'preventAssignment': true,
        '__DEV__': !isProduction,
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
      }),
      isProduction && terser(),
    ].filter(Boolean),
    output: [
      {
        format: 'cjs',
        file: `./dist/${PACKAGE_NAME}${isProduction ? '.production' : '.development'}.cjs`,
        sourcemap: true,
      },
      {
        format: 'esm',
        file: `./dist/${PACKAGE_NAME}${isProduction ? '.production' : '.development'}.mjs`,
        sourcemap: true,
      },
    ],
  }
}

// Types bundle configuration
const dtsConfig = {
  input: './src/index.ts',
  external: ['@vue/reactivity'],
  plugins: [
    dts({
      compilerOptions: {
        preserveSymlinks: false,
      },
    }),
  ],
  output: {
    format: 'esm',
    file: `./dist/${PACKAGE_NAME}.d.ts`,
  },
}

generateCJSEntry().catch(console.error)

export default [
  createConfig(false), // Development build
  createConfig(true), // Production build
  dtsConfig, // Types
]
