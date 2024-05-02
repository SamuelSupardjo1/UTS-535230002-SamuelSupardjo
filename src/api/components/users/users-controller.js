const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

// Fungsi untuk mengambil daftar pengguna dengan fitur pagination, filtering, dan sorting
async function getUsers(request, response, next) {
  try {
    /* 
    Membaca query :
      pageNumber = Menentukan halaman berapa yang ingin dibuka
      pageSize = Menentukan berapa banyak user yang ingin ditunjukkan pada sebuah halaman
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

    // Memanggil fungsi getUsers dari usersService untuk mendapatkan data pengguna dan info halaman
    const { data, pageInfo } = await usersService.getUsers(
      pageNumber,
      pageSize,
      searchType,
      search,
      sortType,
      sortOrder
    );

    // Mengembalikan data pengguna dan info halaman
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
      'Failed to fetch users data. Please use the input the correct querry.'
    );
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
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
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
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
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
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
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
