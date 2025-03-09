const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const { formatarData, formatarMoeda } = require('../utils/formatters');

/**
 * Serviço para geração de PDFs
 */
const pdfService = {
  /**
   * Gerar PDF para relatórios
   * @param {string} tipo - Tipo de relatório (financeiro, inadimplencia, manutencoes, contratos)
   * @param {object} dados - Dados do relatório
   * @returns {Promise<Buffer>} - Buffer do PDF gerado
   */
  gerarRelatorioPDF: async (tipo, dados) => {
    return new Promise((resolve, reject) => {
      try {
        // Criar um novo documento PDF
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        // Capturar chunks do PDF
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Adicionar cabeçalho
        doc.fontSize(20).text('Sistema de Gerenciamento de Condomínios', { align: 'center' });
        doc.moveDown();
        
        // Título do relatório
        let titulo = '';
        switch (tipo) {
          case 'financeiro':
            titulo = 'Relatório Financeiro';
            break;
          case 'inadimplencia':
            titulo = 'Relatório de Inadimplência';
            break;
          case 'manutencoes':
            titulo = 'Relatório de Manutenções';
            break;
          case 'contratos':
            titulo = 'Relatório de Contratos';
            break;
          default:
            titulo = 'Relatório';
        }
        
        doc.fontSize(16).text(titulo, { align: 'center' });
        doc.moveDown();

        // Informações do condomínio
        doc.fontSize(12).text(`Condomínio: ${dados.condominio.nome}`);
        doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`);
        
        // Período do relatório (se aplicável)
        if (dados.periodo) {
          doc.text(`Período: ${dados.periodo.inicio} a ${dados.periodo.fim}`);
        }
        
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown();

        // Conteúdo específico por tipo de relatório
        switch (tipo) {
          case 'financeiro':
            gerarRelatorioFinanceiro(doc, dados);
            break;
          case 'inadimplencia':
            gerarRelatorioInadimplencia(doc, dados);
            break;
          case 'manutencoes':
            gerarRelatorioManutencoes(doc, dados);
            break;
          case 'contratos':
            gerarRelatorioContratos(doc, dados);
            break;
        }

        // Rodapé
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          
          // Posicionar no rodapé
          doc.fontSize(8);
          doc.text(
            `Página ${i + 1} de ${pageCount}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
        }

        // Finalizar o documento
        doc.end();

        logger.info(`PDF gerado com sucesso: ${titulo}`);
      } catch (error) {
        logger.error(`Erro ao gerar PDF: ${error.message}`);
        reject(error);
      }
    });
  }
};

/**
 * Gerar conteúdo do relatório financeiro
 * @param {PDFDocument} doc - Documento PDF
 * @param {object} dados - Dados do relatório
 */
function gerarRelatorioFinanceiro(doc, dados) {
  // Resumo financeiro
  doc.fontSize(14).text('Resumo Financeiro', { underline: true });
  doc.moveDown(0.5);
  
  doc.fontSize(10);
  doc.text(`Total Recebido: ${formatarMoeda(dados.resumo.total_recebido)}`);
  doc.text(`Total Pendente: ${formatarMoeda(dados.resumo.total_pendente)}`);
  doc.text(`Total Atrasado: ${formatarMoeda(dados.resumo.total_atrasado)}`);
  doc.text(`Total Geral: ${formatarMoeda(dados.resumo.total_geral)}`);
  
  doc.moveDown();

  // Tabela de pagamentos
  if (dados.pagamentos && dados.pagamentos.length > 0) {
    doc.fontSize(14).text('Detalhamento de Pagamentos', { underline: true });
    doc.moveDown(0.5);
    
    // Cabeçalho da tabela
    const tableTop = doc.y;
    const tableHeaders = ['Unidade', 'Valor', 'Vencimento', 'Status', 'Tipo'];
    const columnWidth = (doc.page.width - 100) / tableHeaders.length;
    
    doc.fontSize(10).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
    });
    
    doc.font('Helvetica');
    let tableRow = tableTop + 20;
    
    // Linhas da tabela
    dados.pagamentos.forEach((pagamento, i) => {
      // Verificar se precisa de nova página
      if (tableRow > doc.page.height - 100) {
        doc.addPage();
        tableRow = 50;
        
        // Repetir cabeçalho na nova página
        doc.fontSize(10).font('Helvetica-Bold');
        tableHeaders.forEach((header, i) => {
          doc.text(header, 50 + (i * columnWidth), tableRow, { width: columnWidth, align: 'left' });
        });
        doc.font('Helvetica');
        tableRow += 20;
      }
      
      // Alternar cor de fundo para linhas
      if (i % 2 === 0) {
        doc.rect(50, tableRow, doc.page.width - 100, 20).fill('#f5f5f5');
        doc.fillColor('black');
      }
      
      // Dados da linha
      doc.text(pagamento.unidade, 50, tableRow, { width: columnWidth, align: 'left' });
      doc.text(formatarMoeda(pagamento.valor), 50 + columnWidth, tableRow, { width: columnWidth, align: 'left' });
      doc.text(formatarData(pagamento.data_vencimento), 50 + (2 * columnWidth), tableRow, { width: columnWidth, align: 'left' });
      doc.text(pagamento.status, 50 + (3 * columnWidth), tableRow, { width: columnWidth, align: 'left' });
      doc.text(pagamento.tipo, 50 + (4 * columnWidth), tableRow, { width: columnWidth, align: 'left' });
      
      tableRow += 20;
    });
  } else {
    doc.text('Nenhum pagamento encontrado no período.');
  }
}

