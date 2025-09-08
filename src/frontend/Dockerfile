FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar todas as dependências (incluindo dev para o build)
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Instalar servidor estático globalmente
RUN npm install -g serve

# Remover dependências de desenvolvimento para diminuir o tamanho
RUN npm prune --production

# Expor porta
EXPOSE 5600

# Comando para executar a aplicação
CMD ["serve", "-s", "build", "-l", "5600"]