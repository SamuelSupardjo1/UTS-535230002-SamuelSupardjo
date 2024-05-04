const { User } = require('../../../models');

// Fungsi untuk mengubah data user
async function saveUserByEmail(email, users) {
  return User.updateOne({ email: email }, { $set: users });
}

// Fungsi untuk mendapatkan waktu saat ini
async function getNowTime() {
  return Date.now();
}

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

module.exports = {
  getUserByEmail,
  getNowTime,
  saveUserByEmail,
};
