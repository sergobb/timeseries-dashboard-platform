All code generated with AI.

# Timeseries Dashboard Platform

Next.js application for working with time series data from external databases (PostgreSQL, ClickHouse) with role-based access control, metadata management, and interactive dashboard building using Highcharts.

📖 **[User Guide](doc/user-guide.md)** - Complete user documentation with step-by-step instructions for all features.

## Key Features

- **External Database Connections** - PostgreSQL and ClickHouse
- **Metadata Management** - table and column descriptions for convenient work
- **Data Sources** - table selection from connected databases
- **Data Sets** - combining data sources with support for pre-aggregation
- **Chart Creation** - various chart types (line, bar, scatter, area, spline) with axis configuration, filters, and aggregations
- **Interactive Dashboards** - building dashboards with multiple charts, customizable layouts
- **Role-Based Access Control** - NextAuth with support for various roles
- **User Groups** - collaborative work on dashboards
- **Public Access** - ability to share dashboards without authentication
- **Dark Theme** - support for light and dark interface themes

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Highcharts 12
- **Database**: MongoDB (for metadata and configurations)
- **External DBs**: PostgreSQL, ClickHouse
- **Authentication**: NextAuth 5
- **Validation**: Zod
- **Forms**: React Hook Form

## System Requirements

- Node.js 20+
- MongoDB (for application data storage)
- PostgreSQL or ClickHouse (external databases for time series)

## Installation

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
MONGODB_URI=mongodb://localhost:27017/timeseries-dashboard
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
AUTH_TRUST_HOST=true
```

3. Run the application in development mode:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

При развёртывании через docker-compose поднимаются приложение, nginx и MongoDB. База данных приложения: `timeseries-dashboard-platform-db`.

Перед запуском создайте `.env` из шаблона и задайте секреты:

```bash
cp .env.example .env
# Отредактируйте .env: NEXTAUTH_SECRET, ENCRYPTION_KEY (и при необходимости MONGO_USER, MONGO_PASSWORD, NEXTAUTH_URL)
```

Переменные в `.env`:

| Переменная       | Обязательно | Описание |
|------------------|-------------|----------|
| `NEXTAUTH_SECRET` | да         | Секрет NextAuth (≥32 символов) |
| `ENCRYPTION_KEY`  | да         | Ключ шифрования (≥32 символов) |
| `MONGO_USER`      | нет        | Пользователь MongoDB (по умолчанию: `mongoadmin`) |
| `MONGO_PASSWORD`  | нет        | Пароль MongoDB (по умолчанию: `mongoadmin`) |
| `NEXTAUTH_URL`    | нет        | URL приложения (по умолчанию: `http://localhost:8080`) |

Запуск:

```bash
docker-compose up -d
```

Приложение доступно по [http://localhost:8080](http://localhost:8080) (через nginx). Данные MongoDB сохраняются в volume `mongo_data`.

При первом запуске скрипт `create-user-admin.cjs` создаёт административного пользователя.

## User Roles

- **db_admin** - manage connections to external databases
- **metadata_editor** - create and edit metadata, data sources, and data sets
- **dashboard_creator** - create and edit dashboards
- **public** (without authentication) - view public dashboards

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboards/        # Dashboard pages
│   ├── data-sets/         # Data set pages
│   ├── data-sources/      # Data source pages
│   ├── database-connections/ # Database connection pages
│   ├── groups/            # Group pages
│   └── users/             # User pages
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── data-sets/         # Data set components
│   ├── data-sources/      # Data source components
│   ├── database-connections/ # Connection components
│   ├── groups/            # Group components
│   ├── ui/                # UI components
│   └── providers/         # React providers
├── lib/                   # Libraries and utilities
│   ├── services/         # Business logic (services)
│   ├── drivers/           # Database drivers (PostgreSQL, ClickHouse)
│   └── ...                # Utilities
├── hooks/                 # React hooks
├── types/                 # TypeScript types
└── scripts/               # Database utility scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - user registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Database Connections
- `GET /api/database-connections` - list connections
- `POST /api/database-connections` - create connection
- `GET /api/database-connections/[id]` - get connection
- `PUT /api/database-connections/[id]` - update connection
- `DELETE /api/database-connections/[id]` - delete connection
- `POST /api/database-connections/[id]/test` - test connection
- `GET /api/database-connections/[id]/tables` - list tables
- `GET /api/database-connections/[id]/schemas` - list schemas
- `GET /api/database-connections/[id]/schemas/[schema]/tables` - tables in schema

### Data Sources
- `GET /api/data-sources` - list data sources
- `POST /api/data-sources` - create data sources from tables
- `GET /api/data-sources/[id]` - get data source
- `PUT /api/data-sources/[id]` - update data source
- `DELETE /api/data-sources/[id]` - delete data source

### Data Sets
- `GET /api/data-sets` - list data sets
- `POST /api/data-sets` - create data set
- `GET /api/data-sets/[id]` - get data set
- `PUT /api/data-sets/[id]` - update data set
- `DELETE /api/data-sets/[id]` - delete data set

### Metadata
- `GET /api/metadata` - list metadata
- `POST /api/metadata` - create metadata
- `GET /api/metadata/[id]` - get metadata
- `PUT /api/metadata/[id]` - update metadata
- `DELETE /api/metadata/[id]` - delete metadata
- `GET /api/metadata/table/[tableId]` - table metadata

### Charts
- `GET /api/charts` - list charts (optional: `?dashboardId=...`)
- `POST /api/charts` - create chart
- `GET /api/charts/[id]` - get chart
- `PUT /api/charts/[id]` - update chart
- `DELETE /api/charts/[id]` - delete chart

### Dashboards
- `GET /api/dashboards` - list dashboards
- `POST /api/dashboards` - create dashboard
- `GET /api/dashboards/[id]` - get dashboard
- `PUT /api/dashboards/[id]` - update dashboard
- `DELETE /api/dashboards/[id]` - delete dashboard
- `POST /api/dashboards/[id]/share` - share dashboard

### Groups
- `GET /api/groups` - list user groups
- `POST /api/groups` - create group
- `GET /api/groups/[id]` - get group
- `PUT /api/groups/[id]` - update group
- `DELETE /api/groups/[id]` - delete group

### Users
- `GET /api/users` - list users
- `PUT /api/users/roles` - update user roles

### Profile
- `GET /api/profile` - get profile
- `PUT /api/profile` - update profile
- `PUT /api/profile/password` - change password

### Data
- `POST /api/data/query` - execute data query for charts

## Development

### Production Build
```bash
npm run build
npm start
```

### Linter Check
```bash
npm run lint
```

## Scripts

The `scripts/` folder contains database utility scripts:

- **create-user-admin.cjs** - create administrative user (automatically runs on Docker container startup)
- **add-roles-to-user.js** - add roles to user
- **backfill-series-labels.js** - migration: populate series labels from Y-column description

For more details, see [scripts/README.md](scripts/README.md)

## Features

- **Credential Encryption** - passwords and database connection strings are encrypted before storage
- **Query Caching** - support for data caching to optimize performance
- **Pre-aggregation** - ability to configure data pre-aggregation in data sets
- **Flexible Layouts** - support for various chart placement options on dashboards
- **Data Filtering** - time ranges and value filters
- **Aggregations** - support for various aggregation types (avg, sum, min, max, count)

## License

Private
