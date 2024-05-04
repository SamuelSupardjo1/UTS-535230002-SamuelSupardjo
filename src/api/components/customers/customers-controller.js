const customersService = require('./customers-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

// Fungsi untuk mengambil daftar pengguna dengan fitur pagination, filtering, dan sorting
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
    console.log('tes - control');
    // Memanggil fungsi getCustomers dari customersService untuk mendapatkan data pengguna dan info halaman
    const { data, pageInfo } = await customersService.getCustomers(
      pageNumber,
      pageSize,
      searchType,
      search,
      sortType,
      sortOrder
    );
    console.log(data);
    console.log(pageInfo);

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
    // Jika terjadi kesalahan, lempar error ke penanganan kesalahan
    throw new Error(
      'Failed to fetch Customers data. Please use the input the correct querry.'
    );
  }
}

async function getCustomer(request, response, next) {
  try {
    const customers = await customersService.getCustomer(request.params.id);

    if (!customers) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown customers'
      );
    }

    return response.status(200).json(customers);
  } catch (error) {
    return next(error);
  }
}

async function createCustomers(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await customersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await customersService.createCustomers(
      name,
      email,
      password
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create Customers'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

async function updateCustomers(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await customersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await customersService.updateCustomers(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update Customers'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

async function deleteCustomers(request, response, next) {
  try {
    const id = request.params.id;

    const success = await customersService.deleteCustomers(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete Customers'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await customersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await customersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
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
};
