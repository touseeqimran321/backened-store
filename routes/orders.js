const express = require('express');
const router = express.Router();
const Product = require('../models/Model');
// const OrderItem = require('../models/orderitem');
const Order =require('../models/order');
const User = require('../models/user')
const Cart= require('../models/cart')
const CartItem = require('../models/Cartitem')




router.post('/checkout', async (req, res) => {
  const { userId, cartId } = req.body;

  try {
    // Check if userId and cartId are provided
    if (!userId || !cartId) {
      return res.status(400).json({ error: 'Invalid or missing userId or cartId in the request body' });
    }

    // Create a new order with the specified userId and cartId
    const order = await Order.create({ UserId: userId, CartId: cartId });

    // Fetch the cart items associated with the user's cart
    const cartItems = await CartItem.findAll({
      where: { CartId: cartId },
      include: [{ model: Product, attributes: ['productName', 'productPrice', 'productImage', 'quantityInstock'] }],
    });

    // Delete cart items associated with the completed order
    await CartItem.destroy({
      where: { CartId: cartId },
    });

    res.status(201).json({ message: 'Checkout Sucessfully', order, cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});







module.exports = router