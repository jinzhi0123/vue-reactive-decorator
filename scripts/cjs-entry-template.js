'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./vue-reactive-decorator.production.cjs')
}
else {
  module.exports = require('./vue-reactive-decorator.development.cjs')
}
