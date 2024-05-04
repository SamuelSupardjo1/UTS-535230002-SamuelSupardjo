const { Customers } = require('../../../models');

// Pagintaion Function
async function applyPagination(pageNumber, pageSize) {
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = pageNumber * pageSize;
  const customers = await Customers.find({})
    .skip(startIndex)
    .limit(endIndex - startIndex);
  return customers;
}

// Filter Function
async function applyFilter(customers, filterFunction) {
  return customers.filter(filterFunction);
}

// Sort Function
async function applySort(customers, sortFunction) {
  return customers.sort(sortFunction);
}
// Total customers Function
async function totalCustomers() {
  totalCustomers = await Customers.countDocuments();
  return totalCustomers;
}

/**
 * Get a list of Customers
 * @returns {Promise}
 */
async function getCustomers() {
  console.log('tes - repo');
  return Customers.find({});
}

/**
 * Get Customers detail
 * @param {string} id - Customers ID
 * @returns {Promise}
 */
async function getCustomer(id) {
  return Customers.findById(id);
}

/**
 * Create new Customers
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createCustomers(name, email, password) {
  return Customers.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing Customers
 * @param {string} id - Customers ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateCustomers(id, name, email) {
  return Customers.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a Customers
 * @param {string} id - Customers ID
 * @returns {Promise}
 */
async function deleteCustomers(id) {
  return Customers.deleteOne({ _id: id });
}

/**
 * Get Customers by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getCustomersByEmail(email) {
  return Customers.findOne({ email });
}

/**
 * Update Customers password
 * @param {string} id - Customers ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return Customers.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getCustomers,
  getCustomer,
  createCustomers,
  updateCustomers,
  deleteCustomers,
  getCustomersByEmail,
  changePassword,
  totalCustomers,
  applyPagination,
  applyFilter,
  applySort,
};
