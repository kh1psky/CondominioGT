const { Pagamento, Unidade, Condominio, Usuario } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const dateUtils = require('../utils/dateUtils');
const helpers = require('../utils/helpers');
const formatters = require('../utils/formatters');
const { STATUS_PAGAMENTO, TIPOS_PAGAMENTO } = require('../utils/constants');

/**
 * Controller para gerenciamento de pagamentos
 */
const pagamentoController = {
  /**
   * Listar todos os pagamentos (com filtros)
   * @route GET /api/pagamentos
   */
  listar: async (req, res, next) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        condominio_id, 
        unidade_id, 
        status,
        tipo,
        data_inicial,
        data_final,
        search
      } = req.query;
      
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = {};
      
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }
      
      if (unidade_id) {
        where.unidade_id = unidade_id;
      }
      
      if (status) {
        where.status = status;
      }
      
      if (tipo) {
        where.tipo = tipo;
      }
      
      // Filtro por período de datas
      if (data_inicial || data_final) {
        where.data_vencimento = {};
        
        if (data_inicial) {
          where.data_vencimento[sequelize.Op.gte] = dateUtils.formatarDataIso(data_inicial);
        }
        
        if (data_final) {
          where.data_vencimento[sequelize.Op.lte] = dateUtils.formatarDataIso(data_final);
        }
      }
      
      // Busca por descrição
      if (search) {
        where.descricao = {
          [sequelize.Op.like]: `%${search}%`
        };
      }

      // Buscar pagamentos com paginação
      const { count, rows } = await Pagamento.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_vencimento', 'DESC']],
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'bloco', 'numero', 'condominio_id'],
            include: [
              {
                model: Condominio,
                as: 'condominio',
                attributes: ['id', 'nome']
              },
              {
                model: Usuario,
                as: 'morador',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ]
      });

      return res.status(200).json({
        status: 'success',
        data: rows,
        meta: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Obter detalhes de um pagamento específico
   * @route GET /api/pagamentos/:id
   */
  obter: async (req, res, next) => {
    try {
      const { id } = req.params;

      const pagamento = await Pagamento.findByPk(id, {
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'bloco', 'numero', 'condominio_id'],
            include: [
              {
                model: Condominio,
                as: 'condominio',
                attributes: ['id', 'nome']
              },
              {
                model: Usuario,
                as: 'morador',
                attributes: ['id', 'nome', 'email']
              },
              {
                model: Usuario,
                as: 'proprietario',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ]
      });

      if (!pagamento) {
        return res.status(404).json({
          status: 'error',
          message: 'Pagamento não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: pagamento
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Criar novo pagamento
   * @route POST /api/pagamentos
   */
  criar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        unidade_id,
        condominio_id,
        descricao,
        valor,
        data_vencimento,
        tipo = 'boleto',
        status = STATUS_PAGAMENTO.PENDENTE,
        observacoes,
        comprovante,
        data_pagamento
      } = req.body;

      // Verificar se o condomínio existe
      if (condominio_id) {
        const condominio = await Condominio.findByPk(condominio_id, { transaction });
        if (!condominio) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Condomínio não encontrado'
          });
        }
      }

      // Verificar se a unidade existe e pertence ao condomínio
      if (unidade_id) {
        const unidade = await Unidade.findByPk(unidade_id, { transaction });
        if (!unidade) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Unidade não encontrada'
          });
        }

        // Se condomínio_id foi informado, verificar se a unidade pertence a ele
        if (condominio_id && unidade.condominio_id !== parseInt(condominio_id)) {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'A unidade não pertence ao condomínio informado'
          });
        }
      }

      // Calcular juros e multa se estiver em atraso
      let valor_final = parseFloat(valor);
      let juros = 0;
      let multa = 0;

      if (status === STATUS_PAGAMENTO.ATRASADO) {
        const dataVencimento = new Date(data_vencimento);
        const hoje = new Date();
        const diasAtraso = dateUtils.diferencaEmDias(dataVencimento, hoje);

        if (diasAtraso > 0) {
          // Aplicar 2% de multa
          multa = helpers.calcularMulta(valor, 0.02);
          
          // Aplicar 1% de juros ao mês (0.033% ao dia)
          juros = helpers.calcularJurosSimples(valor, 0.01, diasAtraso);
          
          valor_final = valor + multa + juros;
        }
      }

      // Criar o pagamento
      const novoPagamento = await Pagamento.create({
        unidade_id,
        condominio_id: condominio_id || null,
        descricao,
        valor,
        valor_final,
        juros,
        multa,
        data_vencimento,
        data_pagamento,
        tipo,
        status,
        observacoes,
        comprovante
      }, { transaction });

      await transaction.commit();

      logger.info(`Novo pagamento criado: ID ${novoPagamento.id}, Valor ${formatters.formatarMoeda(valor)}`);

      return res.status(201).json({
        status: 'success',
        message: 'Pagamento criado com sucesso',
        data: novoPagamento
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Atualizar um pagamento
   * @route PUT /api/pagamentos/:id
   */
  atualizar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        descricao,
        valor,
        data_vencimento,
        tipo,
        status,
        observacoes,
        comprovante,
        data_pagamento
      } = req.body;

      // Verificar se o pagamento existe
      const pagamento = await Pagamento.findByPk(id, { transaction });
      if (!pagamento) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Pagamento não encontrado'
        });
      }

      // Calcular juros e multa se status for atualizado para atrasado
      let valor_final = pagamento.valor_final;
      let juros = pagamento.juros;
      let multa = pagamento.multa;

      if (status === STATUS_PAGAMENTO.ATRASADO && status !== pagamento.status) {
        const dataVencimento = data_vencimento ? new Date(data_vencimento) : new Date(pagamento.data_vencimento);
        const hoje = new Date();
        const diasAtraso = dateUtils.diferencaEmDias(dataVencimento, hoje);

        if (diasAtraso > 0) {
          const valorBase = valor || pagamento.valor;
          
          // Aplicar 2% de multa
          multa = helpers.calcularMulta(valorBase, 0.02);
          
          // Aplicar 1% de juros ao mês (0.033% ao dia)
          juros = helpers.calcularJurosSimples(valorBase, 0.01, diasAtraso);
          
          valor_final = parseFloat(valorBase) + multa + juros;
        }
      }
      
      // Se status for alterado para pago, registra data de pagamento
      if (status === STATUS_PAGAMENTO.PAGO && pagamento.status !== STATUS_PAGAMENTO.PAGO) {
        if (!data_pagamento) {
          pagamento.data_pagamento = new Date();
        }
        
        // Resetar juros e multa se pago e não tiver data de pagamento (pagamento em dia)
        if (!pagamento.data_pagamento) {
          juros = 0;
          multa = 0;
          valor_final = valor || pagamento.valor;
        }
      }

      // Atualizar os campos fornecidos
      if (descricao !== undefined) pagamento.descricao = descricao;
      if (valor !== undefined) {
        pagamento.valor = valor;
        pagamento.valor_final = valor_final;
      }
      if (data_vencimento !== undefined) pagamento.data_vencimento = data_vencimento;
      if (data_pagamento !== undefined) pagamento.data_pagamento = data_pagamento;
      if (tipo !== undefined) pagamento.tipo = tipo;
      if (status !== undefined) pagamento.status = status;
      if (observacoes !== undefined) pagamento.observacoes = observacoes;
      if (comprovante !== undefined) pagamento.comprovante = comprovante;
      
      pagamento.juros = juros;
      pagamento.multa = multa;

      await pagamento.save({ transaction });
      await transaction.commit();

      logger.info(`Pagamento atualizado: ID ${id}, Status: ${status}`);

      return res.status(200).json({
        status: 'success',
        message: 'Pagamento atualizado com sucesso',
        data: pagamento
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Excluir um pagamento
   * @route DELETE /api/pagamentos/:id
   */
  excluir: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar se o pagamento existe
      const pagamento = await Pagamento.findByPk(id, { transaction });
      if (!pagamento) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Pagamento não encontrado'
        });
      }

      // Excluir o pagamento
      await pagamento.destroy({ transaction });

      await transaction.commit();

      logger.info(`Pagamento excluído: ID ${id}`);

      return res.status(200).json({
        status: 'success',
        message: 'Pagamento excluído com sucesso'
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Listar pagamentos de uma unidade
   * @route GET /api/unidades/:unidadeId/pagamentos
   */
  listarPorUnidade: async (req, res, next) => {
    try {
      const { unidadeId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      // Verificar se a unidade existe
      const unidade = await Unidade.findByPk(unidadeId);
      if (!unidade) {
        return res.status(404).json({
          status: 'error',
          message: 'Unidade não encontrada'
        });
      }

      // Construir query de filtro
      const where = { unidade_id: unidadeId };
      
      if (status) {
        where.status = status;
      }

      // Buscar pagamentos
      const { count, rows } = await Pagamento.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_vencimento', 'DESC']]
      });

      return res.status(200).json({
        status: 'success',
        data: rows,
        meta: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Listar pagamentos de um condomínio
   * @route GET /api/condominios/:condominioId/pagamentos
   */
  listarPorCondominio: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { page = 1, limit = 10, status, unidade_id, tipo } = req.query;
      const offset = (page - 1) * limit;

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Construir query de filtro
      const where = { condominio_id: condominioId };
      
      if (status) {
        where.status = status;
      }
      
      if (unidade_id) {
        where.unidade_id = unidade_id;
      }
      
      if (tipo) {
        where.tipo = tipo;
      }

      // Buscar pagamentos
      const { count, rows } = await Pagamento.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_vencimento', 'DESC']],
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'bloco', 'numero'],
            include: [
              {
                model: Usuario,
                as: 'morador',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ]
      });

      return res.status(200).json({
        status: 'success',
        data: rows,
        meta: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Registrar pagamento
   * @route POST /api/pagamentos/:id/registrar
   */
  registrarPagamento: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { 
        data_pagamento = new Date(), 
        tipo,
        comprovante,
        observacoes 
      } = req.body;

      // Verificar se o pagamento existe
      const pagamento = await Pagamento.findByPk(id, { transaction });
      if (!pagamento) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Pagamento não encontrado'
        });
      }

      // Verificar se o pagamento já foi pago
      if (pagamento.status === STATUS_PAGAMENTO.PAGO) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Este pagamento já foi registrado como pago'
        });
      }

      // Verificar se o pagamento foi cancelado
      if (pagamento.status === STATUS_PAGAMENTO.CANCELADO) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Não é possível registrar pagamento para um boleto cancelado'
        });
      }

      // Registrar o pagamento
      pagamento.status = STATUS_PAGAMENTO.PAGO;
      pagamento.data_pagamento = data_pagamento;
      
      if (tipo) {
        pagamento.tipo = tipo;
      }
      
      if (comprovante) {
        pagamento.comprovante = comprovante;
      }
      
      if (observacoes) {
        pagamento.observacoes = observacoes;
      }

      await pagamento.save({ transaction });
      await transaction.commit();

      logger.info(`Pagamento registrado: ID ${id}, Valor ${formatters.formatarMoeda(pagamento.valor_final)}`);

      return res.status(200).json({
        status: 'success',
        message: 'Pagamento registrado com sucesso',
        data: pagamento
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Cancelar pagamento
   * @route POST /api/pagamentos/:id/cancelar
   */
  cancelarPagamento: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { motivo } = req.body;

      // Verificar se o pagamento existe
      const pagamento = await Pagamento.findByPk(id, { transaction });
      if (!pagamento) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Pagamento não encontrado'
        });
      }

      // Verificar se o pagamento já foi cancelado
      if (pagamento.status === STATUS_PAGAMENTO.CANCELADO) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Este pagamento já foi cancelado'
        });
      }

      // Verificar se o pagamento já foi pago
      if (pagamento.status === STATUS_PAGAMENTO.PAGO) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Não é possível cancelar um pagamento já realizado'
        });
      }

      // Cancelar o pagamento
      pagamento.status = STATUS_PAGAMENTO.CANCELADO;
      
      if (motivo) {
        pagamento.observacoes = motivo;
      }

      await pagamento.save({ transaction });
      await transaction.commit();

      logger.info(`Pagamento cancelado: ID ${id}`);

      return res.status(200).json({
        status: 'success',
        message: 'Pagamento cancelado com sucesso',
        data: pagamento
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Gerar relatório de pagamentos
   * @route GET /api/pagamentos/relatorio
   */
  gerarRelatorio: async (req, res, next) => {
    try {
      const { 
        condominio_id, 
        unidade_id, 
        status, 
        data_inicial, 
        data_final,
        agrupar_por = 'mes' // mes, unidade, status
      } = req.query;

      // Construir query de filtro
      const where = {};
      
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }
      
      if (unidade_id) {
        where.unidade_id = unidade_id;
      }
      
      if (status) {
        where.status = status;
      }
      
      // Filtro por período de datas
      if (data_inicial || data_final) {
        where.data_vencimento = {};
        
        if (data_inicial) {
          where.data_vencimento[sequelize.Op.gte] = dateUtils.formatarDataIso(data_inicial);
        }
        
        if (data_final) {
          where.data_vencimento[sequelize.Op.lte] = dateUtils.formatarDataIso(data_final);
        }
      }

      // Buscar pagamentos
      const pagamentos = await Pagamento.findAll({
        where,
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'bloco', 'numero'],
            include: [
              {
                model: Condominio,
                as: 'condominio',
                attributes: ['id', 'nome']
              }
            ]
          }
        ],
        order: [['data_vencimento', 'ASC']]
      });

      // Agrupar pagamentos conforme solicitado
      let relatorio = {
        totalPagamentos: pagamentos.length,
        totalValor: 0,
        totalPago: 0,
        totalPendente: 0,
        totalAtrasado: 0,
        totalCancelado: 0,
        agrupamento: []
      };

      // Totais gerais
      pagamentos.forEach(pag => {
        relatorio.totalValor += parseFloat(pag.valor);
        
        switch (pag.status) {
          case STATUS_PAGAMENTO.PAGO:
            relatorio.totalPago += parseFloat(pag.valor_final || pag.valor);
            break;
          case STATUS_PAGAMENTO.PENDENTE:
            relatorio.totalPendente += parseFloat(pag.valor);
            break;
          case STATUS_PAGAMENTO.ATRASADO:
            relatorio.totalAtrasado += parseFloat(pag.valor_final || pag.valor);
            break;
          case STATUS_PAGAMENTO.CANCELADO:
            relatorio.totalCancelado += parseFloat(pag.valor);
            break;
        }
      });

      // Agrupar dados
      switch (agrupar_por) {
        case 'mes':
          // Agrupar por mês
          const meses = {};
          
          pagamentos.forEach(pag => {
            const data = new Date(pag.data_vencimento);
            const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            
            if (!meses[chave]) {
              meses[chave] = {
                id: chave,
                nome: nomeMes,
                total: 0,
                quantidade: 0,
                totalPago: 0,
                quantidadePago: 0,
                totalPendente: 0,
                quantidadePendente: 0,
                totalAtrasado: 0,
                quantidadeAtrasado: 0
              };
            }
            
            meses[chave].total += parseFloat(pag.valor);
            meses[chave].quantidade += 1;
            
            switch (pag.status) {
              case STATUS_PAGAMENTO.PAGO:
                meses[chave].totalPago += parseFloat(pag.valor_final || pag.valor);
                meses[chave].quantidadePago += 1;
                break;
              case STATUS_PAGAMENTO.PENDENTE:
                meses[chave].totalPendente += parseFloat(pag.valor);
                meses[chave].quantidadePendente += 1;
                break;
              case STATUS_PAGAMENTO.ATRASADO:
                meses[chave].totalAtrasado += parseFloat(pag.valor_final || pag.valor);
                meses[chave].quantidadeAtrasado += 1;
                break;
            }
          });
          
          relatorio.agrupamento = Object.values(meses);
          break;
          
        case 'unidade':
          // Agrupar por unidade
          const unidades = {};
          
          pagamentos.forEach(pag => {
            if (!pag.unidade) return;
            
            const unidadeInfo = pag.unidade;
            const chave = unidadeInfo.id;
            const nomeUnidade = `${unidadeInfo.condominio?.nome || 'Condomínio'} - ${unidadeInfo.bloco ? unidadeInfo.bloco + '-' : ''}${unidadeInfo.numero}`;
            
            if (!unidades[chave]) {
              unidades[chave] = {
                id: chave,
                nome: nomeUnidade,
                total: 0,
                quantidade: 0,
                totalPago: 0,
                quantidadePago: 0,
                totalPendente: 0,
                quantidadePendente: 0,
                totalAtrasado: 0,
                quantidadeAtrasado: 0
              };
            }
            
            unidades[chave].total += parseFloat(pag.valor);
            unidades[chave].quantidade += 1;
            
            switch (pag.status) {
              case STATUS_PAGAMENTO.PAGO:
                unidades[chave].totalPago += parseFloat(pag.valor_final || pag.valor);
                unidades[chave].quantidadePago += 1;
                break;
              case STATUS_PAGAMENTO.PENDENTE:
                unidades[chave].totalPendente += parseFloat(pag.valor);
                unidades[chave].quantidadePendente += 1;
                break;
              case STATUS_PAGAMENTO.ATRASADO:
                unidades[chave].totalAtrasado += parseFloat(pag.valor_final || pag.valor);
                unidades[chave].quantidadeAtrasado += 1;
                break;
            }
          });
          
          relatorio.agrupamento = Object.values(unidades);
          break;
          
        case 'status':
          // Agrupar por status
          const statusGrupo = {};
          
          pagamentos.forEach(pag => {
            const chave = pag.status;
            let nomeStatus;
            
            switch (chave) {
              case STATUS_PAGAMENTO.PAGO:
                nomeStatus = 'Pagos';
                break;
              case STATUS_PAGAMENTO.PENDENTE:
                nomeStatus = 'Pendentes';
                break;
              case STATUS_PAGAMENTO.ATRASADO:
                nomeStatus = 'Atrasados';
                break;
              case STATUS_PAGAMENTO.CANCELADO:
                nomeStatus = 'Cancelados';
                break;
              default:
                nomeStatus = 'Outros';
            }
            
            if (!statusGrupo[chave]) {
              statusGrupo[chave] = {
                id: chave,
                nome: nomeStatus,
                total: 0,
                quantidade: 0
              };
            }
            
            statusGrupo[chave].total += parseFloat(pag.valor_final || pag.valor);
            statusGrupo[chave].quantidade += 1;
          });
          
          relatorio.agrupamento = Object.values(statusGrupo);
          break;
          
        default:
          // Sem agrupamento, retornar lista completa
          relatorio.agrupamento = pagamentos;
      }

      return res.status(200).json({
        status: 'success',
        data: relatorio
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = pagamentoController;