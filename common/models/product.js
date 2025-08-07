'use strict';

module.exports = function(Product) {
  Product.observe('before save', function(ctx, next) {
    const accessToken = ctx.options && ctx.options.accessToken;

    if (!accessToken) {
      const err = new Error('Missing access token');
      err.statusCode = 401;
      return next(err);
    }

    const userId = accessToken.userId;

    // Load the User model
    const User = Product.app.models.User;

    User.findById(userId, function(err, user) {
      if (err || !user) {
        const err = new Error('User not found');
        err.statusCode = 401;
        return next(err);
      }

      console.log("User Email:", user.email, "Role:", user.role);

      if (user.role !== 1) {
        const err = new Error('You are not authorized to create or update products');
        err.statusCode = 403;
        return next(err);
      }

      // User is authorized
      next();
    });
  });
};
