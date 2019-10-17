const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, colorize, prettyPrint, printf } = format

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const logger = createLogger({
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    colorize(),
    prettyPrint(),
    myFormat
  ),
  transports: [new transports.Console()]
})

module.exports = logger
