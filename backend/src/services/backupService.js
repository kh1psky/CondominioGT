const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const logger = require('../config/logger');
const sequelize = require('../config/database');
const { criarDiretorioSeNaoExistir } = require('../utils/fileUtils');

/**
 * Serviço para gerenciamento de backups do sistema
 */
const backupService = {
  /**
   * Realizar backup do banco de dados
   * @param {string} destino - Diretório de destino para o backup
   * @returns {Promise<string>} Caminho do arquivo de backup gerado
   */
  backupDatabase: async (destino = null) => {
    try {
      // Definir diretório de destino padrão se não for fornecido
      if (!destino) {
        destino = path.join(process.cwd(), 'backups', 'database');
      }

      // Criar diretório de destino se não existir
      await criarDiretorioSeNaoExistir(destino);

      // Obter informações de conexão do banco de dados
      const { database, username, password, host, port, dialect } = sequelize.config;

      // Nome do arquivo de backup com timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${database}-${timestamp}.sql`;
      const backupFilePath = path.join(destino, backupFileName);

      // Comando de backup específico para cada tipo de banco de dados
      let command = '';

      switch (dialect) {
        case 'mysql':
        case 'mariadb':
          command = `mysqldump -h ${host} -P ${port} -u ${username} ${password ? `-p${password}` : ''} ${database} > "${backupFilePath}"`;
          break;
        case 'postgres':
          // Definir variável de ambiente para senha
          process.env.PGPASSWORD = password;
          command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f "${backupFilePath}"`;
          break;
        default:
          throw new Error(`Backup não suportado para o dialeto: ${dialect}`);
      }

      // Executar comando de backup
      await execPromise(command);

      // Limpar variável de ambiente se foi definida
      if (dialect === 'postgres') {
        delete process.env.PGPASSWORD;
      }

      logger.info(`Backup do banco de dados realizado com sucesso: ${backupFilePath}`);
      return backupFilePath;
    } catch (error) {
      logger.error(`Erro ao realizar backup do banco de dados: ${error.message}`);
      throw error;
    }
  },

  /**
   * Restaurar backup do banco de dados
   * @param {string} arquivoBackup - Caminho do arquivo de backup
   * @returns {Promise<boolean>} Resultado da restauração
   */
  restaurarDatabase: async (arquivoBackup) => {
    try {
      // Verificar se o arquivo existe
      if (!fs.existsSync(arquivoBackup)) {
        throw new Error(`Arquivo de backup não encontrado: ${arquivoBackup}`);
      }

      // Obter informações de conexão do banco de dados
      const { database, username, password, host, port, dialect } = sequelize.config;

      // Comando de restauração específico para cada tipo de banco de dados
      let command = '';

      switch (dialect) {
        case 'mysql':
        case 'mariadb':
          command = `mysql -h ${host} -P ${port} -u ${username} ${password ? `-p${password}` : ''} ${database} < "${arquivoBackup}"`;
          break;
        case 'postgres':
          // Definir variável de ambiente para senha
          process.env.PGPASSWORD = password;
          command = `psql -h ${host} -p ${port} -U ${username} -d ${database} -f "${arquivoBackup}"`;
          break;
        default:
          throw new Error(`Restauração não suportada para o dialeto: ${dialect}`);
      }

      // Executar comando de restauração
      await execPromise(command);

      // Limpar variável de ambiente se foi definida
      if (dialect === 'postgres') {
        delete process.env.PGPASSWORD;
      }

      logger.info(`Restauração do banco de dados realizada com sucesso: ${arquivoBackup}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao restaurar backup do banco de dados: ${error.message}`);
      throw error;
    }
  },

  /**
   * Realizar backup de arquivos do sistema
   * @param {string} origem - Diretório de origem dos arquivos
   * @param {string} destino - Diretório de destino para o backup
   * @returns {Promise<string>} Caminho do arquivo de backup gerado
   */
  backupFiles: async (origem, destino = null) => {
    try {
      // Verificar se o diretório de origem existe
      if (!fs.existsSync(origem)) {
        throw new Error(`Diretório de origem não encontrado: ${origem}`);
      }

      // Definir diretório de destino padrão se não for fornecido
      if (!destino) {
        destino = path.join(process.cwd(), 'backups', 'files');
      }

      // Criar diretório de destino se não existir
      await criarDiretorioSeNaoExistir(destino);

      // Nome do arquivo de backup com timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `files-backup-${timestamp}.zip`;
      const backupFilePath = path.join(destino, backupFileName);

      // Comando para criar arquivo zip
      const command = process.platform === 'win32'
        ? `powershell Compress-Archive -Path "${origem}\*" -DestinationPath "${backupFilePath}" -Force`
        : `zip -r "${backupFilePath}" "${origem}"`;

      // Executar comando de backup
      await execPromise(command);

      logger.info(`Backup de arquivos realizado com sucesso: ${backupFilePath}`);
      return backupFilePath;
    } catch (error) {
      logger.error(`Erro ao realizar backup de arquivos: ${error.message}`);
      throw error;
    }
  },

  /**
   * Listar backups disponíveis
   * @param {string} tipo - Tipo de backup ('database' ou 'files')
   * @returns {Promise<Array>} Lista de arquivos de backup
   */
  listarBackups: async (tipo = 'database') => {
    try {
      // Definir diretório de backups com base no tipo
      const diretorioBackup = path.join(process.cwd(), 'backups', tipo);

      // Verificar se o diretório existe
      if (!fs.existsSync(diretorioBackup)) {
        return [];
      }

      // Ler arquivos do diretório
      const arquivos = fs.readdirSync(diretorioBackup);

      // Obter informações detalhadas de cada arquivo
      const backups = arquivos.map(arquivo => {
        const arquivoPath = path.join(diretorioBackup, arquivo);
        const stats = fs.statSync(arquivoPath);

        return {
          nome: arquivo,
          caminho: arquivoPath,
          tamanho: stats.size,
          data_criacao: stats.birthtime,
          data_modificacao: stats.mtime
        };
      });

      // Ordenar por data de modificação (mais recente primeiro)
      return backups.sort((a, b) => b.data_modificacao - a.data_modificacao);
    } catch (error) {
      logger.error(`Erro ao listar backups: ${error.message}`);
      throw error;
    }
  },

  /**
   * Excluir um arquivo de backup
   * @param {string} arquivoBackup - Caminho completo do arquivo de backup
   * @returns {Promise<boolean>} Resultado da exclusão
   */
  excluirBackup: async (arquivoBackup) => {
    try {
      // Verificar se o arquivo existe
      if (!fs.existsSync(arquivoBackup)) {
        throw new Error(`Arquivo de backup não encontrado: ${arquivoBackup}`);
      }

      // Excluir o arquivo
      fs.unlinkSync(arquivoBackup);

      logger.info(`Backup excluído com sucesso: ${arquivoBackup}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao excluir backup: ${error.message}`);
      throw error;
    }
  },

  /**
   * Realizar backup completo (banco de dados e arquivos)
   * @returns {Promise<Object>} Resultado do backup
   */
  backupCompleto: async () => {
    try {
      // Diretório para backups completos
      const diretorioBackup = path.join(process.cwd(), 'backups', 'completo');
      await criarDiretorioSeNaoExistir(diretorioBackup);

      // Timestamp para os arquivos
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Realizar backup do banco de dados
      const dbBackupPath = await backupService.backupDatabase(diretorioBackup);

      // Realizar backup dos arquivos de upload
      const uploadsDir = path.join(process.cwd(), 'uploads');
      let filesBackupPath = null;

      if (fs.existsSync(uploadsDir)) {
        filesBackupPath = await backupService.backupFiles(uploadsDir, diretorioBackup);
      }

      // Criar arquivo de metadados
      const metadados = {
        data: new Date(),
        database: path.basename(dbBackupPath),
        files: filesBackupPath ? path.basename(filesBackupPath) : null,
        versao_sistema: process.env.npm_package_version || 'desconhecida'
      };

      const metadadosPath = path.join(diretorioBackup, `metadados-${timestamp}.json`);
      fs.writeFileSync(metadadosPath, JSON.stringify(metadados, null, 2));

      logger.info(`Backup completo realizado com sucesso: ${diretorioBackup}`);

      return {
        sucesso: true,
        diretorio: diretorioBackup,
        database: dbBackupPath,
        files: filesBackupPath,
        metadados: metadadosPath
      };
    } catch (error) {
      logger.error(`Erro ao realizar backup completo: ${error.message}`);
      throw error;
    }
  }
};

module.exports = backupService;