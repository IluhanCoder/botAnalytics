# 📋 Тестові Дані для Швидкого Копіювання

## 🇺🇦 Українські тексти (Демо-режим)

### Позитивний - Технології
```
Компанія Google представила нову технологію штучного інтелекту. Український стартап розробив чудову платформу для онлайн-навчання. Програмісти створили відмінний додаток для мобільних пристроїв.
```

### Позитивний - Політика
```
Президент України підписав важливий законопроект про цифрову трансформацію. Уряд працює над покращенням економічної ситуації в країні. Міністр закордонних справ виступив з позитивною заявою щодо євроінтеграції.
```

### Позитивний - Спорт
```
Футбольна команда здобула важливу перемогу в чемпіонаті. Спортсмени показали чудові результати на міжнародних змаганнях. Тренер виразив позитивне ставлення до гри команди.
```

### Позитивний - Здоров'я
```
Медична реформа покращує доступність послуг для населення. Лікарі застосовують нові методи діагностики хвороб. Система охорони здоров'я демонструє позитивні зміни.
```

### Негативний - Економіка
```
Економічна ситуація погіршується через погані рішення уряду. Населення стикається з проблемами безробіття. Експерти висловлюють негативні прогнози щодо інфляції.
```

### Нейтральний - Загальне
```
Сьогодні відбулася зустріч представників різних організацій. Учасники обговорили поточні питання розвитку. Наступна зустріч запланована на наступний місяць.
```

---

## 🇬🇧 Англійські тексти (Повні ML-моделі)

### Technology - Positive
```
Google announced a groundbreaking artificial intelligence technology today. The new AI system demonstrates remarkable capabilities in natural language processing. Tech experts praise the innovation as a significant breakthrough in machine learning.
```

### Business - Positive
```
Apple Inc. reported outstanding quarterly earnings exceeding analyst expectations. The company's CEO expressed optimism about future product launches. Shareholders celebrated the excellent financial performance.
```

### Politics - Neutral
```
The President met with Congressional leaders to discuss the proposed legislation. Representatives from both parties attended the meeting at the White House. A statement will be released following the negotiations.
```

### Sports - Positive
```
Manchester United secured a spectacular victory in the championship final. The team demonstrated exceptional performance throughout the tournament. Fans celebrated the amazing achievement in the streets.
```

### Environment - Negative
```
Scientists warn about the terrible consequences of climate change. Recent data shows alarming increases in global temperatures. Experts express serious concerns about the environmental crisis.
```

### Healthcare - Positive
```
Researchers at Stanford University developed an innovative cancer treatment. The new therapy shows promising results in clinical trials. Doctors are optimistic about the breakthrough in medical science.
```

### Crime - Negative
```
Police arrested suspects involved in a major fraud investigation. The illegal operation caused significant financial losses. Authorities describe the criminal activity as highly sophisticated.
```

### Education - Neutral
```
Harvard University announced changes to its admission policies. The new guidelines will affect applicants starting next year. University officials provided detailed information about the modifications.
```

---

## 🧪 Тестові CSV Датасети

### Українська версія (для демо)
```csv
text
"Компанія Google представила нову технологію штучного інтелекту."
"Президент України підписав важливий законопроект про цифрову трансформацію."
"Футбольна команда здобула важливу перемогу в чемпіонаті."
"Медична реформа покращує доступність послуг для населення."
"Економічна ситуація погіршується через погані рішення уряду."
```

### Англійська версія (для ML)
```csv
text
"Google announced a groundbreaking artificial intelligence technology today."
"Apple Inc. reported outstanding quarterly earnings exceeding analyst expectations."
"The President met with Congressional leaders to discuss the proposed legislation."
"Manchester United secured a spectacular victory in the championship final."
"Scientists warn about the terrible consequences of climate change."
"Researchers at Stanford University developed an innovative cancer treatment."
"Police arrested suspects involved in a major fraud investigation."
"Harvard University announced changes to its admission policies."
```

---

## 💡 Як використовувати

1. **Завантажте датасет** на сторінці `/dataset-upload`
2. **Виберіть потрібний текст** з таблиці
3. **Натисніть "Аналіз"** для обробки
4. **Перегляньте результати** на сторінці `/visualization`

---

## 🔍 Очікувані результати

### Українська (Демо)
- ✅ Категорія з позначкою "(демо)"
- ✅ Сентимент базується на ключових словах
- ✅ Сутності - слова з великої літери
- ✅ Ключові слова - перші слова з тексту

### Англійська (ML)
- ✅ Категорія через BART Classification
- ✅ Сентимент через Sentiment Library
- ✅ Сутності через BERT NER
- ✅ Ключові слова через TF-IDF
- ✅ Топіки через LDA
- ✅ Фрази через RAKE
