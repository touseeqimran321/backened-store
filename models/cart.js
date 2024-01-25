// models/Cart.js
const {Sequelize,  DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: 'touseeq123',
    database: 'Product',
    
  });
const User = require('./user');

const Cart = sequelize.define('Cart', {

},
{
    timestamps: false
});

sequelize.sync({alter: true}).then(() =>{
    console.log('Table Created');
}).catch((err)=>{
    console.log(err)
})

Cart.belongsTo(User);

module.exports = Cart;

