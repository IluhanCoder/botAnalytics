# Admin System Guide / Інструкція для адміністратора

## Огляд системи

Система авторизації підтримує дві ролі користувачів:
- **user** - звичайний користувач
- **admin** - адміністратор з правами управління користувачами

## Як створити першого адміністратора

Оскільки нові користувачі за замовчуванням реєструються з роллю `user`, першого адміністратора потрібно створити вручну в базі даних:

### Варіант 1: Через MongoDB Shell/Compass

```javascript
// Підключіться до вашої MongoDB
use your_database_name

// Знайдіть користувача який повинен бути адміном
db.users.find({ username: "your_username" })

// Змініть роль на admin
db.users.updateOne(
  { username: "your_username" },
  { $set: { role: "admin" } }
)
```

### Варіант 2: Змінити код auth-service.ts (тимчасово)

У файлі `server/src/auth/auth-service.ts`, в методі `registerUser`, тимчасово додайте роль:

```typescript
const newUser: UserDocument = new UserModel({
  password,
  username,
  role: 'admin'  // Додайте це тимчасово
});
```

Зареєструйте адміністратора, потім **видаліть** цей рядок, щоб інші користувачі не отримували права адміністратора.

## Можливості адміністратора

Після входу з роллю `admin`, користувач отримує доступ до:

### Адмін-панель (доступна за `/admin`)

В header-і з'явиться кнопка **🔧 Адмін-панель**

#### Функціонал адмін-панелі:

1. **Перегляд всіх користувачів**
   - Таблиця зі списком всіх користувачів
   - Відображає username, ID, роль

2. **Зміна ролі користувача**
   - Dropdown-меню для кожного користувача
   - Можна змінити роль між `user` і `admin`

3. **Видалення користувачів**
   - Кнопка "Видалити" для кожного користувача
   - Діалогове вікно з підтвердженням

4. **Оновлення списку**
   - Кнопка "🔄 Оновити" для перезавантаження даних

## API Endpoints (тільки для admin)

```
GET    /admin/users              - отримати список всіх користувачів
DELETE /admin/users/:userId      - видалити користувача
PUT    /admin/users/:userId/role - змінити роль користувача
```

Ці endpoints захищені `adminMiddleware` - тільки користувачі з роллю `admin` можуть їх викликати.

## Безпека

- Паролі зберігаються у відкритому вигляді (⚠️ **для production потрібно додати bcrypt hashing!**)
- JWT токени містять роль користувача
- Middleware перевіряє роль перед доступом до admin endpoints
- На клієнті кнопка адмін-панелі показується тільки для адміністраторів

## Поліпшення безпеки для production

1. **Хешування паролів:**
```bash
npm install bcrypt
```

В `auth-service.ts`:
```typescript
import bcrypt from 'bcrypt';

// При реєстрації:
const hashedPassword = await bcrypt.hash(password, 10);

// При логіні:
const isValid = await bcrypt.compare(password, user.password);
```

2. **Використовуйте змінні оточення:**
```env
JWT_SECRET=your_very_long_random_secret_key_here
```

3. **Додайте rate limiting** для захисту від brute force атак

4. **HTTPS** для production

## Структура файлів

### Server:
- `server/src/auth/admin-middleware.ts` - перевірка ролі admin
- `server/src/user/user-service.ts` - логіка управління користувачами
- `server/src/user/user-controller.ts` - контролери для admin endpoints
- `server/src/router.ts` - реєстрація admin routes

### Client:
- `client/src/user/admin-panel-page.tsx` - UI адмін-панелі
- `client/src/user/user-service.ts` - API calls для admin функцій
- `client/src/components/header.tsx` - показує кнопку адмін-панелі
- `client/src/App.tsx` - маршрут `/admin`

## Приклад використання

1. Створіть першого адміністратора (див. вище)
2. Увійдіть як адміністратор
3. В header-і натисніть "🔧 Адмін-панель"
4. Керуйте користувачами:
   - Змінюйте ролі через dropdown
   - Видаляйте небажаних користувачів
   - Переглядайте ID для debug цілей
