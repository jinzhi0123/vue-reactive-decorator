module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
  plugins: [
    // 'babel-plugin-dev-expression',
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
    '@babel/plugin-transform-class-properties',
  ],
}
