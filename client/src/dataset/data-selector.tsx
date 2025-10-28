import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Button,
} from "@mui/material";
import api from "../api"; // 👈 твій axios інстанс
import datasetService from "./dataset-service";
import { DatasetFetchResponse, DatasetResponse } from "../../../shared/types/dataset-types";

interface Props {
  onSelect: (dataset: DatasetResponse) => void;
}

export default function DatasetSelector({ onSelect }: Props) {
  const [datasets, setDatasets] = useState<DatasetResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Завантаження з бази
  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      setError(null);
      try {
        // 👇 Реальний запит
        const datasets = await datasetService.fetchDatasets();
        setDatasets(datasets);

        // 🧪 Тимчасові фейкові дані для розробки:
      } catch (err) {
        setError("❌ Не вдалося завантажити датасети.");
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  const handleSelect = (ds: DatasetResponse) => {
    setSelected(ds._id);
    onSelect(ds);
  };

  return (
    <div className="flex flex-col items-center mt-8 w-full">
      <Typography variant="h5" gutterBottom>
        📚 Обери датасет для глибокого аналізу
      </Typography>

      <Paper elevation={3} className="p-4 w-full max-w-2xl">
        {loading ? (
          <div className="flex justify-center my-8">
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : datasets.length === 0 ? (
          <Typography color="text.secondary">Немає збережених датасетів</Typography>
        ) : (
          <List>
            {datasets.map((ds, i) => (
              <ListItem key={ds._id} disablePadding>
                <ListItemButton
                  selected={selected === ds._id}
                  onClick={() => handleSelect(ds)}
                >
                  <ListItemText
                    primary={`dataset ${i}`}
                    secondary={`📅 ${new Date(ds.uploadedAt).toLocaleDateString()}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {selected && (
        <div className="mt-6">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const ds = datasets.find((d) => d._id === selected);
              if (ds) onSelect(ds);
            }}
          >
            ✅ Обрати датасет
          </Button>
        </div>
      )}
    </div>
  );
}
