import React, { useState } from "react";
import { TextField, Button, Paper, Typography } from "@mui/material";
import api from "../api";
import { StopwordResponse } from "../../../shared/types/stopword-types";

interface Props {
  onAdd: (newWord: string) => void;
}

const StopwordPage: React.FC<Props> = ({ onAdd }) => {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data } = await api.post<StopwordResponse>("/stopword", { content: word });
      setMessage("✅ Слово успішно додано!");
      setWord("");
      onAdd(data.content); // 👈 передаємо нове слово наверх
    } catch (err) {
      setMessage("❌ Помилка при додаванні.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Paper
        elevation={4}
        className="p-6 w-full max-w-md rounded-2xl shadow-lg border border-gray-100"
      >
        <Typography variant="h6" className="mb-4 text-center font-semibold">
          Додати стоп-слово
        </Typography>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Стоп-слово"
            variant="outlined"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition-all"
          >
            {loading ? "Додаємо..." : "Додати"}
          </Button>
        </form>

        {message && (
          <Typography variant="body2" className="text-center mt-4 text-gray-600">
            {message}
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default StopwordPage;
