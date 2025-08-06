
// eslint-disable-next-line strict
module.exports = function(app) {
  const ds = app.dataSources.db; // must match name in datasources.json

  ds.automigrate(['ACL', 'AccessToken', 'Role', 'RoleMapping', 'User', 'Product', 'orderItem', 'order'], function(err) {
    if (err) throw err;
    console.log('✅ Built-in LoopBack tables created in PostgreSQL.');
  });
  if (!ds) {
    throw new Error('Data source "postgres" not found.');
  }
};
