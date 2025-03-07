const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const logger = require('../config/logger');

/**
 * Configuração do transporte de e-mail
 */
const transporterConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

// Em ambiente de desenvolvimento, usar ethereal.email
const createTestAccount = async () => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      return {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      };
    } catch (error) {
      logger.error('Erro ao criar conta de teste para e-mail:', error);
      return transporterConfig;
    }
  }
  return transporterConfig;
};

/**
 * Carregar template de e-mail
 * @param {String} templateName - Nome do template
 * @returns {Promise<Function>} Função compilada do template
 */
const loadTemplate = async (templateName) => {
  try {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    const templateSource = await fs.readFile(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  } catch (error) {
    logger.error(`Erro ao carregar template de e-mail ${templateName}:`, error);
    // Retornar template básico em caso de erro
    const basicTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>{{subject}}</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>{{title}}</h2>
          <p>{{message}}</p>
          {{#if link}}
          <p>
            <a href="{{link}}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">{{buttonText}}</a>
          </p>
          {{/if}}
          <p>Atenciosamente,<br>Equipe do Sistema de Gerenciamento de Condomínios</p>
        </div>
      </body>
      </html>
    `;
    return handlebars.compile(basicTemplate);
  }
};

/**
 * Serviço de envio de e-mails
 */
const emailService = {
  /**
   * Enviar e-mail
   * @param {Object} options - Opções do e-mail
   * @returns {Promise} Resultado do envio
   */
  enviarEmail: async (options) => {
    try {
      const {
        para,
        assunto,
        texto,
        html,
        anexos = []
      } = options;

      // Obter configuração de transporte
      const config = await createTestAccount();
      const transporter = nodemailer.createTransport(config);

      // Preparar o e-mail
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sistema de Condomínios'}" <${process.env.EMAIL_FROM || config.auth.user}>`,
        to: para,
        subject: assunto,
        text: texto,
        html: html,
        attachments: anexos
      };

      // Enviar e-mail
      const info = await transporter.sendMail(mailOptions);

      // Logar resultado
      logger.info(`E-mail enviado para ${para}: ${info.messageId}`);
      
      // Em desenvolvimento, logar link de visualização
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`URL de visualização: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Erro ao enviar e-mail:', error);
      throw error;
    }
  },

  /**
   * Enviar e-mail de boas-vindas
   * @param {Object} usuario - Dados do usuário
   * @returns {Promise} Resultado do envio
   */
  enviarBoasVindas: async (usuario) => {
    try {
      // Carregar template
      const template = await loadTemplate('boas-vindas');
      
      // Renderizar HTML com os dados
      const html = template({
        nome: usuario.nome,
        email: usuario.email,
        title: 'Bem-vindo ao Sistema de Gerenciamento de Condomínios',
        message: 'Sua conta foi criada com sucesso. Você já pode acessar o sistema com suas credenciais.',
        link: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/login`,
        buttonText: 'Acessar o Sistema'
      });
      
      // Enviar e-mail
      return await emailService.enviarEmail({
        para: usuario.email,
        assunto: 'Bem-vindo ao Sistema de Gerenciamento de Condomínios',
        texto: `Olá ${usuario.nome}, sua conta foi criada com sucesso. Você já pode acessar o sistema com suas credenciais.`,
        html
      });
    } catch (error) {
      logger.error('Erro ao enviar e-mail de boas-vindas:', error);
      throw error;
    }
  },

  /**
   * Enviar e-mail de recuperação de senha
   * @param {Object} usuario - Dados do usuário
   * @param {String} token - Token de recuperação
   * @returns {Promise} Resultado do envio
   */
  enviarRecuperacaoSenha: async (usuario, token) => {
    try {
      // Carregar template
      const template = await loadTemplate('recuperacao-senha');
      
      // Link de recuperação
      const link = `${process.env.FRONTEND_URL || 'http://localhost:8000'}/redefinir-senha?token=${token}`;
      
      // Renderizar HTML com os dados
      const html = template({
        nome: usuario.nome,
        title: 'Recuperação de Senha',
        message: 'Você solicitou a recuperação de senha. Clique no botão abaixo para criar uma nova senha.',
        link,
        buttonText: 'Redefinir Senha',
        validadeHoras: 1
      });
      
      // Enviar e-mail
      return await emailService.enviarEmail({
        para: usuario.email,
        assunto: 'Recuperação de Senha - Sistema de Gerenciamento de Condomínios',
        texto: `Olá ${usuario.nome}, você solicitou a recuperação de senha. Acesse o link ${link} para criar uma nova senha. Este link é válido por 1 hora.`,
        html
      });
    } catch (error) {
      logger.error('Erro ao enviar e-mail de recuperação de senha:', error);
      throw error;
    }
  },

  /**
   * Enviar e-mail de notificação de pagamento
   * @param {Object} pagamento - Dados do pagamento
   * @param {Object} unidade - Dados da unidade
   * @param {Object} usuario - Dados do usuário
   * @returns {Promise} Resultado do envio
   */
  enviarNotificacaoPagamento: async (pagamento, unidade, usuario) => {
    try {
      // Carregar template
      const template = await loadTemplate('notificacao-pagamento');
      
      // Formatar data
      const dataVencimento = new Date(pagamento.data_vencimento).toLocaleDateString('pt-BR');
      
      // Formatar valor
      const valor = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(pagamento.valor);
      
      // Renderizar HTML com os dados
      const html = template({
        nome: usuario.nome,
        title: 'Notificação de Pagamento',
        message: `Um novo pagamento foi gerado para sua unidade ${unidade.bloco ? unidade.bloco + '-' : ''}${unidade.numero}.`,
        descricao: pagamento.descricao,
        valor,
        dataVencimento,
        link: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/app/pagamentos/${pagamento.id}`,
        buttonText: 'Ver Detalhes'
      });
      
      // Enviar e-mail
      return await emailService.enviarEmail({
        para: usuario.email,
        assunto: 'Notificação de Pagamento - Sistema de Gerenciamento de Condomínios',
        texto: `Olá ${usuario.nome}, um novo pagamento de ${valor} com vencimento em ${dataVencimento} foi gerado para sua unidade ${unidade.bloco ? unidade.bloco + '-' : ''}${unidade.numero}.`,
        html
      });
    } catch (error) {
      logger.error('Erro ao enviar notificação de pagamento:', error);
      throw error;
    }
  },

  /**
   * Enviar e-mail de confirmação de pagamento
   * @param {Object} pagamento - Dados do pagamento
   * @param {Object} unidade - Dados da unidade
   * @param {Object} usuario - Dados do usuário
   * @returns {Promise} Resultado do envio
   */
  enviarConfirmacaoPagamento: async (pagamento, unidade, usuario) => {
    try {
      // Carregar template
      const template = await loadTemplate('confirmacao-pagamento');
      
      // Formatar datas
      const dataVencimento = new Date(pagamento.data_vencimento).toLocaleDateString('pt-BR');
      const dataPagamento = new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR');
      
      // Formatar valor
      const valor = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(pagamento.valor_final || pagamento.valor);
      
      // Renderizar HTML com os dados
      const html = template({
        nome: usuario.nome,
        title: 'Confirmação de Pagamento',
        message: `O pagamento da sua unidade ${unidade.bloco ? unidade.bloco + '-' : ''}${unidade.numero} foi confirmado.`,
        descricao: pagamento.descricao,
        valor,
        dataVencimento,
        dataPagamento,
        link: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/app/pagamentos/${pagamento.id}`,
        buttonText: 'Ver Detalhes'
      });
      
      // Enviar e-mail
      return await emailService.enviarEmail({
        para: usuario.email,
        assunto: 'Confirmação de Pagamento - Sistema de Gerenciamento de Condomínios',
        texto: `Olá ${usuario.nome}, o pagamento de ${valor} referente à ${pagamento.descricao} para sua unidade ${unidade.bloco ? unidade.bloco + '-' : ''}${unidade.numero} foi confirmado em ${dataPagamento}.`,
        html
      });
    } catch (error) {
      logger.error('Erro ao enviar confirmação de pagamento:', error);
      throw error;
    }
  },

  /**
   * Enviar e-mail de alerta de atraso de pagamento
   * @param {Object} pagamento - Dados do pagamento
   * @param {Object} unidade - Dados da unidade
   * @param {Object} usuario - Dados do usuário
   * @param {Number} diasAtraso - Dias de atraso
   * @returns {Promise} Resultado do envio
   */
  enviarAlertaAtraso: async (pagamento, unidade, usuario, diasAtraso) => {
    try {
      // Carregar template
      const template = await loadTemplate('alerta-atraso');
      
      // Formatar datas
      const dataVencimento = new Date(pagamento.data_vencimento).toLocaleDateString('pt-BR');
      
      // Formatar valores
      const valorOriginal = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(pagamento.valor);
      
      const valorAtualizado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(pagamento.valor_final || pagamento.valor);
      
      // Renderizar HTML com os dados
      const html = template({
        nome: usuario.nome,
        title: 'Alerta de Pagamento em Atraso',
        message: `O pagamento da sua unidade ${unidade.bloco ? unidade.bloco + '-' : ''}${unidade.numero} está em atraso há ${diasAtraso} dias.`,
        descricao: pagamento.descricao,
        valorOriginal,
        valorAtualizado,
        dataVencimento,
        diasAtraso,
        link: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/app/pagamentos/${pagamento.id}`,
        buttonText: 'Regularizar Pagamento'
      });
      
      // Enviar e-mail
      return await emailService.enviarEmail({
        para: usuario.email,
        assunto: 'Pagamento em Atraso - Sistema de Gerenciamento de Condomínios',
        texto: `Olá ${usuario.nome}, o pagamento de ${valorOriginal} referente à ${pagamento.descricao} para sua unidade ${unidade.bloco ? unidade.bloco + '-' : ''}${unidade.numero} está em atraso há ${diasAtraso} dias. O valor atualizado é de ${valorAtualizado}.`,
        html
      });
    } catch (error) {
      logger.error('Erro ao enviar alerta de atraso:', error);
      throw error;
    }
  },

  /**
   * Enviar e-mail de notificação geral
   * @param {Object} notificacao - Dados da notificação
   * @param {Array} destinatarios - Lista de destinatários
   * @returns {Promise} Resultado do envio
   */
  enviarNotificacaoGeral: async (notificacao, destinatarios) => {
    try {
      // Carregar template
      const template = await loadTemplate('notificacao-geral');
      
      // Renderizar HTML com os dados
      const html = template({
        title: notificacao.titulo,
        message: notificacao.mensagem,
        link: notificacao.link,
        buttonText: notificacao.botaoTexto || 'Ver Detalhes',
        dataNotificacao: new Date().toLocaleDateString('pt-BR')
      });
      
      // Preparar destinatários
      const para = destinatarios.map(dest => dest.email).join(',');
      
      // Enviar e-mail
      return await emailService.enviarEmail({
        para,
        assunto: notificacao.titulo,
        texto: notificacao.mensagem,
        html,
        anexos: notificacao.anexos || []
      });
    } catch (error) {
      logger.error('Erro ao enviar notificação geral:', error);
      throw error;
    }
  }
};

module.exports = emailService;