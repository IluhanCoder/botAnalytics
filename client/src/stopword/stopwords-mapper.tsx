import React, { useEffect, useState, useCallback, useContext } from "react";
import { CircularProgress, Typography, Paper, List, ListItem, IconButton, Alert, Button, Switch, FormControlLabel, Divider, Collapse } from "@mui/material";
import stopwordService from "./stopword-service";
import { StopwordResponse } from "../../../shared/types/stopword-types";
import StopwordPage from "./stopword-page";
import { AuthContext } from "../auth/auth-provider";

const StopwordMapper: React.FC = () => {
  const [stopwords, setStopwords] = useState<StopwordResponse[]>([]);
  const [defaultStopwords, setDefaultStopwords] = useState<string[]>([]);
  const [disabledStopwords, setDisabledStopwords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedBuiltIn, setExpandedBuiltIn] = useState(false);
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.userRole === 'admin';

  const fetchStopwords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await stopwordService.fetchStopWords();
      console.log(result);
      setStopwords([...result.stopwords]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDefaultStopwords = useCallback(async () => {
    try {
      const result = await stopwordService.fetchDefaultStopwords();
      setDefaultStopwords(result.defaultStopwords);
      setDisabledStopwords(result.disabledStopwords);
    } catch (err) {
      console.error("Failed to fetch default stopwords:", err);
    }
  }, []);

  useEffect(() => {
    fetchStopwords();
    fetchDefaultStopwords();
  }, []);

  const handleNewWord = async (newWord: string) => {
    fetchStopwords();
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      await stopwordService.deleteStopwordById(id);
      fetchStopwords();
    } catch (err) {
      console.error("Failed to delete stopword:", err);
    }
  };

  const handleToggleDefault = async (word: string, currentlyEnabled: boolean) => {
    if (!isAdmin) return;
    try {
      await stopwordService.toggleDefaultStopword(word, !currentlyEnabled);
      fetchDefaultStopwords();
    } catch (err) {
      console.error("Failed to toggle default stopword:", err);
    }
  };

  const isWordEnabled = (word: string) => !disabledStopwords.includes(word);

  return (
    <div className="flex flex-col gap-8 p-6">
      {!isAdmin && (
        <Alert severity="info" className="max-w-2xl mx-auto">
          ℹ️ Тільки адміністратори можуть додавати та видаляти стоп-слова. Ви можете переглядати список.
        </Alert>
      )}

      {isAdmin && <StopwordPage onAdd={handleNewWord} />}

      {/* Custom stopwords section - MOVED UP */}
      <Paper elevation={3} className="p-6 w-full max-w-2xl mx-auto rounded-2xl shadow-md">
        <Typography variant="h6" className="mb-4 text-center font-semibold">
          Стоп-слова з бази
        </Typography>

        <Alert severity="success" className="mb-4">
          ✅ Ці слова об'єднуються з вбудованими стоп-словами при аналізі тексту
        </Alert>

        {loading ? (
          <div className="flex justify-center my-6">
            <CircularProgress />
          </div>
        ) : (
          <List>
            {stopwords.map((s, i) => (
              <ListItem
                key={s._id || i}
                className="border-b last:border-none border-gray-200 py-2 flex justify-between items-center"
              >
                <Typography variant="body1">
                  {i + 1}. {s.content}
                </Typography>
                {isAdmin && (
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => handleDelete(s._id)}
                  >
                    Видалити
                  </Button>
                )}
              </ListItem>
            ))}

            {stopwords.length === 0 && (
              <Typography className="text-center text-gray-500 mt-8">
                💤 Немає жодного стоп-слова в базі (використовуються тільки вбудовані)
              </Typography>
            )}
          </List>
        )}
      </Paper>

      <Divider className="my-4 w-full mx-auto" />

      {/* Built-in stopwords section - COLLAPSIBLE */}
      <Paper elevation={3} className="p-6 w-full max-w-2xl mx-auto rounded-2xl shadow-md">
        <div 
          className="flex justify-between items-center cursor-pointer mb-4"
          onClick={() => setExpandedBuiltIn(!expandedBuiltIn)}
        >
          <Typography variant="h6" className="font-semibold">
            Вбудовані стоп-слова
          </Typography>
          <Button size="small">
            {expandedBuiltIn ? '▲ Згорнути' : '▼ Розгорнути'}
          </Button>
        </div>

        <Alert severity="info" className="mb-4">
          📚 Ці слова вбудовані в систему. {isAdmin ? "Ви можете вимкнути будь-яке з них." : "Тільки адміністратор може їх вимикати."}
        </Alert>

        <Collapse in={expandedBuiltIn}>
          <List>
            {defaultStopwords.map((word, i) => {
              const enabled = isWordEnabled(word);
              return (
                <ListItem
                  key={i}
                  className="border-b last:border-none border-gray-200 gap-2 py-2 flex justify-between items-center"
                >
                  <Typography 
                    variant="body1" 
                    style={{ 
                      textDecoration: enabled ? 'none' : 'line-through',
                      opacity: enabled ? 1 : 0.5 
                    }}
                  >
                    {i + 1}. {word}
                  </Typography>
                  {isAdmin && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enabled}
                          onChange={() => handleToggleDefault(word, enabled)}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  )}
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </Paper>
    </div>
  );
};

export default StopwordMapper;
