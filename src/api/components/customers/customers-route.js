const express = require('express');

const celebrate = require('../../../core/celebrate-wrappers');
const customersControllers = require('./customers-controller');
const customersValidators = require('./customers-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/customers', route);

  // Get list of Customers
  route.get('/', customersControllers.getCustomers);

  // Create Customers
  route.post(
    '/',
    celebrate(customersValidators.createCustomers),
    customersControllers.createCustomers
  );

  // Get Customers detail
  route.get('/:id', customersControllers.getCustomer);

  // Update Customers
  route.put(
    '/:id',
    celebrate(customersValidators.updateCustomers),
    customersControllers.updateCustomers
  );

  // Delete Customers
  route.delete('/:id', customersControllers.deleteCustomers);

  // Change password
  route.post(
    '/:id/change-password',
    celebrate(customersValidators.changePassword),
    customersControllers.changePassword
  );
};
