'use strict';

module.exports = function (app) {
  app.on('booted', () => {
    const defaultAllowed = [
      'create',
      'find',
      'findById',
      'prototype.patchAttributes',
      'deleteById'
    ];

    const customAllowed = {
      order: ['placeOrder', 'getOrderItems'],
      AppUser: ['login']

    };

    app.models().forEach(Model => {
      const modelName = Model.modelName;
      const allowedMethods = defaultAllowed.concat(customAllowed[modelName] || []);

      Model.sharedClass.methods().forEach(method => {
        const methodName = method.isStatic ? method.name : `prototype.${method.name}`;

        if (!allowedMethods.includes(methodName) && !allowedMethods.includes(method.name)) {
          try {
            Model.disableRemoteMethodByName(methodName);
          } catch (err) {
            console.warn(`Failed to disable ${methodName} on ${modelName}:`, err.message);
          }
        }
      });
    });

    console.log('✅ Custom endpoint restrictions applied after boot');
  });
};
