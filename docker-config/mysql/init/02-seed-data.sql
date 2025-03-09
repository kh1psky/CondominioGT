-- Script para inserir dados iniciais no banco de dados
USE condos_db;

-- Inserir usuário administrador
INSERT INTO usuarios (nome, email, senha, perfil, cpf, telefone, ativo, created_at, updated_at)
VALUES ('Administrador', 'admin@condogt.com', '$2a$10$JrAQAh2KPACxfCQfIuM7xOUhSAz.K9Qx2tOq9R5qPtJlQBQCCvt4y', 'admin', '000.000.000-00', '(00) 00000-0000', TRUE, NOW(), NOW());

-- Inserir usuário síndico de teste
INSERT INTO usuarios (nome, email, senha, perfil, cpf, telefone, ativo, created_at, updated_at)
VALUES ('Síndico Teste', 'sindico@condogt.com', '$2a$10$JrAQAh2KPACxfCQfIuM7xOUhSAz.K9Qx2tOq9R5qPtJlQBQCCvt4y', 'sindico', '111.111.111-11', '(11) 11111-1111', TRUE, NOW(), NOW());

-- Inserir condomínio de teste
INSERT INTO condominios (nome, cnpj, endereco, numero, bairro, cidade, estado, cep, telefone, email, sindico_id, ativo, created_at, updated_at)
VALUES ('Condomínio Modelo', '00.000.000/0001-00', 'Rua Exemplo', '100', 'Centro', 'São Paulo', 'SP', '01000-000', '(00) 0000-0000', 'contato@condominiomodelo.com.br', 2, TRUE, NOW(), NOW());

-- Inserir algumas unidades para o condomínio
INSERT INTO unidades (condominio_id, identificacao, tipo, area, quartos, banheiros, vagas_garagem, ocupada, created_at, updated_at)
VALUES 
(1, '101', 'apartamento', 75.5, 2, 1, 1, FALSE, NOW(), NOW()),
(1, '102', 'apartamento', 75.5, 2, 1, 1, FALSE, NOW(), NOW()),
(1, '201', 'apartamento', 100.0, 3, 2, 2, FALSE, NOW(), NOW()),
(1, '202', 'apartamento', 100.0, 3, 2, 2, FALSE, NOW(), NOW());

-- Inserir fornecedores de teste
INSERT INTO fornecedores (nome, cnpj_cpf, tipo, telefone, email, categoria, condominio_id, ativo, created_at, updated_at)
VALUES 
('Limpeza Express', '11.111.111/0001-11', 'pessoa_juridica', '(11) 1111-1111', 'contato@limpezaexpress.com', 'Limpeza', 1, TRUE, NOW(), NOW()),
('Segurança Total', '22.222.222/0001-22', 'pessoa_juridica', '(22) 2222-2222', 'contato@segurancatotal.com', 'Segurança', 1, TRUE, NOW(), NOW()),
('Manutenção Geral', '33.333.333/0001-33', 'pessoa_juridica', '(33) 3333-3333', 'contato@manutencaogeral.com', 'Manutenção', 1, TRUE, NOW(), NOW());

-- Inserir itens de inventário
INSERT INTO inventarios (condominio_id, nome, descricao, categoria, codigo_patrimonio, data_aquisicao, valor_aquisicao, fornecedor_id, localizacao, status, created_at, updated_at)
VALUES 
(1, 'Sofá para Hall', 'Sofá de 3 lugares em couro sintético', 'Móveis', 'MOV-001', '2023-01-15', 1200.00, 3, 'Hall de entrada', 'disponivel', NOW(), NOW()),
(1, 'TV LED 50"', 'Smart TV para salão de festas', 'Eletrônicos', 'ELE-001', '2023-02-20', 2500.00, 3, 'Salão de festas', 'em_uso', NOW(), NOW()),
(1, 'Cortador de grama', 'Cortador de grama elétrico', 'Equipamentos', 'EQP-001', '2023-03-10', 800.00, 3, 'Depósito', 'disponivel', NOW(), NOW()),
(1, 'Conjunto de ferramentas', 'Kit com 100 peças', 'Ferramentas', 'FER-001', '2023-01-05', 450.00, 3, 'Sala do zelador', 'em_uso', NOW(), NOW()),
(1, 'Cadeiras plásticas', '10 cadeiras para área da piscina', 'Móveis', 'MOV-002', '2023-02-28', 350.00, 3, 'Área da piscina', 'disponivel', NOW(), NOW());

-- Inserir transações financeiras
INSERT INTO transacoes_financeiras (condominio_id, tipo, categoria, descricao, valor, data_transacao, forma_pagamento, fornecedor_id, created_at, updated_at)
VALUES 
(1, 'receita', 'Taxa de condomínio', 'Taxa de condomínio - Janeiro/2023', 5000.00, '2023-01-10', 'Transferência', NULL, NOW(), NOW()),
(1, 'despesa', 'Limpeza', 'Serviço de limpeza - Janeiro/2023', 1200.00, '2023-01-15', 'Transferência', 1, NOW(), NOW()),
(1, 'despesa', 'Segurança', 'Serviço de segurança - Janeiro/2023', 2000.00, '2023-01-15', 'Transferência', 2, NOW(), NOW()),
(1, 'receita', 'Taxa de condomínio', 'Taxa de condomínio - Fevereiro/2023', 5000.00, '2023-02-10', 'Transferência', NULL, NOW(), NOW()),
(1, 'despesa', 'Limpeza', 'Serviço de limpeza - Fevereiro/2023', 1200.00, '2023-02-15', 'Transferência', 1, NOW(), NOW()),
(1, 'despesa', 'Segurança', 'Serviço de segurança - Fevereiro/2023', 2000.00, '2023-02-15', 'Transferência', 2, NOW(), NOW());