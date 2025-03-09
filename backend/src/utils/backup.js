/**
 * Utilitários para operações de backup
 * Este módulo fornece funções auxiliares para operações de backup
 * complementando o backupService.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const logger = require('../config/logger');
const { criarDiretorioSeNaoExistir } = require('./fileUtils');

// Promisificar funções do fs
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

/**
 * Utilitários para gerenciamento de backups
 */
const backup = {
  /**
   * Listar arquivos de backup disponíveis em um diretório
   * @param {string} diretorio - Diretório onde os backups estão armazenados
   * @returns {Promise<Array>} Lista de arquivos de backup com metadados
   */
  listarArquivosBackup: async (diretorio) => {
    try {
      // Verificar se o diretório existe
      await criarDiretorioSeNaoExistir(diretorio);
      
      // Ler arquivos do diretório
      const arquivos = await readdir(diretorio);
      
      // Filtrar apenas arquivos .sql ou .zip
      const backups = arquivos.filter(arquivo => 
        arquivo.endsWith('.sql') || arquivo.endsWith('.zip')
      );
      
      // Obter metadados de cada arquivo
      const backupsComMetadados = await Promise.all(
        backups.map(async (arquivo) => {
          const caminhoCompleto = path.join(diretorio, arquivo);
          const stats = await stat(caminhoCompleto);
          
          return {
            nome: arquivo,
            caminho: caminhoCompleto,
            tamanho: stats.size,
            data_criacao: stats.birthtime,
            data_modificacao: stats.mtime
          };
        })
      );
      
      // Ordenar por data de modificação (mais recente primeiro)
      return backupsComMetadados.sort((a, b) => 
        b.data_modificacao.getTime() - a.data_modificacao.getTime()
      );
    } catch (error) {
      logger.error(`Erro ao listar arquivos de backup: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Remover backups antigos mantendo apenas um número específico de arquivos mais recentes
   * @param {string} diretorio - Diretório onde os backups estão armazenados
   * @param {number} manter - Número de backups recentes a manter
   * @returns {Promise<number>} Número de arquivos removidos
   */
  limparBackupsAntigos: async (diretorio, manter = 5) => {
    try {
      // Obter lista de backups ordenados por data
      const backups = await backup.listarArquivosBackup(diretorio);
      
      // Se temos menos ou igual ao número que queremos manter, não fazemos nada
      if (backups.length <= manter) {
        return 0;
      }
      
      // Selecionar backups a serem removidos (os mais antigos)
      const backupsParaRemover = backups.slice(manter);
      
      // Remover cada arquivo
      for (const arquivo of backupsParaRemover) {
        await unlink(arquivo.caminho);
        logger.info(`Backup antigo removido: ${arquivo.nome}`);
      }
      
      return backupsParaRemover.length;
    } catch (error) {
      logger.error(`Erro ao limpar backups antigos: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verificar espaço disponível no diretório de backups
   * @param {string} diretorio - Diretório onde os backups estão armazenados
   * @returns {Promise<object>} Informações sobre o espaço utilizado
   */
  verificarEspacoBackup: async (diretorio) => {
    try {
      // Obter lista de backups
      const backups = await backup.listarArquivosBackup(diretorio);
      
      // Calcular espaço total utilizado
      const espacoTotal = backups.reduce((total, arquivo) => total + arquivo.tamanho, 0);
      
      // Calcular tamanho médio dos backups
      const tamanhoMedio = backups.length > 0 ? espacoTotal / backups.length : 0;
      
      return {
        quantidade_arquivos: backups.length,
        espaco_total: espacoTotal,
        tamanho_medio: tamanhoMedio,
        backup_mais_recente: backups.length > 0 ? backups[0].nome : null,
        data_backup_mais_recente: backups.length > 0 ? backups[0].data_modificacao : null
      };
    } catch (error) {
      logger.error(`Erro ao verificar espaço de backup: ${error.message}`);
      throw error;
    }
  }
};

module.exports = backup;