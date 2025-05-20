# Use uma imagem base oficial do Node.js.
# Escolha uma versão LTS ou a que você está usando (v22.15.0 -> podemos usar node:22-alpine ou uma LTS como node:18-alpine ou node:20-alpine)
# Alpine é menor, mas às vezes pode faltar alguma dependência. Vamos com node:18-alpine por ser uma LTS robusta.
FROM node:18-alpine AS base

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia package.json e package-lock.json (ou yarn.lock)
COPY package.json package-lock.json* ./

# Instala as dependências do projeto
# Usamos --only=production se quisermos apenas dependências de produção em uma imagem final,
# mas para desenvolvimento e build, precisamos das devDependencies (como Prisma CLI)
RUN npm install

# Copia o schema do Prisma primeiro para aproveitar o cache do Docker se o schema não mudar
COPY prisma ./prisma/

# Gera o Prisma Client
# É importante gerar o client após a instalação das dependências e cópia do schema
RUN npx prisma generate

# Copia o restante do código da aplicação
COPY . .

# A porta que sua aplicação expõe (do seu .env, PORT=3000)
EXPOSE 3000

# Comando padrão para iniciar a aplicação
# Assumindo que você tem um script "start" no seu package.json,
# por exemplo: "start": "node src/server.js" ou "nodemon src/server.js"
# Se você usa nodemon, certifique-se que ele está nas devDependencies ou dependencies
CMD [ "npm", "start" ]