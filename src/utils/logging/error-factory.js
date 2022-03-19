const AppError = require('./app-error');
const commonErrors = require('./common-errors');

module.exports = {
  InvalidInputError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.InvalidInput.httpStatus,
      commonErrors.InvalidInput.name,
      true,
      innerException,
    ),
  UnauthorizedError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.Unauthorized.httpStatus,
      commonErrors.Unauthorized.name,
      true,
      innerException,
    ),
  OperationNotAllowedError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.OperationNotAllowed.httpStatus,
      commonErrors.OperationNotAllowed.name,
      true,
      innerException,
    ),
  NotFoundError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.NotFound.httpStatus,
      commonErrors.NotFound.name,
      true,
      innerException,
    ),
  DuplicateItemError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.DuplicateItem.httpStatus,
      commonErrors.DuplicateItem.name,
      true,
      innerException,
    ),
  ConflictError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.Conflict.httpStatus,
      commonErrors.Conflict.name,
      true,
      innerException,
    ),
  BadFormatError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.BadFormat.httpStatus,
      commonErrors.BadFormat.name,
      true,
      innerException,
    ),
  UnknownError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.UnknownError.httpStatus,
      commonErrors.UnknownError.name,
      false,
      innerException,
    ),
};