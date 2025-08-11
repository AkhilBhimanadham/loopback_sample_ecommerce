'use strict';

module.exports = function(Product) {
  Product.observe('before save', function(ctx, next) {
    // Only allow skipAuthCheck for updates, never for creation
    if (!ctx.isNewInstance && ctx.options && ctx.options.skipAuthCheck) {
      return next();
    }

    const accessToken = ctx.options && ctx.options.accessToken;
    if (!accessToken) {
      const err = new Error('Missing access token');
      err.statusCode = 401;
      return next(err);
    }

    const userId = accessToken.userId;
    const User = Product.app.models.AppUser;

    User.findById(userId, function(err, user) {
      if (err || !user) {
        const error = new Error('User not found');
        error.statusCode = 401;
        return next(error);
      }

      console.log("User Email:", user.email, "Role:", user.role);

      // role === 1 is admin, others blocked
      if (user.role !== 1) {
        const error = new Error('You are not authorized to create or update products');
        error.statusCode = 403;
        return next(error);
      }

      next();
    });
  });
};
