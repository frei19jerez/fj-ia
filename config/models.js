module.exports.models = {

  migrate: 'alter',

  attributes: {
    id: {
      type: 'number',
      autoIncrement: true
    },

    createdAt: {
      type: 'number',
      autoCreatedAt: true
    },

    updatedAt: {
      type: 'number',
      autoUpdatedAt: true
    }
  },

  dataEncryptionKeys: {
    default: 'dZq2ikECvKRwIhyXZRmFKvTEIywZMJb6YMPhnnuTXBc='
  },

  cascadeOnDestroy: true
};