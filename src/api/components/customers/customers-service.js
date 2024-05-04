const customersRepository = require('./customers-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

// Fungsi untuk mengimplementasikan pagination, filtering, dan sorting
async function getCustomers(
  pageNumber,
  pageSize,
  searchType,
  search,
  sortType,
  sortOrder
) {
  console.log('tes - service');
  // Jika Customers tidak menggunakan fitur pagination pada querry maka akan mengembalikan semua Customers tanpa fitur Pagination
  let customers = await customersRepository.getCustomers();

  // Mengimplementasikan Pagination
  if (pageNumber && pageSize) {
    // Jika Customers menggunakan fitur pagination pada querry maka akan mengembalikan semua customers dengan fitur Pagination
    customers = await customersRepository.applyPagination(pageNumber, pageSize);
  }

  // Mengimplementasikan Filtering
  if (searchType && search) {
    if (searchType === 'name' || searchType === 'email') {
      // Membuat filterFunction untuk dapat memenuhi kriteria parameter .filter() pada customersRepository
      const filterFunction = (customers) =>
        customers[searchType].toLowerCase().includes(search.toLowerCase());
      // Jika customers menggunakan fitur filter pada querry maka akan mengembalikan semua customers yang sudah di filter
      customers = await customersRepository.applyFilter(
        customers,
        filterFunction
      );
    }
  }

  // Mengimplementasikan Sorting
  if (sortType && sortOrder) {
    if (sortType === 'name' || sortType === 'email') {
      // Membuat sortFunction untuk dapat memenuhi kriteria parameter .sort() pada customersRepository
      const sortFunction = (a, b) => {
        const aValue = a[sortType];
        const bValue = b[sortType];

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      };
      // Jika customers menggunakan fitur sort pada querry maka akan mengembalikan semua customers yang sudah di sort
      customers = await customersRepository.applySort(customers, sortFunction);
    }
  }

  /* 
    Memberikan informasi dalam halaman:
      totalCustomers = mengembalikan jumlah semua customers pada database
      totalPages = mengembalikan jumlah semua halaman yang ada
      hasPreviousPage = mengembalikan boolean apakah terdapat halaman sebelumnya
      hasNextPage = mengembalikan boolean apakah terdapat halaman setelahnya
  */
  const totalCustomers = await customersRepository.totalCustomers();
  const totalPages = Math.ceil(totalCustomers / pageSize);
  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalPages;

  // Mengembalian informasi tentang halaman tersebut
  pageInfo = {
    count: totalCustomers,
    totalPages: totalPages,
    previousPage: hasPreviousPage,
    nextPage: hasNextPage,
  };
  console.log(customers);
  console.log(pageInfo);
  // Mengonversi data pengguna menjadi format yang diinginkan
  const results = [];
  for (let i = 0; i < customers.length; i += 1) {
    const customer = customers[i];
    results.push({
      name: customer.name,
      email: customer.email,
    });
  }
  console.log(results);
  // Mengembalikan data dan pageInfo
  return { data: results, pageInfo };
}

/**
 * Get customers detail
 * @param {string} id - customers ID
 * @returns {Object}
 */
async function getCustomer(id) {
  const customers = await customersRepository.getCustomer(id);

  // Customers not found
  if (!customers) {
    return null;
  }

  return {
    id: customers.id,
    name: customers.name,
    email: customers.email,
  };
}

/**
 * Create new customers
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createCustomers(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await customersRepository.createCustomers(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing customers
 * @param {string} id - customers ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateCustomers(id, name, email) {
  const customers = await customersRepository.getCustomers(id);

  // Customers not found
  if (!customers) {
    return null;
  }

  try {
    await customersRepository.updateCustomers(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete Customers
 * @param {string} id - Customers ID
 * @returns {boolean}
 */
async function deleteCustomers(id) {
  const customers = await customersRepository.getCustomers(id);

  // Customers not found
  if (!customers) {
    return null;
  }

  try {
    await customersRepository.deleteCustomers(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const customers = await customersRepository.getCustomersByEmail(email);

  if (customers) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} customersId - customers ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(customersId, password) {
  const customers = await customersRepository.getCustomers(customersId);
  return passwordMatched(password, customers.password);
}

/**
 * Change customers password
 * @param {string} customersId - customers ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(customersId, password) {
  const customers = await customersRepository.getCustomers(customersId);

  // Check if customers not found
  if (!customers) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await customersRepository.changePassword(
    customersId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getCustomers,
  getCustomer,
  createCustomers,
  updateCustomers,
  deleteCustomers,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
