import nlp from "compromise";

/**
 * Extract entities using compromise + fallback heuristics.
 */
export function extractEntities(text: string) {
  const doc = nlp(text);

  // первинний вид NER через compromise
  let persons: string[] = doc.people().out("array") || [];
  let organizations: string[] = (doc.organizations ? doc.organizations().out("array") : []) || [];

  // Невелика нормалізація: обрізаємо пунктуацію справа
  const cleanValue = (s: string) => s.replace(/^[\s"']+|[\s"'.!,;:?]+$/g, "");

  persons = Array.from(new Set(persons.map(cleanValue).filter(Boolean)));
  organizations = Array.from(new Set(organizations.map(cleanValue).filter(Boolean)));

  // === FALLBACK 1: sequences of capitalized words (e.g. "Elon Musk", "John von Neumann")
  const capSeqRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g;
  const capSeqs = new Set<string>();
  let m;
  while ((m = capSeqRegex.exec(text)) !== null) {
    capSeqs.add(cleanValue(m[0]));
  }
  capSeqs.forEach((s) => {
    if (!persons.includes(s) && !organizations.includes(s)) {
      // Heuristic: if it contains two words -> likely person; else add to organizations fallback
      if (s.split(/\s+/).length >= 2) persons.push(s);
      else organizations.push(s);
    }
  });

  // === FALLBACK 2: CamelCase / Brand-like tokens (e.g. "SpaceX", "iPhone", "OpenAI")
  const camelRegex = /\b([A-Z][a-z0-9]*[A-Z][A-Za-z0-9]*)\b/g;
  const camelHits = new Set<string>();
  while ((m = camelRegex.exec(text)) !== null) {
    camelHits.add(cleanValue(m[0]));
  }
  camelHits.forEach((s) => {
    if (!organizations.includes(s) && !persons.includes(s)) organizations.push(s);
  });

  // === FALLBACK 3: Simple place detection: capitalized single tokens followed by common words like "Street", "Avenue", state names etc.
  const placeSuffixRegex = /\b([A-Z][a-z]+(?:\s+(Street|Avenue|Boulevard|St|Rd|Road|Drive|Lane|Court|California|NY|New York))?)\b/g;
  while ((m = placeSuffixRegex.exec(text)) !== null) {
    const p = cleanValue(m[0]);
  }

  // Упорядкувати та повернути
  return {
    persons: Array.from(new Set(persons)).filter(Boolean),
    organizations: Array.from(new Set(organizations)).filter(Boolean)
  };
}
