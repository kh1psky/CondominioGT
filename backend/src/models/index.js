const Usuario = require('./Usuario');
const Condominio = require('./Condominio');
const Unidade = require('./Unidade');

// Estabelecer relações entre os modelos

// Relações de Usuario
Usuario.hasMany(Condominio, {
  foreignKey: 'sindico_id',
  as: 'condominios_administrados'
});

Usuario.hasMany(Unidade, {
  foreignKey: 'proprietario_id',
  as: 'propriedades'
});

Usuario.hasMany(Unidade, {
  foreignKey: 'morador_id',
  as: 'residencias'
});

// Relações de Condominio
Condominio.belongsTo(Usuario, {
  foreignKey: 'sindico_id',
  as: 'sindico'
});

Condominio.hasMany(Unidade, {
  foreignKey: 'condominio_id',
  as: 'unidades'
});

// Relações de Unidade
Unidade.belongsTo(Condominio, {
  foreignKey: 'condominio_id',
  as: 'condominio'
});

Unidade.belongsTo(Usuario, {
  foreignKey: 'proprietario_id',
  as: 'proprietario'
});

Unidade.belongsTo(Usuario, {
  foreignKey: 'morador_id',
  as: 'morador'
});

// Exportar os modelos
module.exports = {
  Usuario,
  Condominio,
  Unidade
};