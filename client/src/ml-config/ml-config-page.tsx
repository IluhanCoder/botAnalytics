import React, { useEffect, useState, useContext } from "react";
import {
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import { AuthContext } from "../auth/auth-provider";
import { useNavigate } from "react-router-dom";
import mlConfigService, { MLConfig } from "./ml-config-service";

const MLConfigPage: React.FC = () => {
  const [config, setConfig] = useState<MLConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = authContext?.userRole === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadConfig();
  }, [isAdmin]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await mlConfigService.getConfig();
      setConfig(data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Не вдалося завантажити налаштування' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await mlConfigService.updateConfig(config);
      setConfig(updated);
      setMessage({ type: 'success', text: '✅ Налаштування збережено! Вони застосуються до наступного аналізу.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Помилка при збереженні' });
    } finally {
      setSaving(false);
    }
  };

  const handleLabelChange = (index: number, value: string) => {
    if (!config) return;
    const newLabels = [...config.classificationLabels];
    newLabels[index] = value;
    setConfig({ ...config, classificationLabels: newLabels });
  };

  const addLabel = () => {
    if (!config) return;
    setConfig({ ...config, classificationLabels: [...config.classificationLabels, "New Label"] });
  };

  const removeLabel = (index: number) => {
    if (!config) return;
    const newLabels = config.classificationLabels.filter((_, i) => i !== index);
    setConfig({ ...config, classificationLabels: newLabels });
  };

  if (!isAdmin) return null;

  if (loading || !config) {
    return (
      <div className="flex justify-center items-center p-12">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <Typography variant="h4" className="text-center">
        ⚙️ Налаштування ML-моделей
      </Typography>

      <Alert severity="info">
        💡 Ці параметри контролюють поведінку моделей машинного навчання при аналізі текстів
      </Alert>

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Paper elevation={3} className="p-6">
        <Typography variant="h6" className="mb-4">
          🔢 Кількісні параметри
        </Typography>

        <div className="flex flex-col gap-4">
          <TextField
            label="Кількість ключових слів"
            type="number"
            value={config.keywordsCount}
            onChange={(e) => setConfig({ ...config, keywordsCount: parseInt(e.target.value) || 10 })}
            InputProps={{ inputProps: { min: 1, max: 50 } }}
            helperText="Скільки ключових слів витягувати з тексту (1-50)"
          />

          <TextField
            label="Кількість тем (LDA)"
            type="number"
            value={config.topicsCount}
            onChange={(e) => setConfig({ ...config, topicsCount: parseInt(e.target.value) || 2 })}
            InputProps={{ inputProps: { min: 1, max: 10 } }}
            helperText="Скільки тем визначати в тексті (1-10)"
          />

          <TextField
            label="Термінів на тему"
            type="number"
            value={config.termsPerTopic}
            onChange={(e) => setConfig({ ...config, termsPerTopic: parseInt(e.target.value) || 5 })}
            InputProps={{ inputProps: { min: 1, max: 20 } }}
            helperText="Скільки слів на кожну тему (1-20)"
          />
        </div>
      </Paper>

      <Paper elevation={3} className="p-6">
        <Typography variant="h6" className="mb-4">
          🎛️ Увімкнення/вимкнення компонентів
        </Typography>

        <div className="flex flex-col gap-3">
          <FormControlLabel
            control={
              <Switch
                checked={config.sentimentEnabled}
                onChange={(e) => setConfig({ ...config, sentimentEnabled: e.target.checked })}
              />
            }
            label="😊 Аналіз тональності (Sentiment Analysis)"
          />

          <FormControlLabel
            control={
              <Switch
                checked={config.nerEnabled}
                onChange={(e) => setConfig({ ...config, nerEnabled: e.target.checked })}
              />
            }
            label="🧠 Розпізнавання іменованих сутностей (NER)"
          />

          <FormControlLabel
            control={
              <Switch
                checked={config.classificationEnabled}
                onChange={(e) => setConfig({ ...config, classificationEnabled: e.target.checked })}
              />
            }
            label="🏷️ Класифікація за категоріями"
          />
        </div>
      </Paper>

      {config.classificationEnabled && (
        <Paper elevation={3} className="p-6">
          <Typography variant="h6" className="mb-4">
            🏷️ Категорії класифікації
          </Typography>

          <Alert severity="info" className="mb-4">
            Модель буде класифікувати тексти за цими категоріями
          </Alert>

          <div className="flex flex-col gap-3">
            {config.classificationLabels.map((label, index) => (
              <div key={index} className="flex gap-2 items-center">
                <TextField
                  fullWidth
                  size="small"
                  value={label}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeLabel(index)}
                  disabled={config.classificationLabels.length <= 1}
                >
                  Видалити
                </Button>
              </div>
            ))}

            <Button variant="outlined" onClick={addLabel}>
              + Додати категорію
            </Button>
          </div>
        </Paper>
      )}

      <div className="flex gap-3 justify-center">
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : "💾 Зберегти налаштування"}
        </Button>

        <Button
          variant="outlined"
          size="large"
          onClick={loadConfig}
          disabled={loading}
        >
          🔄 Скинути зміни
        </Button>
      </div>

      <Alert severity="warning">
        ⚠️ Зміни застосуються тільки до нових аналізів. Вже збережені результати не зміняться.
      </Alert>
    </div>
  );
};

export default MLConfigPage;
