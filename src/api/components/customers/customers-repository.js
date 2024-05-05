const { Customers } = require('../../../models');

// Fungsi untuk mengupdate balance
async function updateBalance(accountId, newBalance) {
  return Customers.updateOne(
    { accountId: accountId },
    { $set: { balance: newBalance } }
  );
}

// Fungsi untuk mengembalikan data Customers menggunakan parameter accountId
async function getCustomersByAccountId(accountId) {
  return Customers.findOne({ accountId });
}

// Fungsi untuk mengimplementasi pagination
async function applyPagination(pageNumber, pageSize) {
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = pageNumber * pageSize;
  const customers = await Customers.find({}).skip(startIndex).limit(endIndex);
  return customers;
}

// Fungsi untuk mengimplementasi filter
async function applyFilter(customers, filterFunction) {
  return customers.filter(filterFunction);
}

// Fungsi untuk mengimplemenatasi sort
async function applySort(customers, sortFunction) {
  return customers.sort(sortFunction);
}
// Fungsi untuk mengembalikan jumlah Customers
async function totalCustomers() {
  totalCustomers = await Customers.countDocuments();
  return totalCustomers;
}

// Fungsi untuk mendapatkan list customers
async function getCustomers() {
  return Customers.find({});
}

// Fungsi untuk mendapatkan list customers menggunakan id
async function getCustomer(id) {
  return Customers.findById(id);
}

// Membuat data Customers baru
async function createCustomers(name, email, password, accountId, balance) {
  return Customers.create({
    name,
    email,
    password,
    accountId,
    balance,
  });
}

// Mengubah data Customers
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

// Menghapus seluruh data Customers
async function deleteCustomers(id) {
  return Customers.deleteOne({ _id: id });
}

// Mendapatkan data Customers menggunakan email
async function getCustomersByEmail(email) {
  return Customers.findOne({ email });
}

// Mengubah password Customers
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
  getCustomersByAccountId,
  updateBalance,
};
