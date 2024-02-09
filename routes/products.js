const express = require('express');
const router = express.Router();
const  Product= require('../models/Model');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product
 *     description: Uploads a product image and creates a new product.
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               productPrice:
 *                 type: number
 *               productDescription:
 *                 type: string
 *               productImage:
 *                 type: string
 *                 format: binary
 *               quantityInstock:
 *                 type: number
 *                     
 *     responses:
 *       201:
 *         description: New product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 product:
 *                   type: object
 *                   description: Details of the newly created product.
 *                   properties:
 *                     productName:
 *                       type: string
 *                     productPrice:
 *                       type: number
 *                     productDescription:
 *                       type: string
 *                     productImage:
 *                       type: string
 *                     quantityInstock:
 *                        type: number
 * 
 *       400:
 *         description: Bad Request. Invalid input data.
 *       500:
 *         description: Internal Server Error.
 */

// Create a new product
router.post('/products', upload.single('productImage'), async (req, res) => {
 
  try {
    // if (!req.file) {
    //   return res.status(400).json({ success: false, error: 'No file uploaded' });
    // }
    // Extract data from the request body and file
    const { productName, productPrice, productDescription, quantityInstock } = req.body;
    const { filename } = req.file;
    console.log(req.file);

    // Validate input data
    if (!productName || !productPrice || !productDescription || !quantityInstock || !filename) {
      return res.status(400).json({ success: false, error: 'Bad Request. Invalid input data.' });
    }

    // Save the file path in the database
    const newProduct = await Product.create({
      productName,
      productPrice,
      productDescription,
      productImage: `/uploads/${filename}`,
      quantityInstock
    });

    // Return the product details including the image path
    res.status(201).json({ success: true, product: { ...newProduct.toJSON(), productImage: `/uploads/${filename}` } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});




/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get a list of products.
 *     description: Retrieve a list of users from the database.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               
 *              
 */

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: integer
 *         required: true
 *         description: ID of the product.
 *     responses:
 *       200:
 *         description: a single product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
*/
// Get a specific product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByPk(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json(product);
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: integer
 *         required: true
 *         description: ID of the product.
*     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               productPrice:
 *                 type: number
 *               productDescription:
 *                 type: string
 *               productImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
*/

// Update a product by ID
router.put('/products/:id', upload.single('productImage'), async (req, res) => {
  try {
    const id = req.params.id;
    const { productName, productPrice, productDescription } = req.body;
    const { filename } = req.file;
    // Find the product by ID
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update the product properties
    await product.update({
      productName,
      productPrice,
      productDescription,
      productImage: `/uploads/${filename}`
    });

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Enter Product id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: integer
 *         required: true
 *         description: ID of the product.
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// Delete a product
router.delete('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Find the product by ID and then delete it
    const deletedProduct = await Product.findByPk(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await deletedProduct.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
 
module.exports = router;
