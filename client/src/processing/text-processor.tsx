// import React, { useState } from "react";

// const stopwords = [
//   "і", "й", "та", "але", "в", "у", "на", "що", "це", "до", "з", "із", "чи", "як", "за", "бо", "від"
// ];

// const normalizeText = (text: string) =>
//   text
//     .toLowerCase()
//     .replace(/[^\p{L}\p{N}\s]/gu, "") // видалити пунктуацію
//     .replace(/\s+/g, " ") // зайві пробіли
//     .trim();

// const tokenize = (text: string) => text.split(" ").filter(Boolean);

// const removeStopwords = (tokens: string[]) =>
//   tokens.filter((t) => !stopwords.includes(t));

// const lemmatize = (tokens: string[]) =>
//   // спрощена "лемматизація" — просто видаляємо суфікси
//   tokens.map((t) =>
//     t.replace(/(ами|ями|ого|ому|ів|ев|ем|ах|их|ий|ої|ою|ти|тись|ться)$/g, "")
//   );

// export default function TextProcessor() {
//   const [input, setInput] = useState();
//   const [steps, setSteps] = useState<{
//     normalized?: string;
//     tokens?: string[];
//     noStopwords?: string[];
//     lemmatized?: string[];
//   }>({});

//   const handleProcess = () => {
//     const normalized = normalizeText(input);
//     const tokens = tokenize(normalized);
//     const noStopwords = removeStopwords(tokens);
//     const lemmatized = lemmatize(noStopwords);

//     setSteps({ normalized, tokens, noStopwords, lemmatized });
//   };

//   return (
//     <div className="max-w-xl mx-auto mt-10 space-y-6">
      
//       <button
//         onClick={handleProcess}
//         className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-xl"
//       >
//         Аналізувати
//       </button>

//       {steps.normalized && (
//         <div className="space-y-4">
//           <div>
//             <h3 className="font-semibold text-lg">1️⃣ Нормалізація</h3>
//             <p className="bg-gray-100 p-3 rounded-xl">{steps.normalized}</p>
//           </div>

//           <div>
//             <h3 className="font-semibold text-lg">2️⃣ Токенізація</h3>
//             <p className="bg-gray-100 p-3 rounded-xl">
//               {steps.tokens?.join(", ")}
//             </p>
//           </div>

//           <div>
//             <h3 className="font-semibold text-lg">3️⃣ Видалення стоп-слів</h3>
//             <p className="bg-gray-100 p-3 rounded-xl">
//               {steps.noStopwords?.join(", ")}
//             </p>
//           </div>

//           <div>
//             <h3 className="font-semibold text-lg">4️⃣ Лемматизація (спрощена)</h3>
//             <p className="bg-gray-100 p-3 rounded-xl">
//               {steps.lemmatized?.join(", ")}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
