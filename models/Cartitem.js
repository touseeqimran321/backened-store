const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: 'touseeq123',
  database: 'Product',
  
}); 
// const User = require('./user');
const Product = require('./Model');
const Cart = require('./cart');
// const Order = require('./order')


const CartItem = sequelize.define('CartItem', {
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    
    }
    
  },
  {
    timestamps: false
  });

  sequelize.sync({alter: true}).then(() =>{
    console.log('Table created ');
}).catch((err)=>{
    console.log(err)
});


// CartItem.belongsTo(User);
CartItem.belongsTo(Product);
CartItem.belongsTo(Cart);
// CartItem.belongsTo(Order);



  module.exports = CartItem