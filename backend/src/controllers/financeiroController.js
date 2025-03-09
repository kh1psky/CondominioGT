const { Pagamento, Condominio } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const { STATUS_PAGAMENTO } = require('../utils/constants');

/**
 * Controller para gerenciamento financeiro básico
 */
const financeiroController = {
  /**
   * Obter resumo financeiro do condomínio
   * @route GET /api/financeiro/condominios/:condominioId/resumo
   */
  obterResumoFinanceiro: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { data_inicial, data_final } = req.query;

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Construir query de filtro por data
      const where = { condominio_id: condominioId };
      if (data_inicial || data_final) {
        where.data_vencimento = {};
        
        if (data_inicial) {
          where.data_vencimento[sequelize.Op.gte] = data_inicial;
        }
        
        if (data_final) {
          where.data_vencimento[sequelize.Op.lte] = data_final;
        }
      }

      // Calcular totais
      const totalReceitas = await Pagamento.sum('valor', {
        where: {
          ...where,
          tipo: 'receita',
          status: STATUS_PAGAMENTO.PAGO
        }
      });

      const totalDespesas = await Pagamento.sum('valor', {
        where: {
          ...where,
          tipo: 'despesa',
          status: STATUS_PAGAMENTO.PAGO
        }
      });

      const receitasPendentes = await Pagamento.sum('valor', {
        where: {
          ...where,
          tipo: 'receita',
          status: STATUS_PAGAMENTO.PENDENTE
        }
      });

      const despesasPendentes = await Pagamento.sum('valor', {
        where: {
          ...where,
          tipo: 'despesa',
          status: STATUS_PAGAMENTO.PENDENTE
        }
      });

      // Calcular saldo
      const saldo = (totalReceitas || 0) - (totalDespesas || 0);

      return res.status(200).json({
        status: 'success',
        data: {
          saldo,
          receitas: {
            total: totalReceitas || 0,
            pendente: receitasPendentes || 0
          },
          despesas: {
            total: totalDespesas || 0,
            pendente: despesasPendentes || 0
          }
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Obter fluxo de caixa do condomínio
   * @route GET /api/financeiro/condominios/:condominioId/fluxo-caixa
   */
  obterFluxoCaixa: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { mes, ano } = req.query;

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Construir filtro por mês/ano
      const dataInicial = new Date(ano, mes - 1, 1);
      const dataFinal = new Date(ano, mes, 0);

      // Buscar movimentações do período
      const movimentacoes = await Pagamento.findAll({
        where: {
          condominio_id: condominioId,
          data_pagamento: {
            [sequelize.Op.between]: [dataInicial, dataFinal]
          },
          status: STATUS_PAGAMENTO.PAGO
        },
        attributes: [
          'data_pagamento',
          'tipo',
          'descricao',
          'valor',
          'observacoes'
        ],
        order: [['data_pagamento', 'ASC']]
      });

      // Calcular saldo inicial (movimentações até o início do período)
      const saldoInicial = await calcularSaldoInicial(condominioId, dataInicial);

      // Processar movimentações para calcular saldo diário
      const fluxoCaixa = processarFluxoCaixa(movimentacoes, saldoInicial);

      return res.status(200).json({
        status: 'success',
        data: {
          saldo_inicial: saldoInicial,
          movimentacoes: fluxoCaixa
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Obter previsão financeira do condomínio
   * @route GET /api/financeiro/condominios/:condominioId/previsao
   */
  obterPrevisaoFinanceira: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { meses = 3 } = req.query; // Previsão para os próximos X meses

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      const hoje = new Date();
      const dataLimite = new Date();
      dataLimite.setMonth(hoje.getMonth() + parseInt(meses));

      // Buscar receitas e despesas previstas
      const receitasPrevistas = await Pagamento.findAll({
        where: {
          condominio_id: condominioId,
          tipo: 'receita',
          data_vencimento: {
            [sequelize.Op.between]: [hoje, dataLimite]
          }
        },
        attributes: [
          'data_vencimento',
          'valor',
          'status'
        ]
      });

      const despesasPrevistas = await Pagamento.findAll({
        where: {
          condominio_id: condominioId,
          tipo: 'despesa',
          data_vencimento: {
            [sequelize.Op.between]: [hoje, dataLimite]
          }
        },
        attributes: [
          'data_vencimento',
          'valor',
          'status'
        ]
      });

      // Processar previsão por mês
      const previsao = processarPrevisaoFinanceira(
        receitasPrevistas,
        despesasPrevistas,
        meses
      );

      return res.status(200).json({
        status: 'success',
        data: previsao
      });
    } catch (error) {
      return next(error);
    }
  }
};

/**
 * Calcula o saldo inicial até uma data específica
 */
async function calcularSaldoInicial(condominioId, data) {
  const receitas = await Pagamento.sum('valor', {
    where: {
      condominio_id: condominioId,
      tipo: 'receita',
      status: STATUS_PAGAMENTO.PAGO,
      data_pagamento: {
        [sequelize.Op.lt]: data
      }
    }
  });

  const despesas = await Pagamento.sum('valor', {
    where: {
      condominio_id: condominioId,
      tipo: 'despesa',
      status: STATUS_PAGAMENTO.PAGO,
      data_pagamento: {
        [sequelize.Op.lt]: data
      }
    }
  });

  return (receitas || 0) - (despesas || 0);
}

/**
 * Processa movimentações para gerar fluxo de caixa
 */
function processarFluxoCaixa(movimentacoes, saldoInicial) {
  let saldoAtual = saldoInicial;
  
  return movimentacoes.map(mov => {
    saldoAtual += mov.tipo === 'receita' ? mov.valor : -mov.valor;
    
    return {
      data: mov.data_pagamento,
      tipo: mov.tipo,
      descricao: mov.descricao,
      valor: mov.valor,
      saldo: saldoAtual,
      observacoes: mov.observacoes
    };
  });
}

/**
 * Processa dados para gerar previsão financeira
 */
function processarPrevisaoFinanceira(receitas, despesas, meses) {
  const previsao = [];
  const hoje = new Date();

  for (let i = 0; i < meses; i++) {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const mesStr = mes.toISOString().substring(0, 7); // YYYY-MM

    const receitasMes = receitas.filter(r => 
      r.data_vencimento.toISOString().startsWith(mesStr)
    );

    const despesasMes = despesas.filter(d => 
      d.data_vencimento.toISOString().startsWith(mesStr)
    );

    const totalReceitas = receitasMes.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = despesasMes.reduce((sum, d) => sum + d.valor, 0);

    previsao.push({
      mes: mesStr,
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo_previsto: totalReceitas - totalDespesas
    });
  }

  return previsao;
}

module.exports = financeiroController;