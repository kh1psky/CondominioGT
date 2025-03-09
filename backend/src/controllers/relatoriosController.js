const { Condominio, Unidade, Pagamento, Fornecedor, Contrato, Manutencao } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const pdfService = require('../services/pdfService');

/**
 * Controller para geração de relatórios
 */
const relatoriosController = {
  /**
   * Gerar relatório financeiro
   * @route GET /api/relatorios/financeiro
   */
  financeiro: async (req, res, next) => {
    try {
      const { condominio_id, data_inicio, data_fim, formato = 'json' } = req.query;

      // Validar parâmetros
      if (!condominio_id) {
        return res.status(400).json({
          status: 'error',
          message: 'ID do condomínio é obrigatório'
        });
      }

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
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

      // Retornar relatório no formato solicitado
      if (formato === 'pdf') {
        // Gerar PDF
        const pdfBuffer = await pdfService.gerarRelatorioPDF('financeiro', relatorio);
        
        // Configurar cabeçalhos para download do PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_financeiro_${condominio_id}.pdf`);
        
        // Enviar o buffer do PDF
        return res.send(pdfBuffer);
      }

      // Retornar como JSON (padrão)
      return res.status(200).json({
        status: 'success',
        data: relatorio
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Gerar relatório de inadimplência
   * @route GET /api/relatorios/inadimplencia
   */
  inadimplencia: async (req, res, next) => {
    try {
      const { condominio_id, formato = 'json' } = req.query;

      // Validar parâmetros
      if (!condominio_id) {
        return res.status(400).json({
          status: 'error',
          message: 'ID do condomínio é obrigatório'
        });
      }

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Data atual
      const hoje = new Date();

      // Buscar pagamentos atrasados
      const pagamentosAtrasados = await Pagamento.findAll({
        where: {
          condominio_id,
          status: 'atrasado',
          data_vencimento: {
            [sequelize.Op.lt]: hoje
          }
        },
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'identificacao', 'proprietario_nome', 'proprietario_email', 'proprietario_telefone']
          }
        ],
        order: [['data_vencimento', 'ASC']]
      });

      // Agrupar por unidade
      const unidadesMap = new Map();
      
      pagamentosAtrasados.forEach(pagamento => {
        const unidadeId = pagamento.unidade_id;
        
        if (!unidadesMap.has(unidadeId)) {
          unidadesMap.set(unidadeId, {
            unidade: pagamento.unidade,
            pagamentos: [],
            total_devido: 0
          });
        }
        
        const unidadeData = unidadesMap.get(unidadeId);
        unidadeData.pagamentos.push({
          id: pagamento.id,
          valor: parseFloat(pagamento.valor),
          data_vencimento: pagamento.data_vencimento,
          dias_atraso: Math.floor((hoje - new Date(pagamento.data_vencimento)) / (1000 * 60 * 60 * 24)),
          tipo: pagamento.tipo
        });
        
        unidadeData.total_devido += parseFloat(pagamento.valor);
      });

      // Preparar dados do relatório
      const relatorio = {
        condominio: {
          id: condominio.id,
          nome: condominio.nome
        },
        data_geracao: hoje,
        resumo: {
          total_unidades_inadimplentes: unidadesMap.size,
          total_pagamentos_atrasados: pagamentosAtrasados.length,
          valor_total_devido: pagamentosAtrasados.reduce((sum, p) => sum + parseFloat(p.valor), 0)
        },
        unidades: Array.from(unidadesMap.values())
      };

      // Retornar relatório no formato solicitado
      if (formato === 'pdf') {
        // Gerar PDF
        const pdfBuffer = await pdfService.gerarRelatorioPDF('inadimplencia', relatorio);
        
        // Configurar cabeçalhos para download do PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_inadimplencia_${condominio_id}.pdf`);
        
        // Enviar o buffer do PDF
        return res.send(pdfBuffer);
      }

      // Retornar como JSON (padrão)
      return res.status(200).json({
        status: 'success',
        data: relatorio
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Gerar relatório de manutenções
   * @route GET /api/relatorios/manutencoes
   */
  manutencoes: async (req, res, next) => {
    try {
      const { condominio_id, status, data_inicio, data_fim, formato = 'json' } = req.query;

      // Validar parâmetros
      if (!condominio_id) {
        return res.status(400).json({
          status: 'error',
          message: 'ID do condomínio é obrigatório'
        });
      }

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
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
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'telefone']
          }
        ],
        order: [['data_solicitacao', 'DESC']]
      });

      // Calcular estatísticas
      const totalPendentes = manutencoes.filter(m => m.status === 'pendente').length;
      const totalEmAndamento = manutencoes.filter(m => m.status === 'em_andamento').length;
      const totalConcluidas = manutencoes.filter(m => m.status === 'concluido').length;
      const totalCanceladas = manutencoes.filter(m => m.status === 'cancelado').length;
      
      const custoTotal = manutencoes
        .filter(m => m.status === 'concluido' && m.custo_real)
        .reduce((sum, m) => sum + parseFloat(m.custo_real || 0), 0);

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
          total_manutencoes: manutencoes.length,
          pendentes: totalPendentes,
          em_andamento: totalEmAndamento,
          concluidas: totalConcluidas,
          canceladas: totalCanceladas,
          custo_total: custoTotal
        },
        manutencoes: manutencoes.map(m => ({
          id: m.id,
          titulo: m.titulo,
          tipo: m.tipo,
          prioridade: m.prioridade,
          status: m.status,
          data_solicitacao: m.data_solicitacao,
          data_conclusao: m.data_conclusao,
          local: m.local,
          custo_estimado: m.custo_estimado,
          custo_real: m.custo_real,
          fornecedor: m.fornecedor ? m.fornecedor.nome : 'N/A'
        }))
      };

      // Retornar relatório no formato solicitado
      if (formato === 'pdf') {
        // Gerar PDF
        const pdfBuffer = await pdfService.gerarRelatorioPDF('manutencoes', relatorio);
        
        // Configurar cabeçalhos para download do PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_manutencoes_${condominio_id}.pdf`);
        
        // Enviar o buffer do PDF
        return res.send(pdfBuffer);
      }

      // Retornar como JSON (padrão)
      return res.status(200).json({
        status: 'success',
        data: relatorio
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Gerar relatório de contratos
   * @route GET /api/relatorios/contratos
   */
  contratos: async (req, res, next) => {
    try {
      const { condominio_id, status, formato = 'json' } = req.query;

      // Validar parâmetros
      if (!condominio_id) {
        return res.status(400).json({
          status: 'error',
          message: 'ID do condomínio é obrigatório'
        });
      }

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
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
            attributes: ['id', 'nome', 'cnpj_cpf', 'telefone']
          }
        ],
        order: [['data_inicio', 'DESC']]
      });

      // Calcular estatísticas
      const hoje = new Date();
      const totalAtivos = contratos.filter(c => c.status === 'ativo').length;
      const totalVencidos = contratos.filter(c => c.status === 'vencido').length;
      const totalCancelados = contratos.filter(c => c.status === 'cancelado').length;
      
      // Contratos próximos do vencimento (30 dias)
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + 30);
      
      const proximosVencimento = contratos.filter(c => {
        if (c.data_fim && c.status === 'ativo') {
          const dataFim = new Date(c.data_fim);
          return dataFim <= dataLimite && dataFim >= hoje;
        }
        return false;
      }).length;

      // Valor total dos contratos ativos
      const valorTotal = contratos
        .filter(c => c.status === 'ativo')
        .reduce((sum, c) => sum + parseFloat(c.valor || 0), 0);

      // Preparar dados do relatório
      const relatorio = {
        condominio: {
          id: condominio.id,
          nome: condominio.nome
        },
        data_geracao: hoje,
        resumo: {
          total_contratos: contratos.length,
          ativos: totalAtivos,
          vencidos: totalVencidos,
          cancelados: totalCancelados,
          proximos_vencimento: proximosVencimento,
          valor_total_mensal: valorTotal
        },
        contratos: contratos.map(c => ({
          id: c.id,
          numero_contrato: c.numero_contrato,
          objeto: c.objeto,
          fornecedor: c.fornecedor ? c.fornecedor.nome : 'N/A',
          data_inicio: c.data_inicio,
          data_fim: c.data_fim,
          valor: c.valor,
          status: c.status,
          renovacao_automatica: c.renovacao_automatica
        }))
      };

      // Retornar relatório no formato solicitado
      if (formato === 'pdf') {
        // Gerar PDF
        const pdfBuffer = await pdfService.gerarRelatorioPDF('contratos', relatorio);
        
        // Configurar cabeçalhos para download do PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_contratos_${condominio_id}.pdf`);
        
        // Enviar o buffer do PDF
        return res.send(pdfBuffer);
      }

      // Retornar como JSON (padrão)
      return res.status(200).json({
        status: 'success',
        data: relatorio
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = relatoriosController;