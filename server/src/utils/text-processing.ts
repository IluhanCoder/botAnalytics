import natural from "natural";
import stopwordService from "../stopword/stopword-service";

// Default stopwords from library
export const defaultStopwords = [
  "і", "й", "та", "але", "в", "у", "на", "що", "це", "до", "з", "із", "чи", "як", "за", "бо", "від"
];

let customStopwords: string[] = [];
let disabledDefaultStopwords: Set<string> = new Set();

// Function to load custom stopwords from database
export async function loadCustomStopwords(): Promise<void> {
  try {
    const stopwords = await stopwordService.fetchStopwords();
    customStopwords = stopwords.map(sw => sw.content.toLowerCase());
  } catch (error) {
    console.error("Failed to load custom stopwords:", error);
    customStopwords = [];
  }
}

// Toggle default stopword on/off
export function toggleDefaultStopword(word: string, enabled: boolean): void {
  if (enabled) {
    disabledDefaultStopwords.delete(word.toLowerCase());
  } else {
    disabledDefaultStopwords.add(word.toLowerCase());
  }
}

// Get all enabled default stopwords
function getEnabledDefaultStopwords(): string[] {
  return defaultStopwords.filter(word => !disabledDefaultStopwords.has(word));
}

// Get all stopwords (enabled default + custom)
function getAllStopwords(): string[] {
  return [...getEnabledDefaultStopwords(), ...customStopwords];
}

// Get disabled default stopwords list
export function getDisabledStopwords(): string[] {
  return Array.from(disabledDefaultStopwords);
}

export function preprocess(text: string): string {
  const stopwords = getAllStopwords();

  // нормалізація
  let s = text.toLowerCase();
  s = s.replace(/[^\p{L}\p{N}\s]/gu, " ");
  s = s.replace(/\s+/g, " ").trim();

  // видалення стоп-слів
  const tokens = s.split(" ").filter((w) => !stopwords.includes(w));

  // можеш зробити лемматизацію чи стеммінг тут
  // але в прикладі нижче стеммінг окремо

  return tokens.join(" ");
}
