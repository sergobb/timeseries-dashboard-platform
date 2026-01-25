# Timeseries Dashboard Platform

Next.js приложение для работы с временными рядами из внешних баз данных (PostgreSQL, ClickHouse) с системой ролей, метаданных и построением дашбордов на Plotly.

## Основные возможности

- Подключение к внешним базам данных (PostgreSQL, ClickHouse)
- Управление метаданными таблиц и колонок
- Создание интерактивных дашбордов с графиками Plotly
- Система ролей и авторизации
- Публичный доступ к дашбордам

## Системные требования

- Node.js 18+
- MongoDB (для хранения данных приложения)
- PostgreSQL или ClickHouse (внешние базы данных для временных рядов)

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env.local` на основе `.env.local.example`:
```bash
MONGODB_URI=mongodb://localhost:27017/timeseries-dashboard
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
```

3. Запустите приложение в режиме разработки:
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Роли пользователей

- **db_admin** - управление подключениями к внешним БД
- **metadata_editor** - создание и редактирование метаданных
- **dashboard_creator** - создание дашбордов
- **public** (без авторизации) - просмотр публичных дашбордов

## Структура проекта

- `app/` - Next.js App Router страницы и API routes
- `lib/` - сервисы, утилиты, драйверы БД
- `components/` - React компоненты
- `types/` - TypeScript типы

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Подключения к БД
- `GET /api/database-connections` - список подключений
- `POST /api/database-connections` - создание подключения
- `GET /api/database-connections/[id]` - получение подключения
- `PUT /api/database-connections/[id]` - обновление подключения
- `DELETE /api/database-connections/[id]` - удаление подключения
- `POST /api/database-connections/[id]/test` - тест подключения
- `GET /api/database-connections/[id]/tables` - список таблиц
- `POST /api/database-connections/[id]/tables` - выбор таблицы

### Метаданные
- `GET /api/metadata` - список метаданных
- `POST /api/metadata` - создание метаданных
- `GET /api/metadata/[id]` - получение метаданных
- `PUT /api/metadata/[id]` - обновление метаданных
- `DELETE /api/metadata/[id]` - удаление метаданных

### Дашборды
- `GET /api/dashboards` - список дашбордов
- `POST /api/dashboards` - создание дашборда
- `GET /api/dashboards/[id]` - получение дашборда
- `PUT /api/dashboards/[id]` - обновление дашборда
- `DELETE /api/dashboards/[id]` - удаление дашборда
- `POST /api/dashboards/[id]/share` - поделиться дашбордом

### Данные
- `POST /api/data/query` - выполнение запроса данных для графиков

## Разработка

Для сборки продакшн версии:
```bash
npm run build
npm start
```

Для проверки линтера:
```bash
npm run lint
```
