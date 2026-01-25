# Скрипты для работы с базой данных MongoDB

## Добавление ролей пользователю

Скрипт `add-roles-to-user.js` добавляет все доступные роли пользователю "sergo".

### Доступные роли в системе:
- `db_admin` - администратор базы данных
- `metadata_editor` - редактор метаданных
- `dashboard_creator` - создатель дашбордов
- `public` - публичный доступ

### Способы запуска:

#### Способ 1: Через mongosh (рекомендуется)
```bash
mongosh "mongodb://localhost:27017/your-database-name" < scripts/add-roles-to-user.js
```

Если у вас есть файл `.env.local` с `MONGODB_URI`, используйте:
```bash
mongosh "$(grep MONGODB_URI .env.local | cut -d '=' -f2)" < scripts/add-roles-to-user.js
```

#### Способ 2: Интерактивно через mongosh
```bash
mongosh "mongodb://your-connection-string"
```
Затем скопируйте и вставьте содержимое файла `add-roles-to-user.js`

#### Способ 3: Через Node.js с MongoDB драйвером
Если вы предпочитаете использовать Node.js, создайте файл `add-roles-node.js`:

```javascript
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const allRoles = ['db_admin', 'metadata_editor', 'dashboard_creator', 'public'];
const username = 'sergo';

async function addRoles() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    const user = await db.collection('users').findOne({
      $or: [
        { email: username },
        { name: username },
        { email: { $regex: username, $options: 'i' } }
      ]
    });
    
    if (!user) {
      console.error(`Пользователь "${username}" не найден!`);
      return;
    }
    
    const currentRoles = user.roles || [];
    const newRoles = [...new Set([...currentRoles, ...allRoles])];
    
    if (currentRoles.length === newRoles.length) {
      console.log('Пользователь уже имеет все роли.');
      return;
    }
    
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          roles: newRoles,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✓ Роли успешно добавлены!`);
    console.log(`  Новые роли: [${newRoles.join(', ')}]`);
    
  } finally {
    await client.close();
  }
}

addRoles().catch(console.error);
```

Затем запустите:
```bash
node scripts/add-roles-node.js
```

### Примечания:
- Скрипт ищет пользователя по email или name, содержащему "sergo" (регистр не важен)
- Если пользователь уже имеет все роли, скрипт сообщит об этом
- Скрипт не удаляет существующие роли, только добавляет новые

## Миграция: заполнение label у series из description Y-колонки

Скрипт `backfill-series-labels.js` заполняет `series.options.label` для старых чартов.
Берёт `description` Y-колонки из `data_sources`, при отсутствии — использует `columnName`.

### Запуск:
```bash
node scripts/backfill-series-labels.js
```

### Dry-run:
```bash
node scripts/backfill-series-labels.js --dry-run
```

