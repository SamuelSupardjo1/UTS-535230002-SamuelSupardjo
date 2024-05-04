const usersSchema = {
  name: String,
  email: String,
  password: String,

  // Menambahkan attempts dan lastAttemptTimestap pada Users
  attempts: String,
  lastAttemptTimestamp: String,
};

module.exports = usersSchema;
