const { User } = require('../../../models');

// Pagintaion Function
async function applyPagination(pageNumber, pageSize) {
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = pageNumber * pageSize;
  const users = await User.find({})
    .skip(startIndex)
    .limit(endIndex - startIndex);
  return users;
}

// Filter Function
async function applyFilter(users, filterFunction) {
  return users.filter(filterFunction);
}

// Sort Function
async function applySort(users, sortFunction) {
  return users.sort(sortFunction);
}
// Total Users Function
async function totalUsers() {
  totalUsers = await User.countDocuments();
  return totalUsers;
}

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(
  name,
  email,
  password,
  attempts,
  lastAttemptTimestamp
) {
  return User.create({
    name,
    email,
    password,
    attempts,
    lastAttemptTimestamp,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
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
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  totalUsers,
  applyPagination,
  applyFilter,
  applySort,
};
