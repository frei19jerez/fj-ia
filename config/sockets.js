module.exports.sockets = {
  onlyAllowOrigins: process.env.NODE_ENV === 'production'
    ? [
        'https://fj-ia.com',
        'https://www.fj-ia.com'
      ]
    : []
};
