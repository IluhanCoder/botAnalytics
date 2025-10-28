import React, { useState } from "react";
import { Paper, Typography, Button, CircularProgress } from "@mui/material";
import datasetService from "./dataset-service";

// 🧩 Прості стоп-слова
const stopwords = ["і", "в", "на", "з", "що", "це", "до", "як", "але", "чи", "у"];

// 🧠 Текстові операції
const normalizeText = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();

const tokenizeText = (text: string) => text.split(/\s+/);

const removeStopwords = (tokens: string[]) =>
  tokens.filter((t) => !stopwords.includes(t));

const lemmatize = (tokens: string[]) =>
  tokens.map((t) => t.replace(/(ами|ами|ів|ах|ою|ем|ий|у|і|а|о|е|я)$/i, ""));

export default function TextPreprocessor() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [normalized, setNormalized] = useState<string[]>([]);
  const [tokenized, setTokenized] = useState<string[][]>([]);
  const [filtered, setFiltered] = useState<string[][]>([]);
  const [lemmatized, setLemmatized] = useState<string[][]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // === 🧩 Завантаження JSON файлу ===
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile); // зберігаємо для збереження в базу

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error("Файл має бути масивом об'єктів");

        setRawData(json);
        processText(json);
        setError(null);
        setSavedMessage(null);
      } catch (err) {
        setError("❌ Неправильний формат JSON");
      }
    };
    reader.readAsText(selectedFile);
  };

  // === 🔠 Текстові етапи ===
  const processText = (data: any[]) => {
    const texts = data.map((d) => d.content || "");
    const normalizedTexts = texts.map(normalizeText);
    setNormalized(normalizedTexts);

    const tokenizedTexts = normalizedTexts.map(tokenizeText);
    setTokenized(tokenizedTexts);

    const filteredTexts = tokenizedTexts.map(removeStopwords);
    setFiltered(filteredTexts);

    const lemmatizedTexts = filteredTexts.map(lemmatize);
    setLemmatized(lemmatizedTexts);
  };

  // === 💾 Збереження у базу через datasetService ===
  const handleSaveToDB = async () => {
    if (!file) {
      setSavedMessage("⚠️ Спочатку завантаж JSON-файл!");
      return;
    }

    setSaving(true);
    setSavedMessage(null);

    try {
      await datasetService.postDataset(file); // 👈 передаємо сам файл у сервіс
      setSavedMessage("✅ Результати успішно збережено у базі!");
    } catch (err) {
      console.error(err);
      setSavedMessage("❌ Помилка під час збереження у базу.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <Typography variant="h5">📊 Попередній аналіз повідомлень</Typography>

      <Button variant="contained" component="label">
        Завантажити JSON
        <input type="file" hidden accept=".json" onChange={handleFileUpload} />
      </Button>

      {error && <Typography color="error">{error}</Typography>}

      {rawData.length > 0 && (
        <Paper elevation={3} className="p-4 mt-4 w-full max-w-2xl">
          <Typography variant="h6">1️⃣ Оригінальні дані:</Typography>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(rawData.slice(0, 3), null, 2)}
          </pre>

          <Typography variant="h6" className="mt-4">2️⃣ Нормалізація:</Typography>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {normalized.slice(0, 3).join("\n")}
          </pre>

          <Typography variant="h6" className="mt-4">3️⃣ Токенізація:</Typography>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {tokenized.slice(0, 3).map((t) => t.join(", ")).join("\n")}
          </pre>

          <Typography variant="h6" className="mt-4">4️⃣ Видалення стоп-слів:</Typography>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {filtered.slice(0, 3).map((t) => t.join(", ")).join("\n")}
          </pre>

          <Typography variant="h6" className="mt-4">5️⃣ Лемматизація:</Typography>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {lemmatized.slice(0, 3).map((t) => t.join(", ")).join("\n")}
          </pre>

          <div className="flex justify-center mt-6">
            <Button
              variant="contained"
              color="success"
              onClick={handleSaveToDB}
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : "💾 Зберегти у базі"}
          </Button>
          </div>

          {savedMessage && (
            <Typography
              variant="body2"
              align="center"
              className="mt-3 text-gray-700"
            >
              {savedMessage}
            </Typography>
          )}
        </Paper>
      )}
    </div>
  );
}
