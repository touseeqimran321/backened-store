// routes/cart.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Model');
const CartItem = require('../models/Cartitem');
const Cart = require('../models/cart');
const Order =require('../models/order');
// const OrderItem = require('../models/orderitem')

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add items to the user's cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Items added to the cart successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cartItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       Product:
 *                         type: object
 *                         properties:
 *                           productName:
 *                             type: string
 *                           productPrice:
 *                             type: number
 *                           productImage:
 *                             type: string
 *       400:
 *         description: Bad Request. Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 
 */


router.post('/add', async (req, res) => {
  const { userId, items } = req.body;

  // Check if userId is defined
  if (userId === undefined) {
    return res.status(400).json({ error: 'UserId is missing or undefined in the request body' });
  }

  try {
    // Find or create the cart for the user
    const [cart, created] = await Cart.findOrCreate({
      where: { UserId: userId },
    });

    // Check if items is an array
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid or missing items array in the request body' });
    }

    for (const item of items) {
      const { productId, quantity } = item;

      // Check if the product exists
      const product = await Product.findByPk(productId);

      if (!product) {
        return res.status(404).json({ error: `Product with ID ${productId} not found` });
      }

      // Check if there is enough quantity in stock
      if (product.quantityInstock < quantity) {
        return res.status(400).json({ error: `Not enough quantity in stock for product with ID ${productId}` });
      }

      // Find or create the cart item
      let cartItem = await CartItem.findOne({
        where: { CartId: cart.id, ProductId: productId },
      });

      if (!cartItem) {
        // If the cart item doesn't exist, create a new one
        cartItem = await CartItem.create({
          CartId: cart.id,
          ProductId: productId,
          quantity,
        });

        // Update the product quantity in stock
        product.quantityInstock -= quantity;
        await product.save();
      } else {
        // If the cart item already exists, update the quantity
        cartItem.quantity += quantity;
        await cartItem.save();

        // Update the product quantity in stock
        product.quantityInstock -= quantity;
        await product.save();
      }
    }

    // Fetch the cart items associated with the user's cart
    const cartItems = await CartItem.findAll({
      where: { CartId: cart.id },
      include: [{ model: Product, attributes: ['productName', 'productPrice', 'productImage', 'quantityInstock'] }],
    });

    res.status(201).json({ message: 'Items added to cart successfully', cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * @swagger
 * /api/cart/remove/{cartitemId}:
 *   delete:
 *     summary: Delete the cartitem
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartitemId
 *         type: integer
 *         required: true
 *         description: ID of the cartitem.
 *     responses:
 *       200:
 *         description: Cart items Deleted Sucessfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                
 *       400:
 *         description: Bad Request. Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


// Remove a cart item
router.delete('/remove/:cartItemId', async (req, res) => {
  try {
    const cartItemId = req.params.cartItemId;

    // Find the cart item by ID
    const cartItem = await CartItem.findByPk(cartItemId);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Get the associated product and update its quantity in stock
    const product = await Product.findByPk(cartItem.ProductId);
    if (product) {
      product.quantityInstock += cartItem.quantity;
      await product.save();
    }

    // Delete the cart item
    await cartItem.destroy();

    res.json({ message: 'Cart item removed successfully' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});








/**
 * @swagger
 * /api/cart/get:
 *   get:
 *     summary: Get items in the user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: integer
 *         required: true
 *         description: ID of the user.
 *     responses:
 *       200:
 *         description: Cart items retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cartItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       Product:
 *                         type: object
 *                         properties:
 *                           productName:
 *                             type: string
 *                           productPrice:
 *                             type: number
 *                           productImage:
 *                             type: string
 *       400:
 *         description: Bad Request. Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/get', async (req, res) => {
  const userId = req.query.userId;

  // Check if userId is defined
  if (!userId) {
    return res.status(400).json({ error: 'UserId is missing or undefined in the request query parameters' });
  }

  try {
    // Find the cart for the user
    const cart = await Cart.findOne({
      where: { UserId: userId },
    });

    // Check if the cart exists
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found for the specified user' });
    }

    // Fetch the cart items associated with the user's cart
    const cartItems = await CartItem.findAll({
      where: { CartId: cart.id },
      include: [{ model: Product, attributes: [ 'productName', 'productPrice', 'productImage'] }],
    });

    res.status(200).json({ message: 'Cart items retrieved successfully', cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// /**
//  * @swagger
//  * api/cart/checkout:
//  *   post:
//  *     summary: Process checkout for a user's cart
//  *     description: Move items from the user's cart to a new order
//  *     tags:
//  *       - Checkout
//  *     parameters:
//  *       - in: body
//  *         name: checkout
//  *         description: The checkout information
//  *         required: true
//  *         schema:
//  *           type: object
//  *           properties:
//  *             userId:
//  *               type: integer
//  *               description: The ID of the user whose cart is being checked out
//  *     responses:
//  *       '200':
//  *         description: Checkout successful
//  *         content:
//  *           application/json:
//  *             example:
//  *               message: Checkout successful
//  *             
//  */


// router.post('/checkout', async (req, res) => {
//   const { userId } = req.body;

//   // Check if userId is provided
//   if (!userId) {
//     return res.status(400).json({ error: 'UserId is missing in the request body' });
//   }

//   try {
//     // Find the user's cart
//     const cart = await Cart.findOne({
//       where: { UserId: userId },
//       include: [{ model: CartItem, include: [{ model: Product }] }],
//     });

//     if (!cart) {
//       return res.status(404).json({ error: 'Cart not found for the user' });
//     }

//     // Create a new order for the user
//     const order = await Order.create({ UserId: userId });

//     // Move items from the cart to the order
//     for (const cartItem of cart.CartItems) {
//       const { ProductId, quantity } = cartItem;

//       // Check if there is enough quantity in stock
//       const product = await Product.findByPk(ProductId);

//       if (!product || product.quantityInstock < quantity) {
//         return res.status(400).json({ error: `Not enough quantity in stock for product with ID ${ProductId}` });
//       }

//       // Create an order item
//       await OrderItem.create({
//         OrderId: order.id,
//         ProductId,
//         quantity,
//       });

//       // Update the product quantity in stock
//       product.quantityInstock -= quantity;
//       await product.save();
//     }

//     // Clear the user's cart after successful checkout
//     await CartItem.destroy({ where: { CartId: cart.id } });

//     res.status(200).json({ message: 'Checkout successful', order });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }

// });


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


module.exports = router;
