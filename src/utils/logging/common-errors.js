module.exports = {
  InvalidInput: {
    name: 'InvalidInput',
    httpStatus: 422,
  },
  Unauthorized: {
    name: 'Unauthorized',
    httpStatus: 401,
  },
  NotFound: {
    name: 'NotFound',
    httpStatus: 404,
  },
  OperationNotAllowed: {
    name: 'OperationNotAllowed',
    httpStatus: 405,
  },
  DuplicateItem: {
    name: 'DuplicateItem',
    httpStatus: 409,
  },
  Conflict: {
    name: 'Conflict',
    httpStatus: 409,
  },
  BadFormat: {
    name: 'BadFormat',
    httpStatus: 400,
  },
  UnknownError: {
    name: 'UnknownError',
    httpStatus: 500,
  },
}
