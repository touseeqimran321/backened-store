const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: 'touseeq123',
  database: 'Product',
  
});

const Product = sequelize.define('Product', {
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productDescription: {
    type: DataTypes.STRING,
  },
  productImage: {
    type: DataTypes.STRING,
  },
  quantityInstock:{
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
},
{
  timestamps: false
});

  sequelize.sync({alter: true}).then(() =>{
    console.log('Table Created');
}).catch((err)=>{
    console.log(err)
});

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synchronized');
}).catch((err) => {
  console.log(err);
});


module.exports =  Product;
