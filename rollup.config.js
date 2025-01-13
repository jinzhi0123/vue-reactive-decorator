import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

export default [{
  input: './src/index.ts',
  external: ['vue', 'vue-demi'],
  plugins: [
    replace({
      preventAssignment: true,
      __DEV__: 'process.env.NODE_ENV !== "production"',
    }),
    typescript(),
    // babel({
    //   babelHelpers: 'bundled',
    // }),
  ],
  output: [
    {
      format: 'cjs',
      file: './dist/index.cjs',

    },
    {
      format: 'esm',
      file: './dist/index.mjs',
    },
  ],
}, {
  input: './src/index.ts',
  external: ['vue', 'vue-demi'],
  plugins: [
    dts({
      compilerOptions: {
        preserveSymlinks: false,
      },
    },
    ),
  ],
  output: {
    format: 'esm',
    file: 'dist/index.d.ts',
  },
}]
