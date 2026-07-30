module.exports = async function(req, res, proceed) {
  if (req.session && req.session.userId) {
    return proceed();
  }

  req.session.error = 'Debes iniciar sesión.';
  return res.redirect('/login');
};