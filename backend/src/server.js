const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar configurações
const db = require('./config/database');
const logger = require('./config/logger');
const corsConfig = require('./config/cors');

// Importar rotas
const apiRoutes = require('./routes/apiRoutes');

// Importar middlewares
const errorHandler = require('./middleware/errorHandler');

// Inicializar o app Express
const app = express();
const port = process.env.PORT || 3000;

// Configurar middlewares
app.use(helmet());
app.use(cors(corsConfig));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Muitas requisições, por favor tente novamente mais tarde.'
  }
});

// Aplicar rate limiting a todas as requisições
app.use(limiter);

// Pasta para arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api', apiRoutes);

// Rota de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar o servidor
const server = app.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV}`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Promessa rejeitada não tratada:', error);
  server.close(() => {
    process.exit(1);
  });
});

// Testar conexão com o banco de dados
db.authenticate()
  .then(() => {
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch((error) => {
    logger.error('Erro ao conectar com o banco de dados:', error);
  });

module.exports = app;