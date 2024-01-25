// const {Sequelize,  DataTypes } = require('sequelize');
// const sequelize = new Sequelize({
//   dialect: 'mysql',
//   host: 'localhost',
//   username: 'root',
//   password: 'touseeq123',
//   database: 'Product',
  
// });

// const Product = require('./Model');
// const Order = require('./order')

//   const OrderItem = sequelize.define('OrderItem', {
  
//     quantity: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   },{
//     timestamps: false
//   });

//   sequelize.sync({alter: true}).then(() =>{
//     console.log('Table Created');
// }).catch((err)=>{
//     console.log(err)
// });

// sequelize.sync({alter: true}).then(() =>{
//     console.log('Table Created');
// }).catch((err)=>{
//     console.log(err)
// })


// OrderItem.belongsTo(Product);
// OrderItem.belongsTo(Order)

    
  

//   module.exports = OrderItem