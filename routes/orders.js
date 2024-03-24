const express = require('express');
const router = express.Router();
const Product = require('../models/Model');
const Order = require('../models/order');
const Cart = require('../models/cart');
const CartItem = require('../models/Cartitem');

router.post('/checkout', async (req, res) => {
  const { userId, shippingInfo, paymentInfo } = req.body;

  try {
    const cart = await Cart.findOne({ where: { UserId: userId } });

    if (!cart) {
      console.log('Cart not found for the specified user');
      return res.status(404).json({ error: 'Cart not found for the specified user' });
    }

    if (cart.status === 'completed') {
      console.log('Cart has already been checked out.');
      return res.status(400).json({ error: 'Cart has already been checked out.' });
    }

    const cartItems = await CartItem.findAll({ where: { CartId: cart.id } });
    const order = await Order.create({ UserId: userId, CartId: cart.id, shippingInfo, paymentInfo });

    await Promise.all(cartItems.map(async (item) => {
      await CartItem.update({ status: 'completed', OrderId: order.id }, { where: { id: item.id } });
    }));

    await Cart.update({ status: 'completed' }, { where: { id: cart.id } });

    console.log('Checkout successfully:', { order, cartItems, cart });
    res.status(201).json({ message: 'Checkout successfully', order, cartItems, cart });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/history/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find completed orders for the user
    const orders = await Order.findAll({
      where: { UserId: userId, status: 'completed' }
    });

    // Fetch associated details for each order
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      // Fetch associated cart details
      const cart = await Cart.findOne({ where: { id: order.CartId } });

      // Fetch associated cart items
      const cartItems = await CartItem.findAll({ where: { CartId: cart.id } });

      // Fetch associated product details for each cart item
      const cartItemsWithProductDetails = await Promise.all(cartItems.map(async (cartItem) => {
        const product = await Product.findByPk(cartItem.ProductId, { attributes: ['productName', 'productPrice', 'productImage'] });
        return {
          ...cartItem.toJSON(),
          Product: product.toJSON()
        };
      }));

      return {
        ...order.toJSON(),
        Cart: cart.toJSON(),
        CartItems: cartItemsWithProductDetails
      };
    }));

    console.log('Fetched orders:', ordersWithDetails);

    res.status(200).json({ message: 'Order history retrieved successfully', orders: ordersWithDetails });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





module.exports = router;
