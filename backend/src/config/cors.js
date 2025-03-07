// Configuração de CORS para a aplicação
module.exports = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://seudominio.com.br', 'https://app.seudominio.com.br'] 
      : ['http://localhost:3000', 'http://localhost:8000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
    maxAge: 86400, // 24 horas em segundos
    preflightContinue: false,
    optionsSuccessStatus: 204
  };