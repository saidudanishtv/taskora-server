import { ForbiddenError } from '../utils/errors.js';

export const requireWorkspaceRole = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.workspaceRole;

    if (!role || !allowedRoles.includes(role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    return next();
  };
};

