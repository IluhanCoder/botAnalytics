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
   DB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/botanalytics
   CLIENT_URL=https://botanalytics-client.onrender.com
   JWT_SECRET=your-random-secret-key-here
   PORT=10000
   LOW_MEMORY_MODE=true
   ```

   **LOW_MEMORY_MODE=true** вимикає важкі ML-моделі (BERT NER, BART Classification) для економії пам'яті на free tier. Залишаються тільки легкі: sentiment, keywords, topics.

   Для **Frontend (botanalytics-client)**:
   ```
   REACT_APP_API_URL=https://botanalytics-api.onrender.com
   ```

   **Важливо:** Змінна `CLIENT_URL` на backend має співпадати з URL frontend-сервісу для правильної роботи CORS.

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

- **Free tier на Render засинає після 15 хв неактивності** - перший запит після сну займе ~30-60 сек
- **БЕЗ persistent disk на free tier** - моделі (~500MB) будуть перезавантажуватись після кожного деплою/рестарту (займає ~3-5 хв)
- **512MB RAM на free tier** - може бути недостатньо для ML-моделей, очікуй можливі OOM (Out of Memory) помилки
- **MongoDB Atlas** (free tier M0) підходить для зберігання даних
- **Рекомендація**: Для production використовуй платний план ($7/міс) з persistent disk для кешування моделей

## Free Tier обмеження

| Компонент | Free Tier | Paid Tier |
|-----------|-----------|-----------|
| RAM | 512 MB | 2+ GB |
| Persistent Disk | ❌ Ні | ✅ Так |
| Sleep after idle | ✅ 15 хв | ❌ Ні |
| Build time | До 15 хв | До 30 хв |
| Bandwidth | 100 GB/міс | Необмежено |

## Перевірка після деплою

1. Backend health check: `https://your-api.onrender.com/`
2. **Перший запуск може зайняти 5-10 хвилин** (завантаження моделей з HuggingFace)
3. Моделі зберігаються тимчасово - **після рестарту/деплою завантажаться знову**
4. Наступні аналізи (до рестарту) будуть швидкі (моделі в RAM)

## Альтернативи для production

Якщо free tier не підходить:

1. **Render Paid Plan** ($7/міс):
   - 2GB RAM
   - Persistent disk для моделей
   - Без auto-sleep

2. **Railway** (pay-as-you-go):
   - $5 credit/міс безкоштовно
   - Persistent volumes

3. **Fly.io**:
   - Free tier з persistent volumes
   - Але складніша конфігурація

4. **VPS (DigitalOcean, Linode)**:
   - $6/міс за 1GB RAM
   - Повний контроль

## Troubleshooting

**Проблема:** "Cannot find module '@xenova/transformers'"  
**Рішення:** Перевір що `@xenova/transformers` в `server/package.json` dependencies

**Проблема:** "Out of memory"  
**Рішення:** Upgrade на платний план з більше RAM (моделі потребують ~1GB)

**Проблема:** Моделі завантажуються кожного разу  
**Рішення:** Переконайся що persistent disk змонтовано в `/opt/render/project/src/server/models`
