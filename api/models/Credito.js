module.exports = {
  tableName: 'creditos',
  attributes: {
    saldo: { type: 'number', defaultsTo: 0 },
    descripcion: { type: 'string', allowNull: true },
    usuario: { model: 'Usuario', required: true }
  }
};
