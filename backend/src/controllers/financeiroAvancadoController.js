const { Pagamento, Condominio, Unidade } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const { STATUS_PAGAMENTO } = require('../utils/constants');
const dateUtils = require('../utils/dateUtils');
const formatters = require('../utils/formatters');

/**
 * Controller para gerenciamento financeiro avançado
 */
const financeiroAvancadoController = {
  /**
   * Obter orçamento do condomínio
   * @route GET /api/financeiro-avancado/condominios/:condominioId/orcamento
   */
  obterOrcamento: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { ano } = req.query;
      
      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Ano atual se não for especificado
      const anoFiltro = ano || new Date().getFullYear();
      
      // Buscar receitas e despesas do ano
      const dataInicial = new Date(anoFiltro, 0, 1); // 1º de janeiro
      const dataFinal = new Date(anoFiltro, 11, 31); // 31 de dezembro
      
      // Buscar pagamentos do período agrupados por categoria
      const pagamentos = await Pagamento.findAll({
        where: {
          condominio_id: condominioId,
          data_vencimento: {
            [sequelize.Op.between]: [dataInicial, dataFinal]
          }
        },
        attributes: [
          'tipo',
          'categoria',
          [sequelize.fn('SUM', sequelize.col('valor')), 'total']
        ],
        group: ['tipo', 'categoria']
      });
      
      // Organizar dados por tipo e categoria
      const orcamento = {
        receitas: {},
        despesas: {},
        total_receitas: 0,
        total_despesas: 0
      };
      
      pagamentos.forEach(item => {
        const { tipo, categoria, total } = item.dataValues;
        const valorTotal = parseFloat(total) || 0;
        
        if (tipo === 'receita') {
          orcamento.receitas[categoria] = valorTotal;
          orcamento.total_receitas += valorTotal;
        } else if (tipo === 'despesa') {
          orcamento.despesas[categoria] = valorTotal;
          orcamento.total_despesas += valorTotal;
        }
      });
      
      // Calcular saldo
      orcamento.saldo = orcamento.total_receitas - orcamento.total_despesas;
      
      return res.status(200).json({
        status: 'success',
        data: orcamento
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Obter análise de inadimplência
   * @route GET /api/financeiro-avancado/condominios/:condominioId/inadimplencia
   */
  analisarInadimplencia: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      
      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }
      
      // Buscar pagamentos atrasados
      const hoje = new Date();
      const pagamentosAtrasados = await Pagamento.findAll({
        where: {
          condominio_id: condominioId,
          tipo: 'receita',
          status: STATUS_PAGAMENTO.ATRASADO,
          data_vencimento: {
            [sequelize.Op.lt]: hoje
          }
        },
        include: [{
          model: Unidade,
          as: 'unidade',
          attributes: ['id', 'bloco', 'numero']
        }]
      });
      
      // Calcular estatísticas de inadimplência
      const totalUnidades = await Unidade.count({
        where: { condominio_id: condominioId }
      });
      
      // Agrupar por unidade para identificar inadimplentes recorrentes
      const inadimplenciasPorUnidade = {};
      let valorTotalInadimplencia = 0;
      
      pagamentosAtrasados.forEach(pagamento => {
        const unidadeId = pagamento.unidade_id;
        valorTotalInadimplencia += pagamento.valor_final;
        
        if (!inadimplenciasPorUnidade[unidadeId]) {
          inadimplenciasPorUnidade[unidadeId] = {
            unidade: pagamento.unidade ? 
              `${pagamento.unidade.bloco}-${pagamento.unidade.numero}` : 
              'Unidade não identificada',
            quantidade: 0,
            valor_total: 0,
            pagamentos: []
          };
        }
        
        inadimplenciasPorUnidade[unidadeId].quantidade += 1;
        inadimplenciasPorUnidade[unidadeId].valor_total += pagamento.valor_final;
        inadimplenciasPorUnidade[unidadeId].pagamentos.push({
          id: pagamento.id,
          descricao: pagamento.descricao,
          valor: pagamento.valor,
          valor_final: pagamento.valor_final,
          data_vencimento: pagamento.data_vencimento,
          dias_atraso: dateUtils.diferencaEmDias(pagamento.data_vencimento, hoje)
        });
      });
      
      // Converter para array e ordenar por valor total
      const unidadesInadimplentes = Object.values(inadimplenciasPorUnidade)
        .sort((a, b) => b.valor_total - a.valor_total);
      
      // Calcular taxa de inadimplência
      const unidadesComInadimplencia = Object.keys(inadimplenciasPorUnidade).length;
      const taxaInadimplencia = totalUnidades > 0 ? 
        (unidadesComInadimplencia / totalUnidades) * 100 : 0;
      
      return res.status(200).json({
        status: 'success',
        data: {
          total_unidades: totalUnidades,
          unidades_inadimplentes: unidadesComInadimplencia,
          taxa_inadimplencia: parseFloat(taxaInadimplencia.toFixed(2)),
          valor_total_inadimplencia: valorTotalInadimplencia,
          detalhamento: unidadesInadimplentes
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Gerenciar fundo de reserva
   * @route GET /api/financeiro-avancado/condominios/:condominioId/fundo-reserva
   */
  gerenciarFundoReserva: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      
      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }
      
      // Buscar pagamentos relacionados ao fundo de reserva
      const movimentacoesFundo = await Pagamento.findAll({
        where: {
          condominio_id: condominioId,
          categoria: 'fundo_reserva'
        },
        order: [['data_vencimento', 'DESC']]
      });
      
      // Calcular saldo atual do fundo
      let saldoFundo = 0;
      
      movimentacoesFundo.forEach(mov => {
        if (mov.tipo === 'receita' && mov.status === STATUS_PAGAMENTO.PAGO) {
          saldoFundo += mov.valor;
        } else if (mov.tipo === 'despesa' && mov.status === STATUS_PAGAMENTO.PAGO) {
          saldoFundo -= mov.valor;
        }
      });
      
      // Calcular estatísticas do fundo
      const totalReceitas = movimentacoesFundo
        .filter(mov => mov.tipo === 'receita' && mov.status === STATUS_PAGAMENTO.PAGO)
        .reduce((sum, mov) => sum + mov.valor, 0);
      
      const totalDespesas = movimentacoesFundo
        .filter(mov => mov.tipo === 'despesa' && mov.status === STATUS_PAGAMENTO.PAGO)
        .reduce((sum, mov) => sum + mov.valor, 0);
      
      // Calcular percentual do fundo em relação à arrecadação total
      const arrecadacaoTotal = await Pagamento.sum('valor', {
        where: {
          condominio_id: condominioId,
          tipo: 'receita',
          status: STATUS_PAGAMENTO.PAGO
        }
      });
      
      const percentualFundo = arrecadacaoTotal > 0 ? 
        (saldoFundo / arrecadacaoTotal) * 100 : 0;
      
      return res.status(200).json({
        status: 'success',
        data: {
          saldo_atual: saldoFundo,
          total_aportes: totalReceitas,
          total_utilizacoes: totalDespesas,
          percentual_arrecadacao: parseFloat(percentualFundo.toFixed(2)),
          movimentacoes: movimentacoesFundo.map(mov => ({
            id: mov.id,
            data: mov.data_vencimento,
            tipo: mov.tipo,
            descricao: mov.descricao,
            valor: mov.valor,
            status: mov.status
          }))
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Analisar custos por unidade
   * @route GET /api/financeiro-avancado/condominios/:condominioId/custos-unidade
   */
  analisarCustosPorUnidade: async (req, res, next) => {
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
      
      // Definir período de análise
      const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;
      const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();
      
      // Buscar total de despesas do período
      const dataInicial = new Date(anoAtual, mesAtual - 1, 1);
      const dataFinal = new Date(anoAtual, mesAtual, 0);
      
      const totalDespesas = await Pagamento.sum('valor', {
        where: {
          condominio_id: condominioId,
          tipo: 'despesa',
          data_vencimento: {
            [sequelize.Op.between]: [dataInicial, dataFinal]
          }
        }
      }) || 0;
      
      // Buscar unidades do condomínio
      const unidades = await Unidade.findAll({
        where: { condominio_id: condominioId },
        attributes: ['id', 'bloco', 'numero', 'area']
      });
      
      // Calcular área total do condomínio
      const areaTotal = unidades.reduce((sum, unidade) => sum + (unidade.area || 0), 0);
      
      // Calcular custo por m² e por unidade
      const custoPorMetroQuadrado = areaTotal > 0 ? totalDespesas / areaTotal : 0;
      
      // Calcular custo proporcional por unidade
      const custosPorUnidade = unidades.map(unidade => {
        const area = unidade.area || 0;
        const custoProporcional = custoPorMetroQuadrado * area;
        const percentualCusto = totalDespesas > 0 ? (custoProporcional / totalDespesas) * 100 : 0;
        
        return {
          unidade_id: unidade.id,
          identificacao: `${unidade.bloco}-${unidade.numero}`,
          area,
          custo_proporcional: parseFloat(custoProporcional.toFixed(2)),
          percentual: parseFloat(percentualCusto.toFixed(2))
        };
      }).sort((a, b) => b.custo_proporcional - a.custo_proporcional);
      
      return res.status(200).json({
        status: 'success',
        data: {
          periodo: `${mesAtual}/${anoAtual}`,
          total_despesas: totalDespesas,
          area_total: areaTotal,
          custo_por_metro_quadrado: parseFloat(custoPorMetroQuadrado.toFixed(2)),
          custos_por_unidade: custosPorUnidade
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Analisar tendências financeiras
   * @route GET /api/financeiro-avancado/condominios/:condominioId/tendencias 
   */
  analisarTendencias: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { periodo = 12 } = req.query; // Período em meses para análise
      
      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }
      
      // Definir período de análise
      const hoje = new Date();
      const dataFinal = new Date(hoje.getFullYear(), hoje.getMonth(), 0); // Último dia do mês anterior
      const dataInicial = new Date(dataFinal);
      dataInicial.setMonth(dataInicial.getMonth() - parseInt(periodo)); // Voltar X meses
      
      // Buscar pagamentos do período agrupados por mês
      const pagamentos = await Pagamento.findAll({
        where: {
          condominio_id: condominioId,
          data_vencimento: {
            [sequelize.Op.between]: [dataInicial, dataFinal]
          },
          status: STATUS_PAGAMENTO.PAGO
        },
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('data_vencimento')), 'ano'],
          [sequelize.fn('MONTH', sequelize.col('data_vencimento')), 'mes'],
          'tipo',
          [sequelize.fn('SUM', sequelize.col('valor')), 'total']
        ],
        group: [
          sequelize.fn('YEAR', sequelize.col('data_vencimento')),
          sequelize.fn('MONTH', sequelize.col('data_vencimento')),
          'tipo'
        ],
        order: [
          [sequelize.fn('YEAR', sequelize.col('data_vencimento')), 'ASC'],
          [sequelize.fn('MONTH', sequelize.col('data_vencimento')), 'ASC']
        ]
      });
      
      // Organizar dados por mês
      const tendencias = {};
      const mesesAnalisados = [];
      
      // Inicializar estrutura de meses
      for (let i = 0; i < parseInt(periodo); i++) {
        const data = new Date(dataInicial);
        data.setMonth(dataInicial.getMonth() + i);
        const ano = data.getFullYear();
        const mes = data.getMonth() + 1;
        const chave = `${ano}-${mes.toString().padStart(2, '0')}`;
        
        mesesAnalisados.push({
          chave,
          rotulo: `${mes.toString().padStart(2, '0')}/${ano}`
        });
        
        tendencias[chave] = {
          receitas: 0,
          despesas: 0,
          saldo: 0
        };
      }
      
      // Preencher com dados reais
      pagamentos.forEach(item => {
        const { ano, mes, tipo, total } = item.dataValues;
        const chave = `${ano}-${mes.toString().padStart(2, '0')}`;
        const valorTotal = parseFloat(total) || 0;
        
        if (tendencias[chave]) {
          if (tipo === 'receita') {
            tendencias[chave].receitas += valorTotal;
          } else if (tipo === 'despesa') {
            tendencias[chave].despesas += valorTotal;
          }
          
          tendencias[chave].saldo = tendencias[chave].receitas - tendencias[chave].despesas;
        }
      });
      
      // Calcular médias e tendências
      const mediaDespesas = calcularMedia(Object.values(tendencias).map(t => t.despesas));
      const mediaReceitas = calcularMedia(Object.values(tendencias).map(t => t.receitas));
      
      // Analisar tendência de crescimento/queda
      const tendenciaDespesas = analisarTendenciaCrescimento(
        Object.values(tendencias).map(t => t.despesas)
      );
      
      const tendenciaReceitas = analisarTendenciaCrescimento(
        Object.values(tendencias).map(t => t.receitas)
      );
      
      // Preparar dados para o gráfico
      const dadosGrafico = mesesAnalisados.map(mes => ({
        mes: mes.rotulo,
        receitas: formatters.arredondarDecimal(tendencias[mes.chave].receitas, 2),
        despesas: formatters.arredondarDecimal(tendencias[mes.chave].despesas, 2),
        saldo: formatters.arredondarDecimal(tendencias[mes.chave].saldo, 2)
      }));
      
      return res.status(200).json({
        status: 'success',
        data: {
          periodo: `${mesesAnalisados[0].rotulo} a ${mesesAnalisados[mesesAnalisados.length - 1].rotulo}`,
          media_mensal: {
            receitas: formatters.arredondarDecimal(mediaReceitas, 2),
            despesas: formatters.arredondarDecimal(mediaDespesas, 2),
            saldo: formatters.arredondarDecimal(mediaReceitas - mediaDespesas, 2)
          },
          tendencia: {
            receitas: tendenciaReceitas,
            despesas: tendenciaDespesas
          },
          dados: dadosGrafico
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};

/**
 * Calcula a média de um array de números
 */
function calcularMedia(valores) {
  if (!valores || valores.length === 0) return 0;
  const soma = valores.reduce((acc, val) => acc + val, 0);
  return soma / valores.length;
}

/**
 * Analisa a tendência de crescimento ou queda em uma série de valores
 */
function analisarTendenciaCrescimento(valores) {
  if (!valores || valores.length < 2) return 'estável';
  
  // Calcular a inclinação da linha de tendência
  let somaX = 0;
  let somaY = 0;
  let somaXY = 0;
  let somaXQuadrado = 0;
  
  for (let i = 0; i < valores.length; i++) {
    somaX += i;
    somaY += valores[i];
    somaXY += i * valores[i];
    somaXQuadrado += i * i;
  }
  
  const n = valores.length;
  const inclinacao = (n * somaXY - somaX * somaY) / (n * somaXQuadrado - somaX * somaX);
  
  // Determinar tendência com base na inclinação
  if (inclinacao > 0.05 * calcularMedia(valores)) {
    return 'crescimento';
  } else if (inclinacao < -0.05 * calcularMedia(valores)) {
    return 'queda';
  } else {
    return 'estável';
  }
}

module.exports = financeiroAvancadoController;
