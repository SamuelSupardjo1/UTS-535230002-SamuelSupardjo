const customersService = require('./customers-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { accountId } = require('../../../models/customers-Schema');

// Fungsi untuk melakukan transaksi
async function createTransaction(request, respond, next) {
  try {
    // Mendapatkan email, password, id penerima, dan jumlah yang ingin di transfer dari body
    const email = request.body.email;
    const password = request.body.password;
    const receiverId = request.body.receiverId;
    const amount = request.body.amount;

    // Mengecek apakah email dan password benar atau tidak
    if (!(await customersService.checkPasswordByEmail(email, password))) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    // Memanggil fungsi createTransaction pada service
    const transactionResult = await customersService.createTransaction(
      email,
      receiverId,
      amount
    );

    // Jika berhasil maka akan mengembalikan return dari transactionResult
    respond.status(201).json(transactionResult);
  } catch (error) {
    next(error);
  }
}

// Fungsi untuk mengambil daftar customers dengan fitur pagination, filtering, dan sorting
async function getCustomers(request, response, next) {
  try {
    /* 
    Membaca query :
      pageNumber = Menentukan halaman berapa yang ingin dibuka
      pageSize = Menentukan berapa banyak Customers yang ingin ditunjukkan pada sebuah halaman
    */
    const pageNumber = parseInt(request.query.page_number);
    const pageSize = parseInt(request.query.page_size);

    /* 
    Mendeklarasi :
      searchType = Menentukan ingin melakukan search berdasarkan email / name
      search = Menentukan apa yang ingin di cari / search
      sortType = Menentukan ingin melakukan sort berdasarkan email / name
      sortOrder = Menentukan ingin melakukan sort dengan asc / desc
    */
    let searchType = null;
    let search = null;
    let sortType = null;
    let sortOrder = null;

    // Memisahkan searchType dan search pada querry
    if (request.query.search) {
      const searchSplit = request.query.search.split(':');
      if (searchSplit.length === 2) {
        searchType = searchSplit[0];
        search = searchSplit[1];
      }
    }

    // Memisahkan sortType dan sortOrder pada querry
    if (request.query.sort) {
      const sortSplit = request.query.sort.split(':');
      if (sortSplit.length === 2) {
        sortType = sortSplit[0];
        sortOrder = sortSplit[1];
      }
    }
    // Memanggil fungsi getCustomers dari customersService untuk mendapatkan data pengguna dan info halaman
    const { data, pageInfo } = await customersService.getCustomers(
      pageNumber,
      pageSize,
      searchType,
      search,
      sortType,
      sortOrder
    );

    // Mengembalikan data pengguna
    if (!pageNumber && !pageSize) {
      return response.status(200).json(data);
    }

    // Mengembalikan info halaman dan data pengguna yang menggunakan fitur pagination
    return response.status(200).json({
      page_number: pageNumber,
      page_size: pageSize,
      count: pageInfo.count,
      total_pages: pageInfo.totalPages,
      has_previous_page: pageInfo.previousPage,
      has_next_page: pageInfo.nextPage,
      data: data,
    });
  } catch (error) {
    // Jika terjadi kesalahan maka akan mengembalika error
    throw new Error(
      'Failed to fetch Customers data. Please input the correct querry.'
    );
  }
}

// Fungsi untuk mengembalikan data customers menggunakan id
async function getCustomer(request, response, next) {
  try {
    const customers = await customersService.getCustomer(request.params.id);

    // Jika tidak menemukan customers maka akan mengembalikan eror
    if (!customers) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown customers'
      );
    }
    // Jika menemukan customers maka akan mengembalikan data customers yang dicari
    return response.status(200).json(customers);
  } catch (error) {
    return next(error);
  }
}
// Fungsi untuk membuat customers baru
async function createCustomers(request, response, next) {
  try {
    // Mengembalikan name, email, password, password_confirm, accountId, dan balance dari body
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    const accountId = request.body.accountId;
    const balance = request.body.balance;

    // Mengecek apakah password sesuai dengan password_confirm
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Mengecek apakah email sudah terdapat di database atau belum
    const emailIsRegistered = await customersService.emailIsRegistered(email);

    // Jika email terdapat dalam database maka akan mengembalikan eror
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // Mengecek apakah accountId sudah terdapat di database atau belum
    const accountIdIsRegistered =
      await customersService.accountIdIsRegistered(accountId);

    // Jika accountId terdapat dalam database maka akan mengembalikan eror
    if (accountIdIsRegistered) {
      throw new Error('Account ID is already registered');
    }

    // Memanggil fungsi createCustommers pada service
    const success = await customersService.createCustomers(
      name,
      email,
      password,
      accountId,
      balance
    );

    // Jika gagal maka akan mengembalikan eror
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create Customers'
      );
    }

    // Mengembalikan nama, email, accountId customers
    return response.status(200).json({ name, email, accountId });
  } catch (error) {
    return next(error);
  }
}

// Fungsi untuk mengubah data customers
async function updateCustomers(request, response, next) {
  try {
    // Mendapatkan id, name, dan email dari body
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Mengecek apakah email sudah terdaftar atau belum
    const emailIsRegistered = await customersService.emailIsRegistered(email);

    // Jika sudah terdaftar maka akan mengembalikan eror
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // Memanggil fungsi updateCustomers pada service
    const success = await customersService.updateCustomers(id, name, email);

    // Jika gagal maka akan mengembalikan eror
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update Customers'
      );
    }

    // Mengembalikan id customers
    return response.status(200).json({ Update: 'Success' });
  } catch (error) {
    return next(error);
  }
}

// Fungsi untuk menghapus seluruh data customers
async function deleteCustomers(request, response, next) {
  try {
    // Medapatkan id dari params
    const id = request.params.id;

    // Memanggil fungsi deleteCustomers pada service
    const success = await customersService.deleteCustomers(id);

    //Jika gagal maka akan mengembalikan eror
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete Customers'
      );
    }

    // Mengembalikan id customers
    return response.status(200).json({ Delete: 'Success' });
  } catch (error) {
    return next(error);
  }
}

// Fungsi untuk mengubah password
async function changePassword(request, response, next) {
  try {
    // Mengecek apakah password_new sesuai dengan password_confirm
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Mengecek apakah password lama sesuai atau tidak
    if (
      !(await customersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      //Jika tidak maka akan mengembalikan eror
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    // Memanggil fungsi changePassword pada service
    const changeSuccess = await customersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    // Jika gagal maka akan mengembalikan eror
    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    // Mengembalikan id customers dari params
    return response.status(200).json({ ChangePassword: 'Success' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCustomers,
  getCustomer,
  createCustomers,
  updateCustomers,
  deleteCustomers,
  changePassword,
  createTransaction,
};
