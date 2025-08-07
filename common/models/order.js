'use strict';

module.exports = function(Orders) {

  Orders.observe('before save', function(ctx, next) {
    const token = ctx.options && ctx.options.accessToken;

    if (ctx.isNewInstance && token && token.userId) {
      ctx.instance.userId = token.userId; // Set userId from token
    }

    next();
  });

  Orders.createOrder = async function(orderData, options) {
const token = options && options.accessToken;
  if (!token || !token.userId) {
    throw new Error('User must be authenticated');
  }

  // Pass `options` so accessToken reaches before save hook
  const order = await Orders.create({ totalAmount: 0 }, options);
      const OrderItem = Orders.app.models.orderItem;
    let sum = 0;

    if (orderData.items && orderData.items.length > 0) {
      for (const item of orderData.items) {
        let prod = await Orders.app.models.Product.findById(item.productId);
        if (!prod) {
          throw new Error(`Product with id ${item.productId} not found`);
        }
        if (item.quantity <= 0) {
          throw new Error(`Quantity for product ${item.productId} must be greater than zero`);
        }
        if (item.quantity > prod.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        sum += prod.price * item.quantity;
        prod.quantity -= item.quantity;
        await prod.save();

        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity
        });
      }
    }

    order.totalAmount = sum;
  
    await order.save();
    return order;
  };

  Orders.remoteMethod('createOrder', {
    http: { verb: 'post', path: '/createOrder' },
    accepts: { arg: 'orderData', type: 'object', http: { source: 'body' } },
    returns: { arg: 'order', type: 'object', root: true }
  });

};