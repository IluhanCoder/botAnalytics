import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import datasetService from "./dataset-service";
import { DatasetResponse, AnalyticsResponse } from "./../../../shared/types/dataset-types";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, CategoryScale, LinearScale, BarElement, ChartTitle);

interface DatasetVisualizationViewProps {
  datasetId: string;
}

const DatasetVisualizationView: React.FC<DatasetVisualizationViewProps> = ({ datasetId }) => {
  const [selected, setSelected] = useState<DatasetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawAnalyses, setRawAnalyses] = useState<any[] | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [minKeywordFreq, setMinKeywordFreq] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const pageSize = 8;

  useEffect(() => {
    loadDataset();
  }, [datasetId]);

  const loadDataset = async () => {
    setLoading(true);
    setError(null);
    try {
      const datasets = await datasetService.fetchDatasetsWithAnalytics();
      const dataset = datasets.find(d => d._id === datasetId);
      if (!dataset) {
        setError("Датасет не знайдено");
        return;
      }
      setSelected(dataset);
      const res = await datasetService.fetchAnalyses(datasetId);
      setRawAnalyses(res);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити результати");
    } finally {
      setLoading(false);
    }
  };

  const allMessages = useMemo(() => {
    if (!rawAnalyses) return null;
    return rawAnalyses.flatMap((r: any) => (r.result || []).map((m: any) => ({ ...m, analysisCreatedAt: r.createdAt })));
  }, [rawAnalyses]);

  const filteredMessages = useMemo(() => {
    if (!allMessages) return null;
    let msgs = allMessages.slice();
    if (dateFrom) {
      const from = new Date(dateFrom);
      msgs = msgs.filter((m: any) => new Date(m.analysisCreatedAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      msgs = msgs.filter((m: any) => new Date(m.analysisCreatedAt) <= to);
    }
    if (sentimentFilter && sentimentFilter !== "all") {
      msgs = msgs.filter((m: any) => {
        const s = m.sentiment?.score || 0;
        if (sentimentFilter === "positive") return s > 0;
        if (sentimentFilter === "negative") return s < 0;
        return s === 0;
      });
    }
    return msgs;
  }, [allMessages, dateFrom, dateTo, sentimentFilter]);

  const displayMessages = filteredMessages || allMessages || [];

  const keywordsFreq = useMemo(() => {
    const map: { [k: string]: number } = {};
    if (!displayMessages) return [] as [string, number][];
    displayMessages.forEach((a: AnalyticsResponse) => {
      (a.keywords || []).forEach((k: string) => {
        map[k] = (map[k] || 0) + 1;
      });
    });
    const arr = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return arr as [string, number][];
  }, [displayMessages]);

  const sentimentStats = useMemo(() => {
    if (!displayMessages) return { positive: 0, negative: 0, neutral: 0 };
    let pos = 0, neg = 0, neu = 0;
    displayMessages.forEach((a: AnalyticsResponse) => {
      const s = a.sentiment?.score || 0;
      if (s > 0) pos++;
      else if (s < 0) neg++;
      else neu++;
    });
    return { positive: pos, negative: neg, neutral: neu };
  }, [displayMessages]);

  const doughnutData = useMemo(() => {
    const posColor = "#8bffbfff";
    const negColor = "rgba(255, 93, 93, 1)";
    const neuColor = '#e1f2ffff';
    return {
      labels: ["Позитивні", "Негативні", "Нейтральні"],
      datasets: [
        {
          data: [sentimentStats.positive, sentimentStats.negative, sentimentStats.neutral],
          backgroundColor: [posColor, negColor, neuColor],
        },
      ],
    };
  }, [sentimentStats]);

  const barData = useMemo(() => {
    const posColor = "#8bffbfff";
    const negColor = "rgba(255, 93, 93, 1)";
    const neuColor = '#e1f2ffff';
    return {
      labels: ["Позитивні", "Негативні", "Нейтральні"],
      datasets: [
        {
          label: "Кількість",
          data: [sentimentStats.positive, sentimentStats.negative, sentimentStats.neutral],
          backgroundColor: [posColor, negColor, neuColor],
        },
      ],
    };
  }, [sentimentStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center mt-10">
        <Typography color="error">{error}</Typography>
        <Button onClick={loadDataset} className="mt-4">Спробувати знову</Button>
      </div>
    );
  }

  if (!selected) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-6 w-full px-4">
      <Paper elevation={4} className="p-4 w-full max-w-5xl border border-gray-200 rounded-lg shadow-sm">
        <Typography variant="h6">Датасет: {new Date(selected.uploadedAt).toLocaleString()}</Typography>

        <div className="mt-3 flex gap-3 items-center">
          <Button variant="contained" onClick={loadDataset} disabled={loading} size="small">
            {loading ? <CircularProgress size={16} /> : "🔄 Оновити"}
          </Button>
          <Typography variant="body2" color="textSecondary">Показано повідомлень: {displayMessages.length}</Typography>
        </div>

        {/* Filters */}
        <div className="mt-4">
          <Paper elevation={1} className="p-3">
            <Typography variant="subtitle1" gutterBottom>Фільтри</Typography>
            <div className="flex flex-wrap gap-4 items-end">
              <TextField
                label="From"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={dateFrom ?? ""}
                onChange={(e) => setDateFrom(e.target.value || null)}
              />
              <TextField
                label="To"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={dateTo ?? ""}
                onChange={(e) => setDateTo(e.target.value || null)}
              />
              <FormControl size="small" style={{ minWidth: 160 }}>
                <InputLabel id="sentiment-filter-label">Тональність</InputLabel>
                <Select
                  labelId="sentiment-filter-label"
                  value={sentimentFilter}
                  label="Тональність"
                  onChange={(e) => setSentimentFilter(e.target.value as string)}
                >
                  <MenuItem value="all">Всі</MenuItem>
                  <MenuItem value="positive">Позитивні</MenuItem>
                  <MenuItem value="negative">Негативні</MenuItem>
                  <MenuItem value="neutral">Нейтральні</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Мін. частота слова"
                type="number"
                size="small"
                inputProps={{ min: 1 }}
                value={minKeywordFreq}
                onChange={(e) => setMinKeywordFreq(Math.max(1, Number(e.target.value) || 1))}
              />
              <div>
                <Button onClick={() => { setDateFrom(null); setDateTo(null); setSentimentFilter("all"); setMinKeywordFreq(1); }}>
                  Очистити
                </Button>
              </div>
            </div>
          </Paper>
        </div>

        {rawAnalyses && (
          <>
            <Divider className="my-4" />

            <Typography variant="h6">Тональність</Typography>
            <div className="flex gap-4 mt-2">
              <Paper className="p-3" style={{ minWidth: 120 }}>
                <Typography>😊 Позитивні</Typography>
                <Typography variant="h6">{sentimentStats.positive}</Typography>
              </Paper>
              <Paper className="p-3" style={{ minWidth: 120 }}>
                <Typography>😞 Негативні</Typography>
                <Typography variant="h6">{sentimentStats.negative}</Typography>
              </Paper>
              <Paper className="p-3" style={{ minWidth: 120 }}>
                <Typography>😐 Нейтральні</Typography>
                <Typography variant="h6">{sentimentStats.neutral}</Typography>
              </Paper>
            </div>

            <Divider className="my-4" />

            <Typography variant="h6">Хмара ключових слів (топ 30)</Typography>
            <div className="mt-3 p-3 bg-gray-50 rounded" style={{ height: 300 }}>
              {keywordsFreq.length === 0 ? (
                <div>Ключові слова не знайдені.</div>
              ) : (
                <WordCloudSVG keywords={keywordsFreq.filter(k => k[1] >= minKeywordFreq).slice(0, 60)} width={800} height={320} />
              )}
            </div>

            <Divider className="my-4" />

            <Typography variant="h6">Графіки тональності</Typography>
            <div className="flex gap-6 mt-3 items-start">
              <div style={{ width: 300 }}>
                <Doughnut data={doughnutData} />
              </div>
              <div style={{ flex: 1, minWidth: 420 }}>
                <Bar data={barData} options={{ responsive: true, plugins: { title: { display: true, text: 'Розподіл тональностей' } } }} />
              </div>
            </div>

            <Divider className="my-4" />

            <Typography variant="h6">Перелік повідомлень (огляд)</Typography>
            <div className="space-y-2 mt-2">
              <div style={{ maxHeight: 360, overflow: "auto", paddingRight: 8 }}>
                {displayMessages.slice(page * pageSize, (page + 1) * pageSize).map((a: AnalyticsResponse, idx: number) => (
                  <Paper key={idx} className="p-3 bg-white border rounded mb-2">
                    <Typography variant="subtitle2">Повідомлення {page * pageSize + idx + 1}</Typography>
                    <Typography variant="body2"><b>Оригінал:</b> {a.text}</Typography>
                    <Typography variant="body2"><b>Тональність:</b> {a.sentiment?.score}</Typography>
                    {a.keywords && a.keywords.length > 0 && (
                      <div className="mt-1">
                        <Typography variant="body2"><b>Ключові слова:</b> {a.keywords.join(", ")}</Typography>
                      </div>
                    )}
                  </Paper>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <Button size="small" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Попередня</Button>
                  <Button size="small" disabled={(page + 1) * pageSize >= displayMessages.length} onClick={() => setPage((p) => p + 1)}>Наступна</Button>
                </div>
                <Typography variant="body2">Сторінка {page + 1} / {Math.max(1, Math.ceil(displayMessages.length / pageSize))}</Typography>
              </div>
            </div>
          </>
        )}
      </Paper>
    </div>
  );
};

export default DatasetVisualizationView;

type KW = [string, number];

const WordCloudSVG: React.FC<{ keywords: KW[]; width: number; height: number }> = ({ keywords, width, height }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    if (!keywords || keywords.length === 0) return;

    const list = keywords.map(([text, value]) => [text, value]);

    let cancelled = false;
    (async () => {
      try {
        // @ts-ignore
        const mod = await import("wordcloud");
        const WordCloud = mod.default || mod;

        if (cancelled) return;

        WordCloud(el, {
          list,
          gridSize: Math.max(4, Math.round(Math.min(10, 300 / Math.max(1, keywords.length)))),
          weightFactor: (w: number) => Math.max(15, w * 16),
          rotateRatio: 0.12,
          rotationSteps: 2,
          drawOutOfBound: false,
          shrinkToFit: true,
          ellipticity: 0.3,
          shuffle: false,
          fontFamily: 'sans-serif',
          backgroundColor: "transparent",
        });
      } catch (err) {
        console.error("wordcloud load err", err);
      }
    })();

    return () => {
      cancelled = true;
      if (el) el.innerHTML = "";
    };
  }, [keywords, width, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height }} />
  );
};
