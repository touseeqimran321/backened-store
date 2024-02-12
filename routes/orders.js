const express = require('express');
const router = express.Router();
const Product = require('../models/Model');
const Order = require('../models/order');
const Cart = require('../models/cart');
const CartItem = require('../models/Cartitem');

router.post('/checkout', async (req, res) => {
  const cartId = 1; // Assuming you get cartId from the request or another source
  const userId = 5; // Assuming you get userId from the request or another source
  const { shippingInfo, paymentInfo } = req.body;

  // Ensure cartId is a valid integer
  if (!Number.isInteger(cartId)) {
    console.log('Invalid or missing cartId in the request body');
    return res.status(400).json({ error: 'Invalid or missing cartId in the request body' });
  }

  try {
    // Fetch the cart associated with the cartId
    const cart = await Cart.findByPk(cartId);

    // Check if cart exists
    if (!cart) {
      console.log('Invalid CartId. Cart does not exist.');
      return res.status(400).json({ error: 'Invalid CartId. Cart does not exist.' });
    }

    // Check if the cart has already been completed
    if (cart.status === 'completed') {
      console.log('Cart has already been checked out.');
      return res.status(400).json({ error: 'Cart has already been checked out.' });
    }

    // Fetch the cart items associated with the user's cart
    const cartItems = await CartItem.findAll({
      where: { CartId: cartId, status: 'active' },
      include: [{ model: Product, attributes: ['productName', 'productPrice', 'productImage', 'quantityInStock'] }],
    });

    // Create a new order with the specified userId and cartId
    const order = await Order.create({ UserId: userId, CartId: cartId, shippingInfo, paymentInfo });

    // Delete cart items from the database
    
    await CartItem.update({ status: 'completed' }, { where: { CartId: cartId, status: 'active' } });
    await CartItem.destroy({ where: { CartId: cartId, status: 'completed' } });
    // Update the cart status to 'completed'
    await Cart.update({ status: 'completed' }, { where: { id: cartId, } });

    console.log('Checkout successfully:', { order, cartItems, cart });
    res.status(201).json({ message: 'Checkout successfully', order, cartItems, cart });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
