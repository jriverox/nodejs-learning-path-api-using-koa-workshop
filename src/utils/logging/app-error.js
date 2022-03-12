/**
 * Implementación de nuestra propia clase de error
 */
 module.exports = class AppError extends Error {
  constructor(message, httpStatus = 500, name = 'UnknownError', isOperational = false, innerException = null) {
    super(message)
    Error.captureStackTrace(this, AppError)
    this.message = message
    this.name = name
    this.status = httpStatus
    this.date = new Date()
    this.isOperational = isOperational
    this.innerException = innerException
    this.expose = isOperational
  }
}