// models/user.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: 'touseeq123',
    database: 'Product',
    
  });

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
   
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },
},{
  timestamps: false
});

sequelize.sync({alter: true}).then(() =>{
    console.log('Table Created');
}).catch((err)=>{
    console.log(err)
})

module.exports =  User;
