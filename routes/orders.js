const express = require('express');
const router = express.Router();
const Product = require('../models/Model');
const Order = require('../models/order');
const Cart = require('../models/cart');
const CartItem = require('../models/Cartitem');

router.post('/checkout', async (req, res) => {
  const cartId = 1;

  // Ensure cartId is a valid integer
  if (!Number.isInteger(cartId)) {
    console.log('Invalid or missing cartId in the request body');
    return res.status(400).json({ error: 'Invalid or missing cartId in the request body' });
  }

  const userId = 5;

  try {
    // Check if userId and cartId are provided
    // if (!userId || !cartId) {
    //   console.log('Invalid or missing userId or cartId in the request body');
    //   return res.status(400).json({ error: 'Invalid or missing userId or cartId in the request body' });
    // }

    // Fetch the cart items associated with the user's cart
    const cartItems = await CartItem.findAll({
      where: { CartId: cartId, status: 'active' },
      include: [{ model: Product, attributes: ['productName', 'productPrice', 'productImage', 'quantityInstock'] }],
    });

    // Fetch the cart associated with the cartId
    const cart = await Cart.findByPk(cartId);

    // Log the cart to the console
    console.log('Cart:', cart);

    if (!cart) {
      console.log('Invalid CartId. Cart does not exist.');
      return res.status(400).json({ error: 'Invalid CartId. Cart does not exist.' });
    }

  
    // Create a new order with the specified userId and cartId
    const order = await Order.create({ UserId: userId, CartId: cartId });

    // Update the status of cart items to 'completed'
    await CartItem.update({ status: 'completed' }, { where: { CartId: cartId, status: 'active' } });

    console.log('Checkout successfully:', { order, cartItems, cart });
    res.status(201).json({ message: 'Checkout successfully', order, cartItems, cart });

   

  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
