#!/bin/bash

# Script de configuração do CondoGT no VPS
# IP do VPS: 62.72.9.72
# Domínio: condominiogt.com

# Cores para output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${GREEN}Iniciando configuração do CondoGT no VPS...${NC}"

# Atualizar o sistema
echo -e "${YELLOW}Atualizando o sistema...${NC}"
sudo apt update && sudo apt upgrade -y

# Instalar dependências
echo -e "${YELLOW}Instalando dependências...${NC}"
sudo apt install -y curl git docker.io docker-compose

# Iniciar e habilitar Docker
echo -e "${YELLOW}Configurando Docker...${NC}"
sudo systemctl start docker
sudo systemctl enable docker

# Criar diretórios para a aplicação
echo -e "${YELLOW}Criando diretórios...${NC}"
sudo mkdir -p /var/www/condominiogt

# Clonar o repositório (substitua pelo seu repositório real)
echo -e "${YELLOW}Clonando repositório...${NC}"
cd /tmp
git clone https://github.com/seu-usuario/condogt.git

# Configurar diretório para certificados Traefik
echo -e "${YELLOW}Configurando diretório para certificados Traefik...${NC}"
sudo mkdir -p /var/www/condominiogt/traefik/acme
sudo chmod 600 /var/www/condominiogt/traefik/acme

# Construir e iniciar os containers Docker
echo -e "${YELLOW}Configurando containers Docker...${NC}"
cd /tmp/condogt

# Modificar o docker-compose.yml para ambiente de produção
echo -e "${YELLOW}Ajustando configurações para produção...${NC}"
sed -i 's/REACT_APP_API_URL=http:\/\/localhost:3000/REACT_APP_API_URL=https:\/\/condominiogt.com\/api/g' docker-compose.yml
sed -i 's/NODE_ENV=development/NODE_ENV=production/g' docker-compose.yml

# Iniciar os serviços
echo -e "${YELLOW}Iniciando serviços...${NC}"
sudo docker-compose up -d mysql redis

# Esperar o banco de dados iniciar completamente
echo -e "${YELLOW}Aguardando inicialização do banco de dados...${NC}"
sleep 30

# Iniciar o backend e frontend
sudo docker-compose up -d backend frontend

# Iniciar o Traefik
echo -e "${YELLOW}Iniciando o Traefik...${NC}"
sudo docker-compose up -d traefik

echo -e "${GREEN}Configuração concluída!${NC}"
echo -e "${GREEN}Seu site está disponível em: https://condominiogt.com${NC}"
echo -e "${YELLOW}Lembre-se de configurar os registros DNS do domínio para apontar para o IP: 62.72.9.72${NC}"