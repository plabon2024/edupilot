import status from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import {
  generateFlashcards as generateFlashcardsAI,
  generateQuiz as generateQuizAI,
  generateSummary as generateSummaryAI,
  chatWithContext,
  explainConcept as explainConceptAI,
} from '../../utils/geminiService';
import { findRelevantChunks, Chunk } from '../../utils/textChunker';

// ─── Helper: resolve document or throw ───────────────────────────────────────
const resolveDocument = async (documentId: string, userId: string) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId, status: 'READY' },
  });
  if (!document) throw new AppError(status.NOT_FOUND, 'Document not found or not ready');
  return document;
};

// ─── Generate Flashcards ──────────────────────────────────────────────────────
const generateFlashcards = async (userId: string, documentId: string, count: number = 10) => {
  const document = await resolveDocument(documentId, userId);
  const cards = await generateFlashcardsAI(document.extractedText ?? '', count);

  return prisma.flashcard.create({
    data: {
      userId,
      documentId: document.id,
      cards: {
        create: cards.map((card) => ({
          question: card.question,
          answer: card.answer,
          difficulty: (card.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD'),
        })),
      },
    },
    include: { cards: true },
  });
};

// ─── Generate Quiz ────────────────────────────────────────────────────────────
const generateQuiz = async (
  userId: string,
  documentId: string,
  numQuestions: number = 5,
  title?: string,
) => {
  const document = await resolveDocument(documentId, userId);
  const questions = await generateQuizAI(document.extractedText ?? '', numQuestions);

  return prisma.quiz.create({
    data: {
      userId,
      documentId: document.id,
      title: title ?? `${document.title} - Quiz`,
      totalQuestions: questions.length,
      questions: {
        create: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation ?? '',
          difficulty: (q.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD'),
        })),
      },
    },
    include: { questions: true },
  });
};

// ─── Generate Summary ─────────────────────────────────────────────────────────
const generateSummary = async (userId: string, documentId: string) => {
  const document = await resolveDocument(documentId, userId);
  const summary = await generateSummaryAI(document.extractedText ?? '');
  return { documentId: document.id, title: document.title, summary };
};

// ─── Chat With Document ───────────────────────────────────────────────────────
const chat = async (userId: string, documentId: string, question: string) => {
  const document = await resolveDocument(documentId, userId);

  const chunks = document.chunks as unknown as Chunk[];
  const relevantChunks = findRelevantChunks(chunks, question, 3);
  const chunkIndices = relevantChunks.map((c) => c.chunkIndex);

  // Upsert chat history
  let chatHistory = await prisma.chatHistory.findFirst({
    where: { userId, documentId: document.id },
  });
  if (!chatHistory) {
    chatHistory = await prisma.chatHistory.create({
      data: { userId, documentId: document.id },
    });
  }

  const answer = await chatWithContext(question, relevantChunks);

  await prisma.chatMessage.createMany({
    data: [
      { chatHistoryId: chatHistory.id, role: 'USER', content: question, relevantChunks: [] },
      { chatHistoryId: chatHistory.id, role: 'ASSISTANT', content: answer, relevantChunks: chunkIndices },
    ],
  });

  return { question, answer, relevantChunks: chunkIndices, chatHistoryId: chatHistory.id };
};

// ─── Explain Concept ──────────────────────────────────────────────────────────
const explainConcept = async (userId: string, documentId: string, concept: string) => {
  const document = await resolveDocument(documentId, userId);

  const chunks = document.chunks as unknown as Chunk[];
  const relevantChunks = findRelevantChunks(chunks, concept, 3);
  const context = relevantChunks.map((c) => c.content).join('\n\n');

  const explanation = await explainConceptAI(concept, context);

  return {
    concept,
    explanation,
    relevantChunks: relevantChunks.map((c) => c.chunkIndex),
  };
};

// ─── Get Chat History ─────────────────────────────────────────────────────────
const getChatHistory = async (userId: string, documentId: string) => {
  const history = await prisma.chatHistory.findFirst({
    where: { userId, documentId },
    include: { messages: { orderBy: { timestamp: 'asc' } } },
  });
  return history?.messages ?? [];
};

export const AiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};
