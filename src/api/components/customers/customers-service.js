const customersRepository = require('./customers-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { accountId, balance } = require('../../../models/customers-Schema');

// Fungsi untuk melakukan transaksi / transfer
async function createTransaction(email, receiverId, amount) {
  // Memanggil fungsi getCustomersByEmail
  const sender = await customersRepository.getCustomersByEmail(email);

  // Mengembalikan id dan saldo pengirim
  const senderId = sender.accountId;
  const senderBalance = sender.balance;

  // Memanggil fungsi getCustomersByAccountId
  const receiver =
    await customersRepository.getCustomersByAccountId(receiverId);

  // Mengembalikan saldo penerima
  const receiverID = receiver.accountId;
  const receiverBalance = receiver.balance;

  // Jika id penerima tidak ditemukan makan akan mengembalikan eror
  if (receiverId !== receiverID) {
    throw new Error('Receiver not found');
  }

  // Mengecek apakah pengirim memikiki saldo yang cukup
  if (senderBalance < amount) {
    throw new Error('Insufficient balance');
  }

  // Mengurangi saldo pengirim
  const deduction = senderBalance - amount;

  // Menambahkan saldo penerima
  const addition = Number(receiverBalance) + Number(amount);

  // Memanggil fungsi updateBalance untuk mengupdate saldo pada pengirim dan penerima
  await customersRepository.updateBalance(senderId, deduction);
  await customersRepository.updateBalance(receiverId, addition);

  // Mendeklarasi newSender untuk menegembalikan data pengirim yang sudah di update
  const newSender = await customersRepository.getCustomersByAccountId(senderId);

  // Mengembalikan nama pengirim, saldo pengirim, nama penerima, dan status transaksi
  return {
    sender_name: newSender.name,
    sender_balance: newSender.balance,
    receiver_name: receiver.name,
    transaction: 'Successfull',
  };
}

// Fungsi untuk mengembalikan data Customers dan mengimplementasikan pagination, filtering, dan sorting
async function getCustomers(
  pageNumber,
  pageSize,
  searchType,
  search,
  sortType,
  sortOrder
) {
  // Jika Customers tidak menggunakan fitur pagination pada querry maka akan mengembalikan semua Customers tanpa fitur Pagination
  let customers = await customersRepository.getCustomers();

  // Mengimplementasikan Pagination
  if (pageNumber && pageSize) {
    // Jika pengguna menggunakan fitur pagination pada querry maka akan mengembalikan semua customers dengan fitur Pagination
    customers = await customersRepository.applyPagination(pageNumber, pageSize);
  }

  // Mengimplementasikan Filtering
  if (searchType && search) {
    if (searchType === 'name' || searchType === 'email') {
      // Membuat filterFunction untuk dapat memenuhi kriteria parameter .filter() pada customersRepository
      const filterFunction = (customers) =>
        customers[searchType].toLowerCase().includes(search.toLowerCase());
      // Jika pengguna menggunakan fitur filter pada querry maka akan mengembalikan semua customers yang sudah di filter
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
      // Jika pengguna menggunakan fitur sort pada querry maka akan mengembalikan semua customers yang sudah di sort
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
  // Mengkonversi data pengguna menjadi format yang diinginkan
  const results = [];
  for (let i = 0; i < customers.length; i += 1) {
    const customer = customers[i];
    results.push({
      name: customer.name,
      email: customer.email,
      accountId: customer.accountId,
      balance: customer.balance,
    });
  }
  // Mengembalikan data dan pageInfo
  return { data: results, pageInfo };
}

// Mendapatkan data Customers menggunakan id
async function getCustomer(id) {
  const customers = await customersRepository.getCustomer(id);

  // Jika customers tidak ditemukan maka akan mengembalikan null
  if (!customers) {
    return null;
  }

  // Mengembalikan id, name, dan email Customers
  return {
    id: customers.id,
    name: customers.name,
    email: customers.email,
  };
}

// Membuat data Customers baru
async function createCustomers(name, email, password, accountId, balance) {
  // Mengimplementasikan hash pada password
  const hashedPassword = await hashPassword(password);

  try {
    await customersRepository.createCustomers(
      name,
      email,
      hashedPassword,
      accountId,
      balance
    );
  } catch (err) {
    return null;
  }

  return true;
}

// Mengubah data Customers
async function updateCustomers(id, name, email) {
  const customers = await customersRepository.getCustomers(id);

  // Jika customers tidak ditemukan maka akan mengembalikan null
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

// Menghapus seluruh data Customers
async function deleteCustomers(id) {
  const customers = await customersRepository.getCustomers(id);

  // Jika customers tidak ditemukan maka akan mengembalikan null
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

// Fungsi untuk mengecek apakah terdapat accountid customers pada database
async function accountIdIsRegistered(accountId) {
  const customers =
    await customersRepository.getCustomersByAccountId(accountId);

  if (customers) {
    return true;
  }

  return false;
}

// Fungsi untuk mengecek apakah terdapat email customers pada database
async function emailIsRegistered(email) {
  const customers = await customersRepository.getCustomersByEmail(email);

  if (customers) {
    return true;
  }

  return false;
}

// Fungsi untuk mengecek password menggunakan id customers
async function checkPassword(customersId, password) {
  const customers = await customersRepository.getCustomer(customersId);
  return passwordMatched(password, customers.password);
}

// Fungsi untuk mengecek passsword menggunakan email
async function checkPasswordByEmail(customersEmail, password) {
  const customers =
    await customersRepository.getCustomersByEmail(customersEmail);
  return passwordMatched(password, customers.password);
}

// Fungsi untuk mengubah password
async function changePassword(customersId, password) {
  const customers = await customersRepository.getCustomer(customersId);

  // Jikas customers tidak ditemukan maka akan mengembalikan null
  if (!customers) {
    return null;
  }

  // Mengimplementasikan hash pada password
  const hashedPassword = await hashPassword(password);

  // Memanggil fungsi changePassword dari repository
  const changeSuccess = await customersRepository.changePassword(
    customersId,
    hashedPassword
  );

  // Jika gagal maka akan mengembalikan null
  if (!changeSuccess) {
    return null;
  }

  // Jika berhasil maka akan mengembalikan null
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
  createTransaction,
  checkPasswordByEmail,
  accountIdIsRegistered,
};
