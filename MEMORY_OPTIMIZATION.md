# 🧠 Оптимізація пам'яті для Free Tier

## Проблема
Free tier на Render має тільки **512MB RAM**, але ML-моделі займають:
- BERT NER: ~104MB
- BART Classification: ~392MB
- Разом: **~500MB** (майже весь ліміт!)

## ✅ Варіант 1: Sequential Processing (Реалізовано)

**Ідея:** Завантажуємо моделі по черзі, вивантажуючи попередню.

### Як працює:
1. Завантажити NER → виконати NER → вивантажити NER
2. Завантажити Classifier → виконати Classification → вивантажити

### Налаштування:
```bash
# package.json start script:
node --expose-gc --max-old-space-size=460 -r ts-node/register src/index.ts

# --expose-gc: дозволяє викликати garbage collector
# --max-old-space-size=460: обмежує heap до 460MB (залишає буфер)
```

### Переваги:
- ✅ Повний функціонал (всі моделі працюють)
- ✅ Низьке споживання пам'яті (одна модель в RAM)
- ✅ Безкоштовно

### Недоліки:
- ⚠️ Повільніше (кожна модель завантажується при потребі)
- ⚠️ Перший аналіз займе ~5-10 хв (завантаження моделей)

---

## Варіант 2: LOW_MEMORY_MODE (Альтернатива)

Вимикаємо важкі моделі зовсім.

### Environment Variable:
```bash
LOW_MEMORY_MODE=true  # Вимикає NER і Classification
```

### Що залишається:
- ✅ Sentiment Analysis
- ✅ Keywords (TF-IDF)
- ✅ Key Phrases (RAKE)
- ✅ Topics (LDA)
- ❌ Named Entities (NER)
- ❌ Category Classification

### Переваги:
- ✅ Дуже швидко
- ✅ Стабільно (ніколи OOM)
- ✅ Низька пам'ять (~100MB)

### Недоліки:
- ❌ Неповний функціонал

---

## Варіант 3: Lighter Models (Рекомендація для майбутнього)

Замінити важкі моделі на легші альтернативи.

### Приклади:
```javascript
// Замість BERT (104MB) → DistilBERT (66MB)
pipeline("token-classification", "Xenova/distilbert-base-NER");

// Замість BART (392MB) → DistilBART (244MB) або MobileBERT
pipeline("zero-shot-classification", "Xenova/distilbart-mnli-12-3");
```

### Переваги:
- ✅ Швидше
- ✅ Менше пам'яті
- ✅ Повний функціонал

### Недоліки:
- ⚠️ Трохи нижча точність (~2-5%)

---

## Варіант 4: Paid Plan (Найкращий для production)

Upgrade на **Render Standard** ($7/міс):
- 2GB RAM
- Persistent disk (моделі завантажуються один раз)
- Без auto-sleep

### Переваги:
- ✅ Повний функціонал
- ✅ Швидко (моделі в RAM постійно)
- ✅ Стабільно

---

## Порівняння

| Варіант | RAM | Швидкість | Функціонал | Вартість |
|---------|-----|-----------|------------|----------|
| Sequential (1) | ~400MB | Повільно | 100% | Free |
| LOW_MEMORY (2) | ~100MB | Швидко | ~60% | Free |
| Lighter Models (3) | ~300MB | Середньо | 100% | Free |
| Paid Plan (4) | 2GB | Дуже швидко | 100% | $7/міс |

---

## 🚀 Поточна конфігурація

Зараз використовується **Варіант 1 (Sequential)**:

- Моделі завантажуються по черзі
- При кожному аналізі:
  1. Lightweight операції (tokenize, stem, sentiment, keywords)
  2. Завантажити NER → extractEntities → вивантажити
  3. Завантажити Classifier → classifyText → вивантажити
- Garbage collection після кожного вивантаження

## Як перемкнутися на інший режим

### На LOW_MEMORY_MODE:
```bash
# На Render: Environment Variables
LOW_MEMORY_MODE=true
```

### На Lighter Models:
```javascript
// server/src/analytics/analytics-service.ts
pipeline("token-classification", "Xenova/distilbert-base-NER");
```

---

## Моніторинг пам'яті

Додай в код для відстеження:
```javascript
const used = process.memoryUsage();
console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)}MB / ${Math.round(used.heapTotal / 1024 / 1024)}MB`);
```

## Troubleshooting

**OOM все ще трапляється?**
1. Перевір що `--max-old-space-size=460` в start script
2. Збільш затримку між вивантаженням/завантаженням моделей
3. Переключись на LOW_MEMORY_MODE тимчасово
4. Upgrade на платний план

**Моделі завантажуються кожного разу?**
- Це нормально для free tier без persistent disk
- Моделі кешуються в `/tmp` але видаляються після restart/deploy
