const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const {
  attempts,
  lastAttemptTimestamp,
} = require('../../../models/users-schema');

// Fungsi untuk mengimplementasikan pagination, filtering, dan sorting
async function getUsers(
  pageNumber,
  pageSize,
  searchType,
  search,
  sortType,
  sortOrder
) {
  try {
    // Mengimplementasikan Pagination
    if (pageNumber && pageSize) {
      // Jika user menggunakan fitur pagination pada querry maka akan mengembalikan semua user dengan fitur Pagination
      users = await usersRepository.applyPagination(pageNumber, pageSize);
    } else {
      // Jika user tidak menggunakan fitur pagination pada querry maka akan mengembalikan semua user tanpa fitur Pagination
      users = await usersRepository.getUsers();
    }

    // Mengimplementasikan Filtering
    if (searchType && search) {
      if (searchType === 'name' || searchType === 'email') {
        // Membuat filterFunction untuk dapat memenuhi kriteria parameter .filter() pada userRepository
        const filterFunction = (user) =>
          user[searchType].toLowerCase().includes(search.toLowerCase());
        // Jika user menggunakan fitur filter pada querry maka akan mengembalikan semua user yang sudah di filter
        users = await usersRepository.applyFilter(users, filterFunction);
      }
    }

    // Mengimplementasikan Sorting
    if (sortType && sortOrder) {
      if (sortType === 'name' || sortType === 'email') {
        // Membuat sortFunction untuk dapat memenuhi kriteria parameter .sort() pada userRepository
        const sortFunction = (a, b) => {
          const aValue = a[sortType];
          const bValue = b[sortType];

          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        };
        // Jika user menggunakan fitur sort pada querry maka akan mengembalikan semua user yang sudah di sort
        users = await usersRepository.applySort(users, sortFunction);
      }
    }

    /* 
    Memberikan informasi dalam halaman:
      totalUsers = mengembalikan jumlah semua user pada database
      totalPages = mengembalikan jumlah semua halaman yang ada
      hasPreviousPage = mengembalikan boolean apakah terdapat halaman sebelumnya
      hasNextPage = mengembalikan boolean apakah terdapat halaman setelahnya
  */
    const totalUsers = await usersRepository.totalUsers();
    const totalPages = Math.ceil(totalUsers / pageSize);
    const hasPreviousPage = pageNumber > 1;
    const hasNextPage = pageNumber < totalPages;

    // Mengembalian informasi tentang halaman tersebut
    pageInfo = {
      count: totalUsers,
      totalPages: totalPages,
      previousPage: hasPreviousPage,
      nextPage: hasNextPage,
    };

    // Mengonversi data pengguna menjadi format yang diinginkan
    const results = [];
    for (let i = 0; i < users.length; i += 1) {
      const user = users[i];
      results.push({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }

    // Mengembalikan data dan pageInfo
    return { data: results, pageInfo };
  } catch (error) {
    // Jika terjadi kesalahan, lempar error ke penanganan kesalahan
    throw new Error('Failed to fetch users data. Please check the parameters.');
  }
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(
  name,
  email,
  password,
  attempts,
  lastAttemptTimestamp
) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(
      name,
      email,
      hashedPassword,
      attempts,
      lastAttemptTimestamp
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
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
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
