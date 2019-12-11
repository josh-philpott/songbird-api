var config = require('./jest.config')

config.testRegex = 'it\\.js$'
console.log('RUNNING INTEGRATION TESTS')

module.exports = config
