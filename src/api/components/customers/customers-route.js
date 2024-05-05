const express = require('express');

const celebrate = require('../../../core/celebrate-wrappers');
const customersControllers = require('./customers-controller');
const customersValidators = require('./customers-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/customers', route);

  // Mmembuat customers baru
  route.post(
    '/',
    celebrate(customersValidators.createCustomers),
    customersControllers.createCustomers
  );

  // Membuat transaksi baru
  route.post(
    '/transaction',
    celebrate(customersValidators.createTransaction),
    customersControllers.createTransaction
  );

  // Mengembalikan data customers
  route.get('/', customersControllers.getCustomers);

  // Mengembalikan data customers menggunakan id
  route.get('/:id', customersControllers.getCustomer);

  // Mengembalikan data transaksi
  route.get('/transaction', customersControllers.getCustomers);

  // Mengubah data customers
  route.put(
    '/:id',
    celebrate(customersValidators.updateCustomers),
    customersControllers.updateCustomers
  );

  // Menghapus seluruh data customers
  route.delete('/:id', customersControllers.deleteCustomers);

  // Mengubah password
  route.post(
    '/:id/change-password',
    celebrate(customersValidators.changePassword),
    customersControllers.changePassword
  );
};