/**
 * Gerar conteúdo do relatório de inadimplência
 * @param {PDFDocument} doc - Documento PDF
 * @param {object} dados - Dados do relatório
 */
function gerarRelatorioInadimplencia(doc, dados) {
  // Resumo de inadimplência
  doc.fontSize(14).text('Resumo de Inadimplência', { underline: true });
  doc.moveDown(0.5);
  
  doc.fontSize(10);
  doc.text(`Total de Unidades Inadimplentes: ${dados.resumo.total_unidades_inadimplentes}`);
  doc.text(`Total de Pagamentos Atrasados: ${dados.resumo.total_pagamentos_atrasados}`);
  doc.text(`Valor Total Devido: ${formatarMoeda(dados.resumo.valor_total_devido)}`);
  
  doc.moveDown();

  // Detalhamento por unidade
  if (dados.unidades && dados.unidades.length > 0) {
    doc.fontSize(14).text('Detalhamento por Unidade', { underline: true });
    doc.moveDown(0.5);
    
    dados.unidades.forEach(item => {
      // Verificar espaço disponível
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Unidade: ${item.unidade.identificacao}`);
      doc.font('Helvetica');
      doc.fontSize(10);
      doc.text(`Proprietário: ${item.unidade.proprietario_nome || 'N/A'}`);
      doc.text(`Contato: ${item.unidade.proprietario_telefone || 'N/A'} / ${item.unidade.proprietario_email || 'N/A'}`);
      doc.text(`Total Devido: ${formatarMoeda(item.total_devido)}`);
      
      // Tabela de pagamentos da unidade
      if (item.pagamentos && item.pagamentos.length > 0) {
        doc.moveDown(0.5);
        doc.text('Pagamentos em atraso:');
        
        const tableTop = doc.y;
        const tableHeaders = ['Valor', 'Vencimento', 'Dias em Atraso', 'Tipo'];
        const columnWidth = (doc.page.width - 100) / tableHeaders.length;
        
        doc.fontSize(9).font('Helvetica-Bold');
        tableHeaders.forEach((header, i) => {
          doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
        });
        
        doc.font('Helvetica');
        let tableRow = tableTop + 15;
        
        item.pagamentos.forEach(pagamento => {
          doc.text(formatarMoeda(pagamento.valor), 50, tableRow, { width: columnWidth, align: 'left' });
          doc.text(formatarData(pagamento.data_vencimento), 50 + columnWidth, tableRow, { width: columnWidth, align: 'left' });
          doc.text(pagamento.dias_atraso.toString(), 50 + (2 * columnWidth), tableRow, { width: columnWidth, align: 'left' });
          doc.text(pagamento.tipo, 50 + (3 * columnWidth), tableRow, { width: columnWidth, align: 'left' });
          
          tableRow += 15;
        });
      }
      
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
      doc.moveDown();
    });
  } else {
    doc.text('Nenhuma unidade inadimplente encontrada.');
  }
}

/**
 * Gerar conteúdo do relatório de manutenções
 * @param {PDFDocument} doc - Documento PDF
 * @param {object} dados - Dados do relatório
 */
function gerarRelatorioManutencoes(doc, dados) {
  // Resumo de manutenções
  doc.fontSize(14).text('Resumo de Manutenções', { underline: true });
  doc.moveDown(0.5);
  
  doc.fontSize(10);
  doc.text(`Total de Manutenções: ${dados.resumo.total_manutencoes}`);
  doc.text(`Pendentes: ${dados.resumo.pendentes}`);
  doc.text(`Em Andamento: ${dados.resumo.em_andamento}`);
  doc.text(`Concluídas: ${dados.resumo.concluidas}`);
  doc.text(`Canceladas: ${dados.resumo.canceladas}`);
  doc.text(`Custo Total: ${formatarMoeda(dados.resumo.custo_total)}`);
  
  doc.moveDown();

  // Tabela de manutenções
  if (dados.manutencoes && dados.manutencoes.length > 0) {
    doc.fontSize(14).text('Detalhamento de Manutenções', { underline: true });
    doc.moveDown(0.5);
    
    // Cabeçalho da tabela
    const tableTop = doc.y;
    const tableHeaders = ['Título', 'Status', 'Prioridade', 'Data Solicitação', 'Custo'];
    const columnWidth = (doc.page.width - 100) / tableHeaders.length;
    
    doc.fontSize(10).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
    });
    
    doc.font('Helvetica');
    let tableRow = tableTop + 20;
    
    // Linhas da tabela
    dados.manutencoes.forEach((manutencao, i) => {
      // Verificar se precisa de nova página
      if (tableRow > doc.page.height - 100) {
        doc.addPage();
        tableRow = 50;
        
        // Repetir cabeçalho na nova página
        doc.fontSize(10).font('Helvetica-Bold');
        tableHeaders.forEach((header, i) => {
          doc.text(header, 50 + (i * columnWidth), tableRow, { width: columnWidth, align: 'left' });
        });
        doc.font('Helvetica');
        tableRow += 20;
      }
      
      // Alternar cor de fundo para linhas
      if (i % 2 === 0) {
        doc.rect(50,