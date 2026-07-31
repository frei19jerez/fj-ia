module.exports.datastores = {
  default: {
    adapter: 'sails-postgresql',

    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:emily19kenia@localhost:5432/fjia',

    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: false
          }
        : false
  }
};