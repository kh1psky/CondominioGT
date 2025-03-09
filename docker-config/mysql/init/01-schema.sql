-- Inicialização do banco de dados para o sistema CondoGT

-- Usar o banco de dados
USE condos_db;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'sindico', 'proprietario', 'morador') NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14) UNIQUE,
  data_nascimento DATE,
  foto VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  token_reset_senha VARCHAR(255),
  token_expiracao DATETIME,
  ultimo_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Condomínios
CREATE TABLE IF NOT EXISTS condominios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  endereco VARCHAR(255) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  cep VARCHAR(9) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100),
  data_fundacao DATE,
  area_total DECIMAL(10, 2),
  sindico_id INT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sindico_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela de Unidades
CREATE TABLE IF NOT EXISTS unidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  condominio_id INT NOT NULL,
  identificacao VARCHAR(20) NOT NULL,
  tipo ENUM('apartamento', 'casa', 'sala_comercial', 'outro') NOT NULL,
  area DECIMAL(10, 2),
  quartos INT,
  banheiros INT,
  vagas_garagem INT,
  proprietario_id INT,
  morador_id INT,
  ocupada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE,
  FOREIGN KEY (proprietario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (morador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  UNIQUE KEY (condominio_id, identificacao)
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cnpj_cpf VARCHAR(18) NOT NULL,
  tipo ENUM('pessoa_fisica', 'pessoa_juridica') NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100),
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  estado CHAR(2),
  cep VARCHAR(9),
  categoria VARCHAR(50),
  condominio_id INT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- Tabela de Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  condominio_id INT NOT NULL,
  fornecedor_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10, 2),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  periodicidade ENUM('mensal', 'bimestral', 'trimestral', 'semestral', 'anual', 'unico') NOT NULL,
  status ENUM('ativo', 'pendente', 'cancelado', 'concluido') NOT NULL DEFAULT 'ativo',
  arquivo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE CASCADE
);

-- Tabela de Inventário
CREATE TABLE IF NOT EXISTS inventarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  condominio_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50),
  numero_serie VARCHAR(50),
  codigo_patrimonio VARCHAR(50),
  data_aquisicao DATE,
  valor_aquisicao DECIMAL(10, 2),
  fornecedor_id INT,
  nota_fiscal VARCHAR(50),
  localizacao VARCHAR(100),
  status ENUM('disponivel', 'em_uso', 'manutencao', 'danificado', 'baixado') NOT NULL DEFAULT 'disponivel',
  data_ultima_manutencao DATE,
  data_proxima_manutencao DATE,
  observacoes TEXT,
  foto VARCHAR(255),
  qrcode VARCHAR(255),
  criado_por INT,
  atualizado_por INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (atualizado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  condominio_id INT NOT NULL,
  unidade_id INT,
  tipo ENUM('taxa_condominio', 'multa', 'extra', 'outro') NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status ENUM('pendente', 'pago', 'atrasado', 'cancelado') NOT NULL DEFAULT 'pendente',
  comprovante VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE,
  FOREIGN KEY (unidade_id) REFERENCES unidades(id) ON DELETE SET NULL
);

-- Tabela de Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  condominio_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL,
  arquivo VARCHAR(255) NOT NULL,
  tamanho INT NOT NULL,
  data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela de Manutenções do Inventário
CREATE TABLE IF NOT EXISTS manutencoes_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inventario_id INT NOT NULL,
  data_manutencao DATE NOT NULL,
  tipo ENUM('preventiva', 'corretiva') NOT NULL,
  descricao TEXT NOT NULL,
  custo DECIMAL(10, 2),
  fornecedor_id INT,
  responsavel_id INT,
  status ENUM('agendada', 'em_andamento', 'concluida', 'cancelada') NOT NULL DEFAULT 'agendada',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inventario_id) REFERENCES inventarios(id) ON DELETE CASCADE,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL,
  FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS transacoes_financeiras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  condominio_id INT NOT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_transacao DATE NOT NULL,
  forma_pagamento VARCHAR(50),
  comprovante VARCHAR(255),
  fornecedor_id INT,
  contrato_id INT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL,
  FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE SET NULL
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  data_leitura DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para otimização de consultas
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX idx_condominios_sindico ON condominios(sindico_id);
CREATE INDEX idx_unidades_condominio ON unidades(condominio_id);
CREATE INDEX idx_unidades_proprietario ON unidades(proprietario_id);
CREATE INDEX idx_unidades_morador ON unidades(morador_id);
CREATE INDEX idx_fornecedores_condominio ON fornecedores(condominio_id);
CREATE INDEX idx_contratos_condominio ON contratos(condominio_id);
CREATE INDEX idx_contratos_fornecedor ON contratos(fornecedor_id);
CREATE INDEX idx_inventarios_condominio ON inventarios(condominio_id);
CREATE INDEX idx_inventarios_status ON inventarios(status);
CREATE INDEX idx_pagamentos_condominio ON pagamentos(condominio_id);
CREATE INDEX idx_pagamentos_unidade ON pagamentos(unidade_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_documentos_condominio ON documentos(condominio_id);
CREATE INDEX idx_transacoes_condominio ON transacoes_financeiras(condominio_id);
CREATE INDEX idx_transacoes_tipo ON transacoes_financeiras(tipo);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);