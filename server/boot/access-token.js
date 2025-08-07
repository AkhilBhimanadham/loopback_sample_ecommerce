module.exports = function(app) {
  const User = app.models.User;
  const AccessToken = app.models.AccessToken;

  AccessToken.observe('access', function(ctx, next) {
    if (!ctx.accessToken) return next();

    User.findById(ctx.accessToken.userId, function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('No user found for access token'));

      ctx.accessToken.user = user; // Attach the full user including role
      console.log("user role",user.role)
      next();
    });
  });
};
