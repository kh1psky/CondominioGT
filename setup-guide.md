# Guia de Configuração do CondoGT na VPS

Este guia detalha os passos necessários para configurar o projeto CondoGT em uma VPS usando Traefik como proxy reverso, assumindo que todos os arquivos já estão na VPS (exceto as pastas node_modules).

## Pré-requisitos

- VPS com Ubuntu/Debian
- Domínio apontando para o IP da VPS (condominiogt.com → 62.72.9.72)
- Acesso SSH à VPS com privilégios sudo

## 1. Preparação Inicial

Faça login na sua VPS via SSH:

```bash
ssh usuario@62.72.9.72
```

## 2. Executar o Script de Configuração

O projeto já possui um script de configuração automatizado (`setup-vps.sh`). Vamos torná-lo executável e rodá-lo:

```bash
cd /caminho/para/CondoGT
chmod +x setup-vps.sh
./setup-vps.sh
```

Este script irá:
- Atualizar o sistema
- Instalar dependências (Docker, Docker Compose)
- Configurar diretórios para certificados Traefik
- Ajustar as configurações para ambiente de produção
- Iniciar os serviços Docker (MySQL, Redis, Backend, Frontend, Traefik)

## 3. Instalar Dependências do Node.js

Como mencionado, o script não instala as dependências do Node.js. Vamos fazer isso manualmente:

### Para o Backend:

```bash
cd /caminho/para/CondoGT/backend
npm install
```

### Para o Frontend:

```bash
cd /caminho/para/CondoGT/frontend
npm install
```

## 4. Construir o Frontend para Produção

```bash
cd /caminho/para/CondoGT/frontend
npm run build
```

## 5. Iniciar os Serviços com Docker Compose

```bash
cd /caminho/para/CondoGT
docker-compose up -d
```

Este comando iniciará todos os serviços definidos no arquivo docker-compose.yml:
- MySQL (banco de dados)
- Redis (cache)
- Backend (API Node.js)
- Frontend (aplicação React)
- Traefik (proxy reverso)

## 6. Verificar os Logs dos Containers

Para verificar se tudo está funcionando corretamente:

```bash
docker-compose logs -f
```

Para verificar um serviço específico:

```bash
docker-compose logs -f backend
```

## 7. Configuração do Banco de Dados

Se for a primeira execução, pode ser necessário executar migrações ou scripts SQL iniciais:

```bash
docker-compose exec backend npm run migrate
```

## 8. Acessar a Aplicação

Após a conclusão de todos os passos, a aplicação estará disponível em:

- Frontend: https://condominiogt.com
- API: https://condominiogt.com/api

## Solução de Problemas

### Verificar logs dos containers Docker

```bash
# Ver logs de todos os containers
docker-compose logs

# Ver logs do Traefik
docker-compose logs traefik

# Ver logs do frontend
docker-compose logs frontend

# Ver logs do backend
docker-compose logs backend
```

### Reiniciar serviços

```bash
# Reiniciar todos os containers
docker-compose restart

# Reiniciar apenas o Traefik
docker-compose restart traefik
```

### Verificar certificados SSL

```bash
# Verificar arquivos de certificados no volume do Traefik
docker-compose exec traefik cat /etc/traefik/acme/acme.json
```

## Manutenção

### Atualizar o código

Quando houver atualizações no código:

```bash
# Puxar as alterações
git pull

# Reconstruir e reiniciar os containers
docker-compose down
docker-compose up -d --build
```

### Backup do banco de dados

```bash
docker-compose exec mysql mysqldump -u condos_user -pcondos_password condos_db > backup_$(date +%Y%m%d).sql
```

---

Este guia assume que o arquivo `setup-vps.sh` está configurado corretamente e que todos os arquivos do projeto já estão na VPS. Ajuste os caminhos conforme necessário para o seu ambiente específico.