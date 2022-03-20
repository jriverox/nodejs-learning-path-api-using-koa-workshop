const Joi = require('joi');

const byIndexSchema = Joi.object().keys({
  index: Joi.number().min(1).required(),
});

const postSchema = Joi.object().keys({
  dateOfBirth: Joi.date().iso().required(),
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  username: Joi.string().min(3).required(),
  company: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string().min(5).required(),
    city: Joi.string().min(5).required(),
    state: Joi.string().min(5).required(),
  }),
  jobPosition: Joi.string().optional(),
  roles: Joi.array().items(Joi.string()).optional(),
  active: Joi.bool().default(true).optional(),
});

module.exports = {
  byIndexSchema,
  postSchema,
};