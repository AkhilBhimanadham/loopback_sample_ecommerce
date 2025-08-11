'use strict';

module.exports = function(Order) {
  Order.placeOrder = async function(items, options) {
    const app = Order.app;
    const Product = app.models.Product;
    const OrderItem = app.models.OrderItem;

    if (!options || !options.accessToken) {
      const err = new Error('You must be logged in to place an order.');
      err.statusCode = 401;
      throw err;
    }

    const userId = options.accessToken.userId;
    let totalAmount = 0;
    const productData = [];

    // 1️⃣ Validate all products first
    for (let item of items) {
      const product = await Product.findById(item.productId, {
        accessToken: options.accessToken
      });

      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.quantity < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      productData.push({ product, quantity: item.quantity });
      totalAmount += product.price * item.quantity;
    }

    // 2️⃣ Create order only after all validations pass
    const order = await Order.create(
      { userId, totalAmount },
      { accessToken: options.accessToken }
    );

    // 3️⃣ Create order items and update stock
    for (let { product, quantity } of productData) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: product.id,
          quantity
        },
        { accessToken: options.accessToken }
      );

      await product.updateAttribute(
        'quantity',
        product.quantity - quantity,
        { skipAuthCheck: true }
      );
    }

    return order;
  };

  Order.remoteMethod('placeOrder', {
    http: { path: '/place-order', verb: 'post' },
    accepts: [
      { arg: 'items', type: 'array', required: true, http: { source: 'body' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' }
    ],
    returns: { arg: 'order', type: 'object', root: true }
  });

  // Restrict customer queries to their own orders
  Order.observe('access', async function limitToOwner(ctx) {
    if (!ctx.options || !ctx.options.accessToken || !ctx.options.accessToken.userId) {
      return;
    }

    const userId = ctx.options.accessToken.userId;
    const AppUser = Order.app.models.AppUser;
    const user = await AppUser.findById(userId);

    if (user && user.role === 1) {
      return; // Admin can see all orders
    }

    ctx.query = ctx.query || {};
    ctx.query.where = ctx.query.where || {};
    ctx.query.where.userId = userId;
  });
};
