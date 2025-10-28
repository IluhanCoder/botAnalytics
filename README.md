# 🤖 BotAnalytics - NLP Text Analysis Platform

Платформа для аналізу текстових даних з використанням ML/NLP технологій.

## 🌍 Підтримка мов

### ✅ Англійська (повна підтримка ML-моделей)
- BERT Named Entity Recognition
- BART Zero-Shot Classification  
- Sentiment Analysis
- TF-IDF Keywords
- LDA Topic Modeling
- RAKE Key Phrases

### 🇺🇦 Українська (демонстраційний режим)
Для українських текстів використовуються демонстраційні результати на основі ключових слів.

**Чому?** ML-моделі оптимізовані для англійської мови. Для української реалізовано демо-режим для показу можливостей системи.

📖 **Детальніше:** [DEMO_DATASET_UK.md](./DEMO_DATASET_UK.md)

## 🚀 Швидкий старт

### Встановлення

```bash
# Сервер
cd server
npm install

# Клієнт
cd ../client
npm install
```

### Запуск

```bash
# Сервер (порт 5000)
cd server
npm start

# Клієнт (порт 3000)
cd ../client
npm start
```

### 📊 Готові датасети для тестування

У проєкті є два готові JSON датасети:

- **demo-dataset-ukrainian.json** - 25 українських текстів для демо-режиму
- **demo-dataset-english.json** - 25 англійських текстів для ML-моделей

📖 **Детальніше:** [DATASETS_GUIDE.md](./DATASETS_GUIDE.md)

## 👤 Система авторизації

- **Користувач** - може завантажувати датасети та переглядати аналітику
- **Адміністратор** - додатково керує користувачами, стоп-словами та ML-налаштуваннями

📖 **Детальніше:** [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)

## 🛑 Стоп-слова

Система фільтрації стоп-слів з можливістю керування:
- Вбудовані стоп-слова (можна вимикати)
- Користувацькі стоп-слова (адмін може додавати/видаляти)

📖 **Детальніше:** [STOPWORDS_GUIDE.md](./STOPWORDS_GUIDE.md)

## ⚙️ ML Налаштування

Адміністратор може керувати параметрами ML-моделей:
- Кількість ключових слів (1-50)
- Кількість топіків (1-10)
- Термінів на топік (1-20)
- Увімкнення/вимкнення компонентів (sentiment, NER, classification)
- Категорії для класифікації

## 🏗️ Структура проєкту

```
client/          # React Frontend
  src/
    auth/        # Авторизація
    dataset/     # Завантаження та візуалізація
    user/        # Адмін-панель користувачів
    stopword/    # Керування стоп-словами
    ml-config/   # ML-налаштування

server/          # Express Backend
  src/
    auth/        # JWT авторизація
    analytics/   # ML/NLP аналіз
    dataset/     # Завантаження даних
    user/        # Керування користувачами
    stopword/    # Стоп-слова
    ml-config/   # Конфігурація ML
    nlp/         # NLP утиліти
    utils/       # Текстовий препроцесинг

shared/          # Спільні TypeScript типи
```

## 🧪 Приклади використання

### Англійська (ML-моделі)

```
Google announced a new artificial intelligence technology today.
The company's stock price increased significantly after the announcement.
Investors are optimistic about the future of AI development.
```

**Результат:**
- **Сентимент:** Positive
- **Сутності:** Google (ORG)
- **Категорія:** Technology
- **Ключові слова:** google, intelligence, technology, investors...

### Українська (демо-режим)

```
Компанія Google представила нову технологію штучного інтелекту. 
Український стартап розробив чудову платформу для онлайн-навчання.
```

**Результат:**
- **Сентимент:** Positive (визначено за ключовими словами: "чудову", "нову")
- **Сутності:** Google, Український (ORG)
- **Категорія:** Технології (демо)
- **Ключові слова:** компанія, google, технологія, стартап...

## 📊 Можливості

- 📈 Візуалізація даних (Charts, Word Cloud)
- 🔍 NLP аналіз (NER, Sentiment, Topics)
- 👥 Керування користувачами
- 🛑 Налаштування стоп-слів
- ⚙️ Конфігурація ML-параметрів
- 💾 Збереження результатів аналізу

## 🔧 Технології

**Frontend:**
- React 19 + TypeScript
- Material-UI
- Chart.js + react-chartjs-2
- wordcloud

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- @xenova/transformers (BERT, BART)
- natural (NLP utils)
- sentiment, lda, node-rake

## 📝 Ліцензія

MIT
