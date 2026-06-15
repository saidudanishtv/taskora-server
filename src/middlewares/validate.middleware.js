import { BadRequestError } from '../utils/errors.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      return next(new BadRequestError('Validation failed', result.error.flatten()));
    }

    req.validated = result.data;
    return next();
  };
};

