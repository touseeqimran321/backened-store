const {Sequelize,  DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: 'touseeq123',
    database: 'Product',
    
  });
const User =require('./user');
const Cart =require('./cart')
// const Cartitem =require('./Cartitem')
  const Order = sequelize.define('Order', {
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active', // You can customize the possible values based on your needs
    },
    shippingInfo: {
      type: DataTypes.JSON,
      
    },
    paymentInfo: {
      type: DataTypes.JSON,
      
    }
  },
   {
    timestamps: false
  });

  sequelize.sync({alter: true}).then(() =>{
    console.log('Table Created');
}).catch((err)=>{
    console.log(err)
})


Order.belongsTo(User)
Order.belongsTo(Cart)
// Order.belongsTo(Cartitem)


module.exports = Order;
