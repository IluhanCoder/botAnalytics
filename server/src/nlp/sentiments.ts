export function analyzeSentiment(text: string) {
  const positiveWords = ["добре", "чудово", "супер"];
  const negativeWords = ["погано", "жахливо", "поганий"];

  let score = 0;
  for (const word of text.split(" ")) {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  }

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}
