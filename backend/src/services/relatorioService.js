/**
 * Serviço para geração de relatórios
 * Este módulo fornece funções para geração de diferentes tipos de relatórios
 * para o sistema de gerenciamento de condomínios
 */

const { Condominio, Unidade, Pagamento, Fornecedor, Contrato, Manutencao, Usuario } = require('../models');
const sequelize = require('../config/database');
const logger = require('../config/logger');
const pdfService = require('./pdfService');
const { formatarData, formatarMoeda } = require('../utils/formatters');

/**
 * Serviço para geração de relatórios
 */
const relatorioService = {
  /**
   * Gerar relatório financeiro
   * @param {number} condominio_id - ID do condomínio
   * @param {Date} data_inicio - Data de início do período
   * @param {Date} data_fim - Data de fim do período
   * @returns {Promise<Object>} Dados do relatório financeiro
   */
  gerarRelatorioFinanceiro: async (condominio_id, data_inicio = null, data_fim = null) => {
    try {
      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id);
      if (!condominio) {
        throw new Error('Condomínio não encontrado');
      }

      // Construir filtro de data
      const where = { condominio_id };
      if (data_inicio && data_fim) {
        where.data_pagamento = {
          [sequelize.Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        where.data_pagamento = {
          [sequelize.Op.gte]: new Date(data_inicio)
        };
      } else if (data_fim) {
        where.data_pagamento = {
          [sequelize.Op.lte]: new Date(data_fim)
        };
      }

      // Buscar pagamentos
      const pagamentos = await Pagamento.findAll({
        where,
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'identificacao']
          }
        ],
        order: [['data_pagamento', 'DESC']]
      });

      // Calcular totais
      const totalRecebido = pagamentos
        .filter(p => p.status === 'pago')
        .reduce((sum, p) => sum + parseFloat(p.valor), 0);

      const totalPendente = pagamentos
        .filter(p => p.status === 'pendente')
        .reduce((sum, p) => sum + parseFloat(p.valor), 0);

      const totalAtrasado = pagamentos
        .filter(p => p.status === 'atrasado')
        .reduce((sum, p) => sum + parseFloat(p.valor), 0);

      // Preparar dados do relatório
      const relatorio = {
        condominio: {
          id: condominio.id,
          nome: condominio.nome
        },
        periodo: {
          inicio: data_inicio || 'Início dos registros',
          fim: data_fim || 'Data atual'
        },
        resumo: {
          total_recebido: totalRecebido,
          total_pendente: totalPendente,
          total_atrasado: totalAtrasado,
          total_geral: totalRecebido + totalPendente + totalAtrasado
        },
        pagamentos: pagamentos.map(p => ({
          id: p.id,
          unidade: p.unidade ? p.unidade.identificacao : 'N/A',
          valor: parseFloat(p.valor),
          data_vencimento: p.data_vencimento,
          data_pagamento: p.data_pagamento,
          status: p.status,
          tipo: p.tipo
        }))
      };

      return relatorio;
    } catch (error) {
      logger.error(`Erro ao gerar relatório financeiro: ${error.message}`);
      throw error;
    }
  },

  /**
   * Gerar relatório de inadimplência
   * @param {number} condominio_id - ID do condomínio
   * @returns {Promise<Object>} Dados do relatório de inadimplência
   */
  gerarRelatorioInadimplencia: async (condominio_id) => {
    try {
      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id);
      if (!condominio) {
        throw new Error('Condomínio não encontrado');
      }

      // Buscar pagamentos atrasados
      const pagamentosAtrasados = await Pagamento.findAll({
        where: {
          condominio_id,
          status: 'atrasado'
        },
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'identificacao', 'bloco', 'proprietario_id'],
            include: [
              {
                model: Usuario,
                as: 'proprietario',
                attributes: ['id', 'nome', 'email', 'telefone']
              }
            ]
          }
        ],
        order: [['data_vencimento', 'ASC']]
      });

      // Calcular total em atraso
      const totalEmAtraso = pagamentosAtrasados.reduce(
        (sum, p) => sum + parseFloat(p.valor), 0
      );

      // Agrupar por unidade
      const unidadesAgrupadas = {};
      pagamentosAtrasados.forEach(pagamento => {
        const unidadeId = pagamento.unidade ? pagamento.unidade.id : 'sem_unidade';
        
        if (!unidadesAgrupadas[unidadeId]) {
          unidadesAgrupadas[unidadeId] = {
            unidade: pagamento.unidade ? {
              id: pagamento.unidade.id,
              identificacao: pagamento.unidade.identificacao,
              bloco: pagamento.unidade.bloco,
              proprietario: pagamento.unidade.proprietario ? {
                id: pagamento.unidade.proprietario.id,
                nome: pagamento.unidade.proprietario.nome,
                email: pagamento.unidade.proprietario.email,
                telefone: pagamento.unidade.proprietario.telefone
              } : null
            } : null,
            pagamentos: [],
            total: 0
          };
        }
        
        unidadesAgrupadas[unidadeId].pagamentos.push({
          id: pagamento.id,
          valor: parseFloat(pagamento.valor),
          data_vencimento: pagamento.data_vencimento,
          dias_atraso: Math.floor((new Date() - new Date(pagamento.data_vencimento)) / (1000 * 60 * 60 * 24)),
          tipo: pagamento.tipo
        });
        
        unidadesAgrupadas[unidadeId].total += parseFloat(pagamento.valor);
      });

      // Preparar dados do relatório
      const relatorio = {
        condominio: {
          id: condominio.id,
          nome: condominio.nome
        },
        data_geracao: new Date(),
        resumo: {
          total_em_atraso: totalEmAtraso,
          quantidade_unidades_inadimplentes: Object.keys(unidadesAgrupadas).length,
          quantidade_pagamentos_atrasados: pagamentosAtrasados.length
        },
        unidades: Object.values(unidadesAgrupadas)
      };

      return relatorio;
    } catch (error) {
      logger.error(`Erro ao gerar relatório de inadimplência: ${error.message}`);
      throw error;
    }
  },

  /**
   * Gerar relatório de manutenções
   * @param {number} condominio_id - ID do condomínio
   * @param {string} status - Status das manutenções (opcional)
   * @param {Date} data_inicio - Data de início do período (opcional)
   * @param {Date} data_fim - Data de fim do período (opcional)
   * @returns {Promise<Object>} Dados do relatório de manutenções
   */
  gerarRelatorioManutencoes: async (condominio_id, status = null, data_inicio = null, data_fim = null) => {
    try {
      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id);
      if (!condominio) {
        throw new Error('Condomínio não encontrado');
      }

      // Construir filtro
      const where = { condominio_id };
      
      if (status) {
        where.status = status;
      }
      
      if (data_inicio && data_fim) {
        where.data_solicitacao = {
          [sequelize.Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        where.data_solicitacao = {
          [sequelize.Op.gte]: new Date(data_inicio)
        };
      } else if (data_fim) {
        where.data_solicitacao = {
          [sequelize.Op.lte]: new Date(data_fim)
        };
      }

      // Buscar manutenções
      const manutencoes = await Manutencao.findAll({
        where,
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'identificacao', 'bloco']
          },
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'telefone']
          }
        ],
        order: [['data_solicitacao', 'DESC']]
      });

      // Calcular estatísticas
      const totalManutencoes = manutencoes.length;
      const manutencoesAgendadas = manutencoes.filter(m => m.status === 'agendada').length;
      const manutencoesEmAndamento = manutencoes.filter(m => m.status === 'em_andamento').length;
      const manutencoesFinalizadas = manutencoes.filter(m => m.status === 'finalizada').length;
      const manutencoesCanceladas = manutencoes.filter(m => m.status === 'cancelada').length;

      // Calcular custo total
      const custoTotal = manutencoes
        .filter(m => m.custo !== null && m.custo !== undefined)
        .reduce((sum, m) => sum + parseFloat(m.custo), 0);

      // Preparar dados do relatório
      const relatorio = {
        condominio: {
          id: condominio.id,
          nome: condominio.nome
        },
        periodo: {
          inicio: data_inicio || 'Início dos registros',
          fim: data_fim || 'Data atual'
        },
        resumo: {
          total_manutencoes: totalManutencoes,
          manutencoes_agendadas: manutencoesAgendadas,
          manutencoes_em_andamento: manutencoesEmAndamento,
          manutencoes_finalizadas: manutencoesFinalizadas,
          manutencoes_canceladas: manutencoesCanceladas,
          custo_total: custoTotal
        },
        manutencoes: manutencoes.map(m => ({
          id: m.id,
          titulo: m.titulo,
          descricao: m.descricao,
          status: m.status,
          tipo: m.tipo,
          prioridade: m.prioridade,
          data_solicitacao: m.data_solicitacao,
          data_agendamento: m.data_agendamento,
          data_conclusao: m.data_conclusao,
          custo: m.custo ? parseFloat(m.custo) : null,
          unidade: m.unidade ? {
            id: m.unidade.id,
            identificacao: m.unidade.identificacao,
            bloco: m.unidade.bloco
          } : null,
          fornecedor: m.fornecedor ? {
            id: m.fornecedor.id,
            nome: m.fornecedor.nome,
            telefone: m.fornecedor.telefone
          } : null
        }))
      };

      return relatorio;
    } catch (error) {
      logger.error(`Erro ao gerar relatório de manutenções: ${error.message}`);
      throw error;
    }
  },

  /**
   * Gerar relatório de contratos
   * @param {number} condominio_id - ID do condomínio
   * @param {string} status - Status dos contratos (opcional)
   * @returns {Promise<Object>} Dados do relatório de contratos
   */
  gerarRelatorioContratos: async (condominio_id, status = null) => {
    try {
      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id);
      if (!condominio) {
        throw new Error('Condomínio não encontrado');
      }

      // Construir filtro
      const where = { condominio_id };
      
      if (status) {
        where.status = status;
      }

      // Buscar contratos
      const contratos = await Contrato.findAll({
        where,
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj', 'telefone', 'email']
          }
        ],
        order: [['data_inicio', 'DESC']]
      });

      // Calcular estatísticas
      const totalContratos = contratos.length;
      const contratosAtivos = contratos.filter(c => c.status === 'ativo').length;
      const contratosVencidos = contratos.filter(c => c.status === 'vencido').length;
      const contratosCancelados = contratos.filter(c => c.status === 'cancelado').length;

      // Calcular valor total dos contratos ativos
      const valorTotalAtivos = contratos
        .filter(c => c.status === 'ativo' && c.valor !== null && c.valor !== undefined)
        .reduce((sum, c) => sum + parseFloat(c.valor), 0);

      // Preparar dados do relatório
      const relatorio = {
        condominio: {
          id: condominio.id,
          nome: condominio.nome
        },
        data_geracao: new Date(),
        resumo: {
          total_contratos: totalContratos,
          contratos_ativos: contratosAtivos,
          contratos_vencidos: contratosVencidos,
          contratos_cancelados: contratosCancelados,
          valor_total_ativos: valorTotalAtivos
        },
        contratos: contratos.map(c => ({
          id: c.id,
          titulo: c.titulo,
          descricao: c.descricao,
          status: c.status,
          tipo: c.tipo,
          data_inicio: c.data_inicio,
          data_fim: c.data_fim,
          valor: c.valor ? parseFloat(c.valor) : null,
          periodicidade: c.periodicidade,
          fornecedor: c.fornecedor ? {
            id: c.fornecedor.id,
            nome: c.fornecedor.nome,
            cnpj: c.fornecedor.cnpj,
            telefone: c.fornecedor.telefone,
            email: c.fornecedor.email
          } : null
        }))
      };

      return relatorio;
    } catch (error) {
      logger.error(`Erro ao gerar relatório de contratos: ${error.message}`);
      throw error;
    }
  },

  /**
   * Gerar PDF de um relatório
   * @param {string} tipo - Tipo de relatório (financeiro, inadimplencia, manutencoes, contratos)
   * @param {object} dados - Dados do relatório
   * @returns {Promise<Buffer>} Buffer do PDF gerado
   */
  gerarPDF: async (tipo, dados) => {
    try {
      return await pdfService.gerarRelatorioPDF(tipo, dados);
    } catch (error) {
      logger.error(`Erro ao gerar PDF do relatório: ${error.message}`);
      throw error;
    }
  }
};

module.exports = relatorioService;