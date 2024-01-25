// swagger.js

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Touseeq Api',
      version: '1.0.0',
      description: 'Products Api',
    },
  },
  apis: ['./routes/*.js'], // Adjust the path based on your project structure
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec, swaggerUi };
