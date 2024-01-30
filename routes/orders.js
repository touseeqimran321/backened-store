const express = require('express');
const router = express.Router();
const Product = require('../models/Model');
// const OrderItem = require('../models/orderitem');
const Order =require('../models/order');
const User = require('../models/user');
const Cart= require('../models/cart');
const CartItem = require('../models/Cartitem');



// Function to calculate total amount based on cart items
const calculateTotalAmount = (cartItems) => {
  return cartItems.reduce((total, cartItem) => {
    return total + cartItem.Product.productPrice * cartItem.quantity;
  }, 0);
};

router.post('/checkout', async (req, res) => {
  const { userId, cartId } = req.body;

  try {
    // Check if userId and cartId are provided
    if (!userId || !cartId) {
      return res.status(400).json({ error: 'Invalid or missing userId or cartId in the request body' });
    }

    // Fetch the cart items associated with the user's cart
    const cartItems = await CartItem.findAll({
      where: { CartId: cartId, status: 'active' }, // Fetch only active cart items
      include: [{ model: Product, attributes: ['productName', 'productPrice', 'productImage', 'quantityInstock'] }],
    });

    // Create a new order with the specified userId and cartId
    const order = await Order.create({ UserId: userId, CartId: cartId });

    // Update order details
    order.totalAmount = calculateTotalAmount(cartItems);
    order.shippingAddress = req.body.shippingAddress;

    // Save the updated order details
    await order.save();

    // Update the status of cart items to 'completed'
    await CartItem.update({ status: 'completed' }, { where: { CartId: cartId, status: 'active' } });

    res.status(201).json({ message: 'Checkout successfully', order, cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
