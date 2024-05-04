const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

// Fungsi untuk mengecek berapa banyak percobaan dalam login
async function checkLoginAttempts(email) {
  // Memanggil fungsi getUserbyEmail pada repository
  const users = await authenticationRepository.getUserByEmail(email);

  // Memanggil fungsi getNowTime pada repository
  const currentTime = await authenticationRepository.getNowTime();

  // Mendeklarasi timeDifference
  let timeDifference = null;

  // Jika user sudah pernah login, maka dapat menentukan timeDifference
  if (users.lastAttemptTimestamp !== null) {
    // Menghitung sisa waktu sebelum pengguna dapat mencoba login kembali
    timeDifference = currentTime - users.lastAttemptTimestamp;
  }

  // Jika sudah melakukan kesalahan lebih dari 5x dan timeDifference di bawah 30 menit, maka akan mengebalikan false
  if (users.attempts >= 5 && timeDifference < 1800000) {
    return false;
  }

  // Jika timeDifference diatas 30 menit, maka attempts users akan reset dan menjadi 0 kembali
  if (timeDifference >= 1800000) {
    users.attempts = 0;
  } else {
    // Jika timeDifference di bawah 30 menit, maka attempts users akan bertambah
    users.attempts++;
  }

  // Mendeklarasikan lastAttemptTimestamp dengan waktu sekarang
  users.lastAttemptTimestamp = currentTime;

  // Memanggil fungsi saveUserByEmail pada repository
  await authenticationRepository.saveUserByEmail(email, users);

  // Mengembalikan attempts users
  return users.attempts;
}

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
// Fungsi untuk mengecek apakah email dan password user sesuai dengan user pada database
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.

  if (user && passwordChecked) {
    // Jika login berhasil, attempts user akan kembali menjadi 0
    user.attempts = 0;

    // Memanggil fungsi saveUserByEmail dari repository
    await authenticationRepository.saveUserByEmail(email, user);

    // Mengembalikan email, name, user_id, dan token
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  // Jika email dan password tidak sesuai maka akan mengembalikan null
  return null;
}

module.exports = {
  checkLoginCredentials,
  checkLoginAttempts,
};
