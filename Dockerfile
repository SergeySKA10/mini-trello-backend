# Базовый образ с Node.js
FROM node:20-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm install

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем весь исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Открываем порт 3001
EXPOSE 3001

# Команда запуска
CMD ["npm", "start"]