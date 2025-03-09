const { Notificacao, Usuario, Condominio } = require('../models');
const emailService = require('./emailService');
const logger = require('../config/logger');

/**
 * Serviço para gerenciamento de notificações
 */
const notificacaoService = {
  /**
   * Enviar notificação por email
   * @param {number} notificacaoId - ID da notificação
   * @returns {Promise<void>}
   */
  enviarPorEmail: async (notificacaoId) => {
    try {
      // Buscar a notificação com dados do usuário
      const notificacao = await Notificacao.findByPk(notificacaoId, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      if (!notificacao) {
        throw new Error(`Notificação não encontrada: ${notificacaoId}`);
      }

      if (!notificacao.usuario || !notificacao.usuario.email) {
        throw new Error(`Usuário não encontrado ou sem email para notificação: ${notificacaoId}`);
      }

      // Preparar dados para o template
      const templateData = {
        title: notificacao.titulo,
        message: notificacao.mensagem,
        userName: notificacao.usuario.nome,
        condominioName: notificacao.condominio ? notificacao.condominio.nome : 'Sistema de Condomínio',
        priority: notificacao.prioridade,
        type: notificacao.tipo,
        date: new Date(notificacao.data_criacao).toLocaleDateString('pt-BR'),
        additionalData: notificacao.dados_adicionais ? JSON.parse(notificacao.dados_adicionais) : null
      };

      // Enviar email
      await emailService.enviarEmail({
        para: notificacao.usuario.email,
        assunto: `Notificação: ${notificacao.titulo}`,
        template: 'notificacao',
        dados: templateData
      });

      // Atualizar status de envio
      await notificacao.update({ email_enviado: true });

      logger.info(`Notificação enviada por email: ${notificacaoId} para ${notificacao.usuario.email}`);
    } catch (error) {
      logger.error(`Erro ao enviar notificação por email: ${error.message}`);
      throw error;
    }
  },

  /**
   * Enviar notificação push
   * @param {number} notificacaoId - ID da notificação
   * @returns {Promise<void>}
   */
  enviarPorPush: async (notificacaoId) => {
    try {
      // Buscar a notificação com dados do usuário
      const notificacao = await Notificacao.findByPk(notificacaoId, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nome', 'email', 'device_token']
          }
        ]
      });

      if (!notificacao) {
        throw new Error(`Notificação não encontrada: ${notificacaoId}`);
      }

      if (!notificacao.usuario || !notificacao.usuario.device_token) {
        throw new Error(`Usuário não encontrado ou sem token de dispositivo para notificação: ${notificacaoId}`);
      }

      // Aqui seria implementada a lógica de envio de notificação push
      // Utilizando serviços como Firebase Cloud Messaging, OneSignal, etc.
      // Por enquanto, apenas simulamos o envio

      logger.info(`Simulação de envio de notificação push: ${notificacaoId} para usuário ${notificacao.usuario.id}`);
      
      // Atualizar status de envio
      await notificacao.update({ push_enviado: true });

      logger.info(`Notificação push registrada como enviada: ${notificacaoId}`);
    } catch (error) {
      logger.error(`Erro ao enviar notificação push: ${error.message}`);
      throw error;
    }
  },

  /**
   * Marcar notificação como lida
   * @param {number} notificacaoId - ID da notificação
   * @returns {Promise<Notificacao>} Notificação atualizada
   */
  marcarComoLida: async (notificacaoId) => {
    try {
      const notificacao = await Notificacao.findByPk(notificacaoId);
      
      if (!notificacao) {
        throw new Error(`Notificação não encontrada: ${notificacaoId}`);
      }

      await notificacao.update({
        status: 'lida',
        data_leitura: new Date()
      });

      return notificacao;
    } catch (error) {
      logger.error(`Erro ao marcar notificação como lida: ${error.message}`);
      throw error;
    }
  },

  /**
   * Enviar notificação para todos os usuários de um condomínio
   * @param {Object} dados - Dados da notificação
   * @param {number} condominioId - ID do condomínio
   * @param {boolean} enviarEmail - Se deve enviar email
   * @param {boolean} enviarPush - Se deve enviar push
   * @returns {Promise<Array>} Array com as notificações criadas
   */
  notificarCondominio: async (dados, condominioId, enviarEmail = false, enviarPush = false) => {
    try {
      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        throw new Error(`Condomínio não encontrado: ${condominioId}`);
      }

      // Buscar todos os usuários do condomínio
      const usuarios = await Usuario.findAll({
        include: [
          {
            model: Unidade,
            as: 'unidades',
            where: { condominio_id: condominioId },
            required: true
          }
        ]
      });

      if (!usuarios.length) {
        logger.warn(`Nenhum usuário encontrado para o condomínio: ${condominioId}`);
        return [];
      }

      // Criar notificações para cada usuário
      const notificacoes = [];
      for (const usuario of usuarios) {
        const notificacao = await Notificacao.create({
          titulo: dados.titulo,
          mensagem: dados.mensagem,
          tipo: dados.tipo || 'informacao',
          prioridade: dados.prioridade || 'normal',
          status: 'nao_lida',
          data_criacao: new Date(),
          data_expiracao: dados.data_expiracao,
          usuario_id: usuario.id,
          condominio_id: condominioId,
          dados_adicionais: dados.dados_adicionais ? JSON.stringify(dados.dados_adicionais) : null
        });

        notificacoes.push(notificacao);

        // Enviar por email se solicitado
        if (enviarEmail && usuario.email) {
          try {
            await notificacaoService.enviarPorEmail(notificacao.id);
          } catch (emailError) {
            logger.error(`Erro ao enviar email para usuário ${usuario.id}: ${emailError.message}`);
          }
        }

        // Enviar push se solicitado
        if (enviarPush && usuario.device_token) {
          try {
            await notificacaoService.enviarPorPush(notificacao.id);
          } catch (pushError) {
            logger.error(`Erro ao enviar push para usuário ${usuario.id}: ${pushError.message}`);
          }
        }
      }

      logger.info(`Criadas ${notificacoes.length} notificações para o condomínio ${condominioId}`);
      return notificacoes;
    } catch (error) {
      logger.error(`Erro ao notificar condomínio: ${error.message}`);
      throw error;
    }
  }
};

module.exports = notificacaoService;