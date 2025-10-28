// UploadDataset.tsx
import React, { useState } from "react";
import { Button } from "@mui/material";
import api from "../api";

const UploadDataset: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "application/json") {
      setFile(f);
      setMessage("");
    } else {
      setMessage("Будь ласка, оберіть JSON файл.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      await api.post("/dataset/upload", jsonData); // <— відправляємо як JSON
      setMessage("✅ Файл успішно завантажено!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Помилка при обробці файлу.");
    }
  };

  return (
    <div className="flex flex-col gap-3 items-center mt-8">
      <input type="file" accept=".json" onChange={handleFileChange} />
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Завантажити
      </Button>
      {message && <p className="text-gray-600 mt-2">{message}</p>}
    </div>
  );
};

export default UploadDataset;
