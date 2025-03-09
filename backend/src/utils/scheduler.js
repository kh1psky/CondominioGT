const cron = require('node-cron');
const logger = require('../config/logger');
const backupService = require('../services/backupService');
const notificacaoService = require('../services/notificacaoService');
const { Contrato, Manutencao, Pagamento } = require('../models');
const sequelize = require('../config/database');

/**
 * Utilitário para agendamento de tarefas do sistema
 */
const scheduler = {
  /**
   * Inicializar todas as tarefas agendadas
   */
  inicializar: () => {
    logger.info('Inicializando agendador de tarefas do sistema');
    
    // Verificar se o agendamento está habilitado
    if (process.env.ENABLE_SCHEDULER !== 'true') {
      logger.info('Agendador de tarefas desabilitado por configuração');
      return;
    }
    
    // Iniciar todas as tarefas agendadas
    scheduler.agendarBackupDiario();
    scheduler.agendarVerificacaoContratos();
    scheduler.agendarVerificacaoPagamentos();
    scheduler.agendarVerificacaoManutencoes();
    
    logger.info('Agendador de tarefas inicializado com sucesso');
  },
  
  /**
   * Agendar backup diário do sistema
   */
  agendarBackupDiario: () => {
    // Executar todos os dias às 2h da manhã
    cron.schedule('0 2 * * *', async () => {
      logger.info('Iniciando backup diário automático');
      
      try {
        const resultado = await backupService.backupCompleto();
        logger.info(`Backup diário concluído com sucesso: ${resultado.diretorio}`);
        
        // Limpar backups antigos (manter apenas os últimos 7)
        const backupsDoBanco = await backupService.listarBackups('database');
        const backupsDeArquivos = await backupService.listarBackups('files');
        
        // Excluir backups de banco de dados mais antigos (manter os 7 mais recentes)
        if (backupsDoBanco.length > 7) {
          for (let i = 7; i < backupsDoBanco.length; i++) {
            await backupService.excluirBackup(backupsDoBanco[i].caminho);
          }
        }
        
        // Excluir backups de arquivos mais antigos (manter os 7 mais recentes)
        if (backupsDeArquivos.length > 7) {
          for (let i = 7; i < backupsDeArquivos.length; i++) {
            await backupService.excluirBackup(backupsDeArquivos[i].caminho);
          }
        }
      } catch (error) {
        logger.error(`Erro ao realizar backup diário: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'America/Sao_Paulo'
    });
    
    logger.info('Backup diário agendado com sucesso');
  },
  
  /**
   * Agendar verificação de contratos próximos do vencimento
   */
  agendarVerificacaoContratos: () => {
    // Executar todos os dias às 8h da manhã
    cron.schedule('0 8 * * *', async () => {
      logger.info('Iniciando verificação de contratos próximos do vencimento');
      
      try {
        const hoje = new Date();
        const trintaDiasDepois = new Date();
        trintaDiasDepois.setDate(hoje.getDate() + 30);
        
        // Buscar contratos que vencem nos próximos 30 dias
        const contratos = await Contrato.findAll({
          where: {
            status: 'ativo',
            data_fim: {
              [sequelize.Op.between]: [hoje, trintaDiasDepois]
            },
            notificar_vencimento: true
          },
          include: [
            {
              model: Fornecedor,
              as: 'fornecedor',
              attributes: ['id', 'nome']
            },
            {
              model: Condominio,
              as: 'condominio',
              attributes: ['id', 'nome']
            }
          ]
        });
        
        // Enviar notificações para cada contrato
        for (const contrato of contratos) {
          const diasRestantes = Math.ceil((contrato.data_fim - hoje) / (1000 * 60 * 60 * 24));
          
          // Verificar se já notificamos sobre este contrato recentemente
          // Aqui poderia ser implementada uma lógica para evitar notificações duplicadas
          
          // Criar dados da notificação
          const dadosNotificacao = {
            titulo: `Contrato próximo do vencimento - ${contrato.numero_contrato}`,
            mensagem: `O contrato ${contrato.numero_contrato} com ${contrato.fornecedor.nome} vencerá em ${diasRestantes} dias (${new Date(contrato.data_fim).toLocaleDateString('pt-BR')}).`,
            tipo: 'alerta',
            prioridade: 'alta',
            dados_adicionais: {
              contrato_id: contrato.id,
              fornecedor: contrato.fornecedor.nome,
              data_vencimento: contrato.data_fim,
              dias_restantes: diasRestantes
            }
          };
          
          // Enviar notificação para o condomínio
          await notificacaoService.notificarCondominio(
            dadosNotificacao,
            contrato.condominio_id,
            true, // Enviar email
            true  // Enviar push
          );
          
          logger.info(`Notificação de vencimento enviada para contrato ${contrato.id}`);
        }
        
        logger.info(`Verificação de contratos concluída. ${contratos.length} contratos notificados.`);
      } catch (error) {
        logger.error(`Erro ao verificar contratos: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'America/Sao_Paulo'
    });
    
    logger.info('Verificação de contratos agendada com sucesso');
  },
  
  /**
   * Agendar verificação de pagamentos em atraso
   */
  agendarVerificacaoPagamentos: () => {
    // Executar todos os dias às 7h da manhã
    cron.schedule('0 7 * * *', async () => {
      logger.info('Iniciando verificação de pagamentos em atraso');
      
      try {
        const hoje = new Date();
        
        // Buscar pagamentos que venceram e ainda estão como 'pendente'
        const pagamentos = await Pagamento.findAll({
          where: {
            status: 'pendente',
            data_vencimento: {
              [sequelize.Op.lt]: hoje
            }
          },
          include: [
            {
              model: Unidade,
              as: 'unidade',
              include: [
                {
                  model: Condominio,
                  as: 'condominio',
                  attributes: ['id', 'nome']
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
        
        // Atualizar status para 'atrasado' e enviar notificações
        for (const pagamento of pagamentos) {
          // Atualizar status
          await pagamento.update({ status: 'atrasado' });
          
          // Verificar se há proprietário para notificar
          if (pagamento.unidade && pagamento.unidade.proprietario) {
            // Criar notificação
            const notificacao = await Notificacao.create({
              titulo: 'Pagamento em atraso',
              mensagem: `O pagamento de ${pagamento.descricao} no valor de ${formatarMoeda(pagamento.valor)} venceu em ${formatarData(pagamento.data_vencimento)}.`,
              tipo: 'alerta',
              prioridade: 'alta',
              status: 'nao_lida',
              data_criacao: new Date(),
              usuario_id: pagamento.unidade.proprietario.id,
              condominio_id: pagamento.unidade.condominio_id,
              dados_adicionais: JSON.stringify({
                pagamento_id: pagamento.id,
                valor: pagamento.valor,
                data_vencimento: pagamento.data_vencimento
              })
            });
            
            // Enviar email
            await notificacaoService.enviarPorEmail(notificacao.id);
            
            logger.info(`Notificação de pagamento atrasado enviada para usuário ${pagamento.unidade.proprietario.id}`);
          }
        }
        
        logger.info(`Verificação de pagamentos concluída. ${pagamentos.length} pagamentos atualizados para 'atrasado'.`);
      } catch (error) {
        logger.error(`Erro ao verificar pagamentos: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'America/Sao_Paulo'
    });
    
    logger.info('Verificação de pagamentos agendada com sucesso');
  },
  
  /**
   * Agendar verificação de manutenções programadas
   */
  agendarVerificacaoManutencoes: () => {
    // Executar todos os dias às 6h da manhã
    cron.schedule('0 6 * * *', async () => {
      logger.info('Iniciando verificação de manutenções programadas');
      
      try {
        const hoje = new Date();
        const amanha = new Date();
        amanha.setDate(hoje.getDate() + 1);
        
        // Buscar manutenções agendadas para amanhã
        const manutencoes = await Manutencao.findAll({
          where: {
            status: 'agendada',
            data_agendamento: {
              [sequelize.Op.between]: [hoje, amanha]
            }
          },
          include: [
            {
              model: Condominio,
              as: 'condominio',
              attributes: ['id', 'nome']
            },
            {
              model: Fornecedor,
              as: 'fornecedor',
              attributes: ['id', 'nome', 'telefone', 'email']
            }
          ]
        });
        
        // Enviar notificações para cada manutenção
        for (const manutencao of manutencoes) {
          // Criar dados da notificação
          const dadosNotificacao = {
            titulo: `Manutenção agendada para amanhã - ${manutencao.titulo}`,
            mensagem: `A manutenção "${manutencao.titulo}" está agendada para amanhã (${new Date(manutencao.data_agendamento).toLocaleDateString('pt-BR')}).`,
            tipo: 'lembrete',
            prioridade: 'media',
            dados_adicionais: {
              manutencao_id: manutencao.id,
              local: manutencao.local,
              fornecedor: manutencao.fornecedor ? manutencao.fornecedor.nome : 'Não definido',
              contato: manutencao.fornecedor ? manutencao.fornecedor.telefone : ''
            }
          };
          
          // Enviar notificação para o condomínio
          await notificacaoService.notificarCondominio(
            dadosNotificacao,
            manutencao.condominio_id,
            true, // Enviar email
            true  // Enviar push
          );
          
          logger.info(`Notificação de manutenção agendada enviada para condomínio ${manutencao.condominio_id}`);
        }
        
        logger.info(`Verificação de manutenções concluída. ${manutencoes.length} manutenções notificadas.`);
      } catch (error) {
        logger.error(`Erro ao verificar manutenções: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'America/Sao_Paulo'
    });
    
    logger.info('Verificação de manutenções agendada com sucesso');
  }
};

module.exports = scheduler;