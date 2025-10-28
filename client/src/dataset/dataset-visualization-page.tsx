import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import datasetService from "./dataset-service";
import { DatasetResponse, AnalyticsResponse } from "./../../../shared/types/dataset-types";
// charts
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
// Word cloud implemented without external libs to avoid dependency conflicts

const DatasetVisualizationPage: React.FC = () => {
  const theme = useTheme();
  const [datasets, setDatasets] = useState<DatasetResponse[]>([]);
  const [selected, setSelected] = useState<DatasetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawAnalyses, setRawAnalyses] = useState<any[] | null>(null);
  // filters
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [minKeywordFreq, setMinKeywordFreq] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  // message pagination
  const [page, setPage] = useState<number>(0);
  const pageSize = 8;
  // export container ref - captures only visualization content
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const ds = await datasetService.fetchDatasetsWithAnalytics();
        setDatasets(ds);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleSelect = async (d: DatasetResponse) => {
    setSelected(d);
    setRawAnalyses(null);
    setError(null);
    setLoading(true);
    try {
      const res = await datasetService.fetchAnalyses(d._id);
      // store raw analysis documents (they contain createdAt)
      setRawAnalyses(res);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити результати");
    } finally {
      setLoading(false);
    }
  };

  // derive flattened messages from raw analyses (attach analysis createdAt)
  const allMessages = useMemo(() => {
    if (!rawAnalyses) return null;
    return rawAnalyses.flatMap((r: any) => (r.result || []).map((m: any) => ({ ...m, analysisCreatedAt: r.createdAt })));
  }, [rawAnalyses]);

  // apply filters to messages
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

  // aggregate keywords frequency -> array sorted by freq desc
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
    let pos = 0,
      neg = 0,
      neu = 0;
    displayMessages.forEach((a: AnalyticsResponse) => {
      const s = a.sentiment?.score || 0;
      if (s > 0) pos++;
      else if (s < 0) neg++;
      else neu++;
    });
    return { positive: pos, negative: neg, neutral: neu };
  }, [displayMessages]);

  // prepare chart data
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

  const exportToPDF = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      // Wait for word cloud to fully render (it uses dynamic import)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const { jsPDF } = jsPDFModule as any;
      const node = exportRef.current;
      
      // Capture with higher scale and better quality
      const canvas = await html2canvas(node, { 
        scale: 2.5, 
        useCORS: true, 
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 1100,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL("image/png", 1.0);

      // Use portrait orientation with better page breaks
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add margins for better spacing
      const margin = 8;
      const contentWidth = pdfWidth - 2 * margin;
      const contentHeight = pdfHeight - 2 * margin;
      
      // Calculate scaling to fit width
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let yPosition = margin;

      // Add first page
      pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
      heightLeft -= contentHeight;

      // Add subsequent pages if content is longer
      while (heightLeft > 0) {
        yPosition = -(imgHeight - heightLeft) + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }

      const ts = selected ? new Date(selected.uploadedAt).toISOString().slice(0, 19).replace(/[:T]/g, "-") : Date.now();
      pdf.save(`visualization-${ts}.pdf`);
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.default || xlsxModule;
      
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ["Аналітичний звіт"],
        [""],
        ["Датасет", selected ? new Date(selected.uploadedAt).toLocaleString() : ""],
        ["Всього повідомлень", displayMessages.length],
        [""],
        ["Фільтри"],
        ["Від дати", dateFrom ?? "не встановлено"],
        ["До дати", dateTo ?? "не встановлено"],
        ["Тональність", sentimentFilter === "all" ? "всі" : sentimentFilter],
        ["Мін. частота слова", minKeywordFreq],
        [""],
        ["Розподіл тональності"],
        ["Позитивні", sentimentStats.positive],
        ["Негативні", sentimentStats.negative],
        ["Нейтральні", sentimentStats.neutral],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Звіт");

      // Keywords sheet
      const kwRows = keywordsFreq
        .filter(([_, freq]) => freq >= minKeywordFreq)
        .map(([word, freq]) => ({ Слово: word, Частота: freq }));
      const wsKW = XLSX.utils.json_to_sheet(kwRows);
      XLSX.utils.book_append_sheet(wb, wsKW, "Ключові слова");

      // Messages sheet
      const msgRows = (displayMessages || []).map((a: any, i: number) => ({
        "№": i + 1,
        "Текст": a.text,
        "Тональність": a.sentiment?.score ?? 0,
        "Ключові слова": (a.keywords || []).join(", "),
        "Дата": a.analysisCreatedAt ? new Date(a.analysisCreatedAt).toLocaleString() : "",
      }));
      const wsMsgs = XLSX.utils.json_to_sheet(msgRows);
      XLSX.utils.book_append_sheet(wb, wsMsgs, "Повідомлення");

      const ts = selected ? new Date(selected.uploadedAt).toISOString().slice(0, 19).replace(/[:T]/g, "-") : Date.now();
      XLSX.writeFile(wb, `analytics-${ts}.xlsx`);
    } catch (err) {
      console.error("Excel export failed", err);
      alert("Помилка експорту в Excel. Перевірте консоль для деталей.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-6 w-full">
      <Typography variant="h5" className="text-center">
        📊 Візуалізація та звіти по збереженим результатам
      </Typography>

      <div className="w-full max-w-lg">
        <Paper className="p-4">
          <Typography variant="subtitle1">Оберіть датасет:</Typography>
          <div className="flex flex-wrap gap-2 mt-3">
            {datasets.map((d) => (
              <Chip
                key={d._id}
                label={new Date(d.uploadedAt).toLocaleString()}
                onClick={() => handleSelect(d)}
                color={selected?._id === d._id ? "primary" : "default"}
              />
            ))}
            {datasets.length === 0 && (
              <Typography className="mt-2">Немає датасетів з результатами аналізу.</Typography>
            )}
          </div>
        </Paper>
      </div>

      {selected && (
        <>
          {/* Control toolbar - NOT included in PDF export */}
          <Paper elevation={4} className="p-4 w-full max-w-5xl mt-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex gap-3 items-center justify-between flex-wrap">
              <Typography variant="h6">Датасет: {new Date(selected.uploadedAt).toLocaleString()}</Typography>
              <div className="flex gap-2">
                <Button variant="contained" onClick={() => handleSelect(selected)} disabled={loading} size="small">
                  {loading ? <CircularProgress size={16} /> : "🔄 Оновити"}
                </Button>
                <Button variant="outlined" onClick={exportToPDF} disabled={isExporting} size="small">
                  {isExporting ? <CircularProgress size={16} /> : "⬇️ PDF"}
                </Button>
                <Button variant="outlined" onClick={exportToExcel} size="small">⬇️ Excel</Button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-4">
              <Paper elevation={1} className="p-3">
                <Typography variant="subtitle1" gutterBottom>
                  Фільтри
                </Typography>
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

            {error && <Typography color="error" className="mt-3">{error}</Typography>}
          </Paper>

          {/* Visualization content ONLY - this gets exported to PDF */}
          <div ref={exportRef} className="w-full max-w-5xl mt-6" style={{ backgroundColor: "#ffffff", padding: "32px" }}>
            {rawAnalyses && (
              <div className="space-y-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <Typography variant="h4" className="mb-2">📊 Аналітичний звіт</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Датасет: {new Date(selected.uploadedAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Повідомлень: {displayMessages.length}
                  </Typography>
                </div>

                <Divider />

                {/* Sentiment Stats */}
                <div>
                  <Typography variant="h5" className="mb-4">Тональність</Typography>
                  <div className="flex gap-6 justify-center flex-wrap">
                    <Paper className="p-4" elevation={2} style={{ minWidth: 140, textAlign: "center" }}>
                      <Typography variant="h4" className="mb-1">😊</Typography>
                      <Typography variant="body1">Позитивні</Typography>
                      <Typography variant="h5" color="primary">{sentimentStats.positive}</Typography>
                    </Paper>
                    <Paper className="p-4" elevation={2} style={{ minWidth: 140, textAlign: "center" }}>
                      <Typography variant="h4" className="mb-1">😞</Typography>
                      <Typography variant="body1">Негативні</Typography>
                      <Typography variant="h5" color="error">{sentimentStats.negative}</Typography>
                    </Paper>
                    <Paper className="p-4" elevation={2} style={{ minWidth: 140, textAlign: "center" }}>
                      <Typography variant="h4" className="mb-1">😐</Typography>
                      <Typography variant="body1">Нейтральні</Typography>
                      <Typography variant="h5" color="textSecondary">{sentimentStats.neutral}</Typography>
                    </Paper>
                  </div>
                </div>

                <Divider />

                {/* Word Cloud */}
                <div>
                  <Typography variant="h5" className="mb-4">Ключові слова</Typography>
                  <div className="p-4 bg-gray-50 rounded" style={{ minHeight: 400 }}>
                    {keywordsFreq.length === 0 ? (
                      <Typography>Ключові слова не знайдені.</Typography>
                    ) : (
                      <WordCloudSVG keywords={keywordsFreq.filter(k => k[1] >= minKeywordFreq).slice(0, 60)} width={1000} height={420} />
                    )}
                  </div>
                </div>

                <Divider />

                {/* Charts */}
                <div>
                  <Typography variant="h5" className="mb-4">Графіки тональності</Typography>
                  <div className="flex gap-8 justify-center items-start flex-wrap">
                    <div style={{ width: 360, minWidth: 300 }}>
                      <Doughnut data={doughnutData} options={{ maintainAspectRatio: true }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 500, maxWidth: 700 }}>
                      <Bar data={barData} options={{ 
                        responsive: true, 
                        maintainAspectRatio: true,
                        plugins: { 
                          title: { display: true, text: 'Розподіл тональностей', font: { size: 16 } },
                          legend: { display: false }
                        } 
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message list - shown in UI but NOT in PDF export */}
          {rawAnalyses && (
            <Paper elevation={4} className="p-4 w-full max-w-5xl mt-6 border border-gray-200 rounded-lg shadow-sm">
              <Typography variant="h6" className="mb-3">Перелік повідомлень (огляд)</Typography>
              <div className="space-y-2">
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

                {/* pager */}
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <Button size="small" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Попередня</Button>
                    <Button size="small" disabled={(page + 1) * pageSize >= displayMessages.length} onClick={() => setPage((p) => p + 1)}>Наступна</Button>
                  </div>
                  <Typography variant="body2">Сторінка {page + 1} / {Math.max(1, Math.ceil(displayMessages.length / pageSize))}</Typography>
                </div>
              </div>
            </Paper>
          )}
        </>
      )}
    </div>
  );
};

export default DatasetVisualizationPage;

type KW = [string, number];

const WordCloudSVG: React.FC<{ keywords: KW[]; width: number; height: number }> = ({ keywords, width, height }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // clear contents
    el.innerHTML = "";

    if (!keywords || keywords.length === 0) return;

    const list = keywords.map(([text, value]) => [text, value]);

    // dynamic import to avoid top-level type issues
    let cancelled = false;
    (async () => {
      try {
        // @ts-ignore - import commonjs module
        const mod = await import("wordcloud");
        const WordCloud = mod.default || mod;

        if (cancelled) return;

        WordCloud(el, {
          list,
          // smaller gridSize -> denser packing; clamp between 4 and 24
          gridSize: Math.max(4, Math.round(Math.min(10, 300 / Math.max(1, keywords.length)))),
          // increase weightFactor so words occupy more space and render with bigger font
          weightFactor: (w: number) => Math.max(15, w * 16),
          // allow some vertical words but not too many
          rotateRatio: 0.12,
          // rotationSteps=2 gives 0 or 90 degrees
          rotationSteps: 2,
          // do not draw words that exceed bounds
          drawOutOfBound: false,
          // try to fit into container
          shrinkToFit: true,
          // make elliptical packing slightly squashed for density
          ellipticity: 0.3,
          // keep larger words prioritized (do not shuffle)
          shuffle: false,
          fontFamily: 'sans-serif',
          backgroundColor: "透明", // keep as transparent background
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
