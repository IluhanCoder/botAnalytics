import React, { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import DatasetSelector from "./data-selector";
import {
  AnalyticsResponse,
  DatasetResponse,
} from "./../../../shared/types/dataset-types";
import datasetService from "./dataset-service";

const DatasetAnalysisPage: React.FC = () => {
  const [selectedDataset, setSelectedDataset] =
    useState<DatasetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyticsResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    if (!selectedDataset?._id) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const result = await datasetService.runAnalytics(selectedDataset._id);
      console.log(result);
      setResult(result);
    } catch (err: any) {
      console.error(err);
      setError("❌ Помилка під час аналізу даних.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResults = async () => {
    if (!selectedDataset?._id || !result) return;
    setSaving(true);
    setError(null);
    setSavedId(null);

    try {
      const res = await datasetService.saveAnalysis(selectedDataset._id, result);
      if (res && res.success) {
        setSavedId(res.id);
      } else {
        setError("❌ Не вдалося зберегти результати.");
      }
    } catch (err: any) {
      console.error(err);
      setError("❌ Помилка під час збереження результатів.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-10 w-full">
      <Typography variant="h5" className="text-center">
        🔍 Обери датасет для аналізу
      </Typography>

      <div className="w-full max-w-lg">
        <DatasetSelector onSelect={setSelectedDataset} />
      </div>

      {selectedDataset && (
        <Paper
          elevation={4}
          className="p-6 w-full max-w-3xl mt-6 border border-gray-200 rounded-xl shadow-md"
        >
          <Typography variant="h6" gutterBottom>
            📄 Обраний датасет:
          </Typography>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-4">
            {JSON.stringify(selectedDataset, null, 2)}
          </pre>

          <div className="flex justify-center mb-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleRunAnalysis}
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} /> : "🚀 Запустити аналіз"}
            </Button>
            {result && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleSaveResults}
                disabled={saving}
                style={{ marginLeft: 12 }}
              >
                {saving ? <CircularProgress size={20} /> : "💾 Зберегти результати"}
              </Button>
            )}
          </div>

          {error && (
            <Typography color="error" className="text-center">
              {error}
            </Typography>
          )}

          {result && (
            <>
              <Divider className="my-4" />
              <Typography variant="h6" gutterBottom>
                🧠 Результати аналізу:
              </Typography>

              <div className="space-y-4">
                {result.map((r, i) => (
                  <Paper
                    key={i}
                    elevation={1}
                    className="p-3 bg-gray-50 border border-gray-100 rounded-lg"
                  >
                    <Typography variant="subtitle2" color="textSecondary">
                      <b>Повідомлення {i + 1}</b>
                    </Typography>

                    <Typography variant="body2" className="mt-1">
                      <b>Оригінал:</b> {r.text}
                    </Typography>
                    <Typography variant="body2">
                      <b>Нормалізовано:</b> {r.cleaned}
                    </Typography>
                    <Typography variant="body2">
                      <b>Токени:</b> {r.tokens.join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      <b>Леми:</b> {r.stemmed.join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      <b>Тональність:</b>{" "}
                      {r.sentiment?.score > 0
                        ? "😊 Позитивна"
                        : r.sentiment?.score < 0
                        ? "😞 Негативна"
                        : "😐 Нейтральна"}{" "}
                      ({r.sentiment?.score})
                    </Typography>

                    {r.category && (
                      <div className="mt-3">
                        <Typography variant="body2" fontWeight="bold">
                          🏷️ Категорія (ML):
                        </Typography>
                        <div className="ml-3 text-sm">{r.category}</div>
                      </div>
                    )}

                    {r.topics && r.topics.length > 0 && (
                      <div className="mt-2">
                        <Typography variant="body2" fontWeight="bold">
                          🧩 Теми (LDA):
                        </Typography>
                        {r.topics.map((topicItem: any, tIndex) => (
                          <div key={tIndex} className="ml-3 text-sm">
                            <b>Тема {tIndex + 1}:</b>{" "}
                            {Array.isArray(topicItem.words)
                              ? topicItem.words
                                  .map((w: any) =>
                                    typeof w === 'object' && w.term
                                      ? `${w.term} (${w.probability.toFixed(3)})`
                                      : String(w)
                                  )
                                  .join(", ")
                              : Array.isArray(topicItem)
                              ? topicItem
                                  .map((term: any) =>
                                    typeof term === 'object' && term.term
                                      ? `${term.term} (${term.probability.toFixed(3)})`
                                      : String(term)
                                  )
                                  .join(", ")
                              : String(topicItem)}
                          </div>
                        ))}
                      </div>
                    )}

                    {r.entities && r.entities.length > 0 && (
                      <div className="mt-3">
                        <Typography variant="body2" fontWeight="bold">
                          🧭 Виявлені сутності (NER):
                        </Typography>

                        <div className="ml-3 space-y-1 text-sm">
                          {r.entities.map((ent: any, eIndex: number) => (
                            <div key={eIndex}>
                              <b>{ent.entity}:</b> {ent.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 🔑 Новий блок для ключових слів */}
                    {r.keywords && r.keywords.length > 0 && (
                      <div className="mt-3">
                        <Typography variant="body2" fontWeight="bold">
                          🗝️ Ключові слова:
                        </Typography>
                        <div className="ml-3 text-sm">
                          {r.keywords.join(", ")}
                        </div>
                      </div>
                    )}

                    {/* 💬 Новий блок для ключових фраз */}
                    {r.keyPhrases && r.keyPhrases.length > 0 && (
                      <div className="mt-3">
                        <Typography variant="body2" fontWeight="bold">
                          💬 Ключові фрази:
                        </Typography>
                        <div className="ml-3 text-sm space-y-1">
                          {r.keyPhrases.map((phrase: string, idx: number) => (
                            <div key={idx}>• {phrase}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Paper>
                ))}
              </div>
            </>
          )}
          {savedId && (
            <Typography color="primary" className="text-center mt-3">
              ✅ Результати збережено (id: {savedId})
            </Typography>
          )}
        </Paper>
      )}
    </div>
  );
};

export default DatasetAnalysisPage;
