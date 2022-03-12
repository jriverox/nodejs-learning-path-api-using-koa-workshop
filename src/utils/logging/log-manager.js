const winston = require('winston');
const yenv = require('yenv');

const env = yenv()

module.exports = class LogManager {
  constructor() {
    const transports = []
    if (env.LOGGER.TARGETS.FILE.ENABLED) {
      transports.push(
        new winston.transports.File({ level: env.LOGGER.TARGETS.FILE.LEVEL, filename: env.LOGGER.TARGETS.FILE.PATH }),
      )
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports,
    })

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      )
    }
  }

  info(info) {
    this.logger.info(info)
  }

  error(appError) {
    const isOperational = appError.isOperational || false
    this.logger.error(appError)
    return isOperational
  }
}
