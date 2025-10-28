# 🚀 Деплой на Render

## Автоматичний деплой

1. **Підключи GitHub репозиторій до Render:**
   - Зайди на [render.com](https://render.com)
   - Натисни "New" → "Blueprint"
   - Вибери репозиторій `IluhanCoder/botAnalytics`
   - Render автоматично знайде `render.yaml` і створить сервіси

2. **Налаштуй змінні оточення:**
   
   Для **Backend (botanalytics-api)**:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

   Для **Frontend (botanalytics-client)**:
   ```
   REACT_APP_API_URL=https://botanalytics-api.onrender.com
   ```

3. **Моделі завантажаться автоматично:**
   - При першому запуску `@xenova/transformers` завантажить моделі в `/opt/render/project/src/server/models`
   - Завдяки persistent disk (2GB) вони збережуться між деплоями
   - Перший запуск може зайняти ~3-5 хвилин

## Альтернатива: Окремі сервіси вручну

### Backend
1. New Web Service
2. Build Command: `cd server && npm install`
3. Start Command: `cd server && npm start`
4. Add Disk: `/opt/render/project/src/server/models` (2GB)

### Frontend  
1. New Static Site
2. Build Command: `cd client && npm install && npm run build`
3. Publish Directory: `client/build`

## Важливо ⚠️

- **Free tier на Render засинає після 15 хв неактивності** - перший запит після сну займе ~30 сек
- **Моделі займають ~500MB** - переконайся що є persistent disk для кешування
- **MongoDB Atlas** (free tier) підходить для зберігання даних

## Перевірка після деплою

1. Backend health check: `https://your-api.onrender.com/`
2. Перший аналіз займе довше (завантаження моделей)
3. Наступні аналізи будуть швидкі (моделі в кеші)

## Troubleshooting

**Проблема:** "Cannot find module '@xenova/transformers'"  
**Рішення:** Перевір що `@xenova/transformers` в `server/package.json` dependencies

**Проблема:** "Out of memory"  
**Рішення:** Upgrade на платний план з більше RAM (моделі потребують ~1GB)

**Проблема:** Моделі завантажуються кожного разу  
**Рішення:** Переконайся що persistent disk змонтовано в `/opt/render/project/src/server/models`
