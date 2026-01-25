// MongoDB скрипт для добавления ролей пользователю sergo
// Использование: mongosh "mongodb://your-connection-string" < scripts/add-roles-to-user.js
// Или: mongosh и затем скопировать содержимое скрипта

// Определяем все доступные роли в системе
const allRoles = ['db_admin', 'metadata_editor', 'dashboard_creator', 'public'];

// Имя пользователя для обновления
const username = 'sergo';

// Подключаемся к базе данных (если скрипт запускается напрямую)
// Если используете mongosh с параметром --file, база уже будет подключена

print('========================================');
print('Скрипт добавления ролей пользователю');
print('========================================');
print('');

// Проверяем, существует ли пользователь
print(`Поиск пользователя "${username}"...`);
const user = db.users.findOne({ 
  $or: [
    { email: username },
    { name: username },
    { email: { $regex: username, $options: 'i' } }
  ]
});

if (!user) {
  print(`ОШИБКА: Пользователь "${username}" не найден!`);
  print('');
  print('Попробуйте найти пользователя вручную:');
  print('db.users.find({ email: /sergo/i })');
  print('или');
  print('db.users.find({ name: /sergo/i })');
  exit(1);
}

print(`Пользователь найден:`);
print(`  ID: ${user._id}`);
print(`  Email: ${user.email || 'не указан'}`);
print(`  Name: ${user.name || 'не указан'}`);
print(`  Текущие роли: [${(user.roles || []).join(', ') || 'нет ролей'}]`);
print('');

// Добавляем все роли пользователю (удаляем дубликаты, если есть)
const currentRoles = user.roles || [];
const newRoles = [...new Set([...currentRoles, ...allRoles])];

if (currentRoles.length === newRoles.length) {
  print(`Пользователь уже имеет все роли. Обновление не требуется.`);
} else {
  // Обновляем пользователя
  const result = db.users.updateOne(
    { _id: user._id },
    {
      $set: {
        roles: newRoles,
        updatedAt: new Date()
      }
    }
  );

  if (result.modifiedCount > 0) {
    print(`✓ Роли успешно добавлены!`);
    print(`  Новые роли: [${newRoles.join(', ')}]`);
  } else {
    print(`ОШИБКА: Не удалось обновить пользователя.`);
    exit(1);
  }
}

print('');
print('========================================');
print('Операция завершена');
print('========================================');

