module.exports = function(app) {
  const Role = app.models.Role;
  const AppUser = app.models.AppUser;

  // Admin role
  // Admin role
Role.registerResolver('admin', async function(role, context) {
  if (!context.accessToken || !context.accessToken.userId) return false;
  const user = await AppUser.findById(context.accessToken.userId);
  return !!(user && user.role === 1);
});

// Customer role
Role.registerResolver('customer', async function(role, context) {
  if (!context.accessToken || !context.accessToken.userId) return false;
  const user = await AppUser.findById(context.accessToken.userId);
  return !!(user && user.role === 0);
});

};
