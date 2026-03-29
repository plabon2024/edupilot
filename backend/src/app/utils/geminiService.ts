import { GoogleGenAI } from '@google/genai';
import { envVars } from '../config/index';

// ─── Client ──────────────────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
  console.warn('[geminiService] WARNING: GEMINI_API_KEY is not set.');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });
const MODEL = 'gemini-2.5-flash-lite';

// ─── Types (exported so service / controller can use them) ───────────────────
export interface FlashcardItem {
  question: string;
  answer: string;
  difficulty: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

export interface DocumentChunk {
  content: string;
  chunkIndex?: number;
  pageNumber?: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getResponseText = (response: any): string => {
  if (typeof response.text === 'function') return response.text();
  if (response.candidates?.[0]?.content?.parts?.[0]?.text)
    return response.candidates[0].content.parts[0].text;
  throw new Error('Unable to extract text from Gemini response');
};

// ─── Generate Flashcards ──────────────────────────────────────────────────────
export const generateFlashcards = async (
  text: string,
  count: number = 10,
): Promise<FlashcardItem[]> => {
  const prompt = `
Generate exactly ${count} educational flashcards from the following text.

Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}
`;
  const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
  const raw = getResponseText(response);
  const flashcards: FlashcardItem[] = [];

  for (const card of raw.split('---').filter((c) => c.trim())) {
    let question = '', answer = '', difficulty = 'medium';
    for (const line of card.split('\n')) {
      if (line.startsWith('Q:')) question = line.substring(2).trim();
      else if (line.startsWith('A:')) answer = line.substring(2).trim();
      else if (line.startsWith('D:')) {
        const d = line.substring(2).trim().toLowerCase();
        if (['easy', 'medium', 'hard'].includes(d)) difficulty = d;
      }
    }
    if (question && answer) flashcards.push({ question, answer, difficulty });
  }
  return flashcards.slice(0, count);
};

// ─── Generate Quiz ────────────────────────────────────────────────────────────
export const generateQuiz = async (
  text: string,
  numQuestions: number = 5,
): Promise<QuizItem[]> => {
  const prompt = `
Generate exactly ${numQuestions} multiple choice questions from the following text.

Format each question as:
Q: [Question]
01: [Option 1]
02: [Option 2]
03: [Option 3]
04: [Option 4]
C: [Correct option exactly as written above]
E: [Brief explanation]
D: [Difficulty: easy, medium, or hard]

Separate each question with "---"

Text:
${text.substring(0, 15000)}
`;
  const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
  const raw = getResponseText(response);
  const questions: QuizItem[] = [];

  for (const block of raw.split('---').filter((b) => b.trim())) {
    let question = '', options: string[] = [], correctAnswer = '', explanation = '', difficulty = 'medium';
    for (const line of block.split('\n')) {
      const t = line.trim();
      if (t.startsWith('Q:')) question = t.substring(2).trim();
      else if (/^0\d:/.test(t)) options.push(t.substring(3).trim());
      else if (t.startsWith('C:')) correctAnswer = t.substring(2).trim();
      else if (t.startsWith('E:')) explanation = t.substring(2).trim();
      else if (t.startsWith('D:')) {
        const d = t.substring(2).trim().toLowerCase();
        if (['easy', 'medium', 'hard'].includes(d)) difficulty = d;
      }
    }
    if (question && options.length === 4 && correctAnswer)
      questions.push({ question, options, correctAnswer, explanation, difficulty });
  }
  return questions.slice(0, numQuestions);
};

// ─── Generate Summary ─────────────────────────────────────────────────────────
export const generateSummary = async (text: string): Promise<string> => {
  const prompt = `
Provide a concise and well-structured summary of the following text.
Highlight the key concepts and main ideas.

Text:
${text.substring(0, 20000)}
`;
  const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
  return getResponseText(response);
};

// ─── Chat With Context ────────────────────────────────────────────────────────
export const chatWithContext = async (
  question: string,
  chunks: DocumentChunk[],
): Promise<string> => {
  const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');
  const prompt = `
Based on the following document context, answer the user's question.
If the answer is not explicitly stated, infer from the context if possible, and be helpful and reasonable in your response. Do not decline to answer just because it isn't explicitly written.

Context:
${context}

Question:
${question}

Answer:
`;
  const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
  return getResponseText(response);
};

// ─── Explain Concept ──────────────────────────────────────────────────────────
export const explainConcept = async (concept: string, context: string): Promise<string> => {
  const prompt = `
Explain the concept of "${concept}" using the following context.
Provide a clear, educational explanation and examples if relevant.

Context:
${context.substring(0, 10000)}
`;
  const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
  return getResponseText(response);
};

// ─── Extract Text From Document ──────────────────────────────────────────────
export const extractTextFromDocument = async (
  mimeType: string,
  buffer: Buffer,
): Promise<string> => {
  const prompt = `
Extract all the text from this document. Return ONLY the extracted text with no additional formatting, markdown, or commentary. Preserve paragraph breaks.
`;
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              // Map text/plain to text/plain, etc. Gemini works best with application/pdf & images
              mimeType: mimeType === 'application/msword' ? 'text/plain' : mimeType,
              data: buffer.toString('base64'),
            },
          },
          { text: prompt },
        ],
      },
    ],
  });
  return getResponseText(response);
};

