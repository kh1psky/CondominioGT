const Usuario = require('./Usuario');
const Condominio = require('./Condominio');
const Unidade = require('./Unidade');
const Fornecedor = require('./Fornecedor');
const Contrato = require('./Contrato');
const Inventario = require('./Inventario');

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

// Relações de Fornecedor
Fornecedor.belongsTo(Condominio, {
  foreignKey: 'condominio_id',
  as: 'condominio'
});

Fornecedor.hasMany(Contrato, {
  foreignKey: 'fornecedor_id',
  as: 'contratos'
});

// Relações de Contrato
Contrato.belongsTo(Fornecedor, {
  foreignKey: 'fornecedor_id',
  as: 'fornecedor'
});

Contrato.belongsTo(Condominio, {
  foreignKey: 'condominio_id',
  as: 'condominio'
});

// Relações de Inventario
Inventario.belongsTo(Condominio, {
  foreignKey: 'condominio_id',
  as: 'condominio'
});

Inventario.belongsTo(Fornecedor, {
  foreignKey: 'fornecedor_id',
  as: 'fornecedor'
});

// Exportar os modelos
module.exports = {
  Usuario,
  Condominio,
  Unidade,
  Fornecedor,
  Contrato,
  Inventario
};