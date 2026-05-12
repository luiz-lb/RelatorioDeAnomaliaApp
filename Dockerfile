FROM node:20-slim

# Instala dependências necessárias para bibliotecas nativas como o sharp
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./

RUN npm install --production

# Copia o restante dos arquivos
COPY . .

# Define variáveis de ambiente padrão
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
