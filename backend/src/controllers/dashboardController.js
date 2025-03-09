const { Condominio, Unidade, Pagamento, Manutencao, Contrato, Usuario } = require('../models');
const sequelize = require('../config/database');

/**
 * Controller para o dashboard do sistema
 */
const dashboardController = {
  /**
   * Obter dados para o dashboard principal
   * @route GET /api/dashboard
   */
  obterDados: async (req, res, next) => {
    try {
      const { condominio_id } = req.query;

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

      // Data atual e datas para filtros
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      const proximosMeses = new Date(hoje.getFullYear(), hoje.getMonth() + 3, 0);

      // Resumo financeiro do mês atual
      const pagamentosMes = await Pagamento.findAll({
        where: {
          condominio_id,
          data_vencimento: {
            [sequelize.Op.between]: [inicioMes, fimMes]
          }
        },
        attributes: [
          'status',
          [sequelize.fn('SUM', sequelize.col('valor')), 'total']
        ],
        group: ['status']
      });

      // Formatar dados financeiros
      const financeiro = {
        recebido: 0,
        pendente: 0,
        atrasado: 0
      };

      pagamentosMes.forEach(item => {
        const valor = parseFloat(item.getDataValue('total') || 0);
        if (item.status === 'pago') {
          financeiro.recebido = valor;
        } else if (item.status === 'pendente') {
          financeiro.pendente = valor;
        } else if (item.status === 'atrasado') {
          financeiro.atrasado = valor;
        }
      });

      // Contagem de unidades
      const totalUnidades = await Unidade.count({
        where: { condominio_id }
      });

      // Contagem de manutenções por status
      const manutencoes = await Manutencao.findAll({
        where: { condominio_id },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['status']
      });

      // Formatar dados de manutenções
      const manutencoesStatus = {
        pendente: 0,
        em_andamento: 0,
        concluido: 0,
        cancelado: 0
      };

      manutencoes.forEach(item => {
        const total = parseInt(item.getDataValue('total') || 0);
        manutencoesStatus[item.status] = total;
      });

      // Contratos próximos do vencimento
      const contratosVencendo = await Contrato.findAll({
        where: {
          condominio_id,
          status: 'ativo',
          data_fim: {
            [sequelize.Op.lte]: proximosMeses,
            [sequelize.Op.gte]: hoje
          }
        },
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome']
          }
        ],
        order: [['data_fim', 'ASC']],
        limit: 5
      });

      // Pagamentos recentes
      const pagamentosRecentes = await Pagamento.findAll({
        where: {
          condominio_id,
          status: 'pago',
          data_pagamento: {
            [sequelize.Op.not]: null
          }
        },
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'identificacao']
          }
        ],
        order: [['data_pagamento', 'DESC']],
        limit: 5
      });

      // Inadimplência
      const totalInadimplencia = await Pagamento.count({
        where: {
          condominio_id,
          status: 'atrasado',
          data_vencimento: {
            [sequelize.Op.lt]: hoje
          }
        }
      });

      // Retornar dados do dashboard
      return res.status(200).json({
        status: 'success',
        data: {
          condominio: {
            id: condominio.id,
            nome: condominio.nome
          },
          resumo: {
            total_unidades: totalUnidades,
            inadimplencia: totalInadimplencia,
            manutencoes_pendentes: manutencoesStatus.pendente + manutencoesStatus.em_andamento,
            contratos_vencendo: contratosVencendo.length
          },
          financeiro,
          manutencoes: manutencoesStatus,
          contratos_vencendo: contratosVencendo.map(c => ({
            id: c.id,
            numero_contrato: c.numero_contrato,
            objeto: c.objeto,
            fornecedor: c.fornecedor ? c.fornecedor.nome : 'N/A',
            data_fim: c.data_fim,
            valor: parseFloat(c.valor || 0)
          })),
          pagamentos_recentes: pagamentosRecentes.map(p => ({
            id: p.id,
            unidade: p.unidade ? p.unidade.identificacao : 'N/A',
            valor: parseFloat(p.valor),
            data_pagamento: p.data_pagamento,
            tipo: p.tipo
          }))
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Obter estatísticas gerais para administradores
   * @route GET /api/dashboard/admin
   */
  estatisticasAdmin: async (req, res, next) => {
    try {
      // Contagem de condomínios
      const totalCondominios = await Condominio.count();

      // Contagem de unidades
      const totalUnidades = await Unidade.count();

      // Contagem de usuários
      const totalUsuarios = await Usuario.count();

      // Contagem de usuários por perfil
      const usuariosPorPerfil = await Usuario.findAll({
        attributes: [
          'perfil',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['perfil']
      });

      // Formatar dados de usuários por perfil
      const perfilUsuarios = {};
      usuariosPorPerfil.forEach(item => {
        perfilUsuarios[item.perfil] = parseInt(item.getDataValue('total') || 0);
      });

      // Condomínios mais recentes
      const condominiosRecentes = await Condominio.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'nome', 'cidade', 'estado', 'createdAt']
      });

      // Retornar estatísticas
      return res.status(200).json({
        status: 'success',
        data: {
          resumo: {
            total_condominios: totalCondominios,
            total_unidades: totalUnidades,
            total_usuarios: totalUsuarios
          },
          usuarios_por_perfil: perfilUsuarios,
          condominios_recentes: condominiosRecentes
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = dashboardController;