const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
// Fungsi untuk melakukan login yang sudah dilengkapi dengan fitur cek password dan limit kesalahan login
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Memanggil fungsi checkLoginAttempts pada services
    const loginAttempts =
      await authenticationServices.checkLoginAttempts(email);

    // Memanggil fungsi checkLoginCredentials pada services
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    // Jika loginAttempts mengembalikan false maka akan mengembalikan eror
    if (!loginAttempts) {
      // Eror akan muncul jika User telah melakukan kesalahan dalam login sebanyak 5 kali
      throw errorResponder(
        errorTypes.FORBIDDEN,
        `403 Forbidden: Too many failed login attempts.`
      );
    }

    // Jika loginSuccess mengembalikan null maka akan mengembalikan eror
    if (!loginSuccess) {
      // Eror akan muncul jika User tidak memasukkan email atau password dengan benar
      // Eror akan memunculkan seberapa banyak percobaan yang telah dilaksanakan user
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        `Wrong email or password. Attempts: ${loginAttempts}`
      );
    }

    // Jika email dan password benar, dan percobaan login di bawah 6 maka akan mengembalikan return dari loginSuccess
    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
