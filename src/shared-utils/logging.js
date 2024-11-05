const winston = require('winston')

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
}

const logger = winston.createLogger({
  levels: logLevels,
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log', level: 'error'  }),
  ],
})

module.exports = logger
