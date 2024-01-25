const express = require('express');
const path = require('path')
const Product = require('./models/Model');
const User = require('./models/user');
const CartItem = require('./models/Cartitem')
const Cart = require('./models/cart')
const Order =require('./models/order')
const OrderItem =require('./models/orderitem')

const { swaggerSpec, swaggerUi } = require('./swagger');

const cors = require('cors');

const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());

app.use('/api', express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const userRoutes = require('./routes/users');
app.use('/api', userRoutes);

const productRoutes = require('./routes/products');
app.use('/api', productRoutes);
app.use('/uploads', express.static('uploads'));

const cartRoutes = require('./routes/carts');
app.use('/api/cart', cartRoutes);

const orderRoutes = require('./routes/orders')
app.use('/api/order', orderRoutes)

app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});
