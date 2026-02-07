# MongoDB Database Utility Scripts

## Create Administrator (create-user-admin.cjs)

On first Docker container startup, an administrative user is created:
- **Email**: `user_admin@gmail.com`
- **Password**: `user_admin`
- **Role**: `user_admin`

For manual run, set `MONGODB_URI` and execute:
```bash
MONGODB_URI=mongodb://user:pass@localhost:27017/db node scripts/create-user-admin.cjs
```
In Docker, variables are taken from `.env` (docker-compose).

## Add Roles to User

The `add-roles-to-user.js` script adds all available roles to user "sergo".

### Available roles:
- `db_admin` - manage connections to external databases
- `metadata_editor` - edit metadata, data sources, and data sets
- `dashboard_creator` - create dashboards
- `user_admin` - manage users and roles
- `public` - public access to dashboards

### How to run:

#### Method 1: Via mongosh (recommended)
```bash
mongosh "mongodb://localhost:27017/your-database-name" < scripts/add-roles-to-user.js
```

If you have `.env.local` with `MONGODB_URI`, use:
```bash
mongosh "$(grep MONGODB_URI .env.local | cut -d '=' -f2)" < scripts/add-roles-to-user.js
```

#### Method 2: Interactively via mongosh
```bash
mongosh "mongodb://your-connection-string"
```
Then copy and paste the contents of `add-roles-to-user.js`

#### Method 3: Via Node.js with MongoDB driver
If you prefer Node.js, create `add-roles-node.js`:

```javascript
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const allRoles = ['db_admin', 'metadata_editor', 'dashboard_creator', 'user_admin', 'public'];
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
      console.error(`User "${username}" not found!`);
      return;
    }
    
    const currentRoles = user.roles || [];
    const newRoles = [...new Set([...currentRoles, ...allRoles])];
    
    if (currentRoles.length === newRoles.length) {
      console.log('User already has all roles.');
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
    
    console.log(`✓ Roles added successfully!`);
    console.log(`  New roles: [${newRoles.join(', ')}]`);
    
  } finally {
    await client.close();
  }
}

addRoles().catch(console.error);
```

Then run:
```bash
node scripts/add-roles-node.js
```

### Notes:
- The script searches for a user by email or name containing "sergo" (case-insensitive)
- If the user already has all roles, the script will report it
- The script does not remove existing roles, only adds new ones

## Migration: Populate series labels from Y-column description

The `backfill-series-labels.js` script populates `series.options.label` for legacy charts.
Uses the Y-column `description` from `data_sources`, or falls back to `columnName` if missing.

### Run:
```bash
node scripts/backfill-series-labels.js
```

### Dry-run:
```bash
node scripts/backfill-series-labels.js --dry-run
```
