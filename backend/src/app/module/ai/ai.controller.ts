import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { AiService } from './ai.service';

/* ── POST /api/v1/ai/generate-flashcards ─────────────────── */
const generateFlashcards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const { documentId, count = 10 } = req.body as { documentId: string; count?: number };
    if (!documentId) throw new AppError(status.BAD_REQUEST, 'Document ID is required');

    const data = await AiService.generateFlashcards(userId, documentId, Number(count));
    res.status(status.CREATED).json({ success: true, message: 'Flashcards generated successfully', data });
  } catch (error) { next(error); }
};

/* ── POST /api/v1/ai/generate-quiz ──────────────────────── */
const generateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const { documentId, numQuestions = 5, title } = req.body as {
      documentId: string;
      numQuestions?: number;
      title?: string;
    };
    if (!documentId) throw new AppError(status.BAD_REQUEST, 'Document ID is required');

    const data = await AiService.generateQuiz(userId, documentId, Number(numQuestions), title);
    res.status(status.CREATED).json({ success: true, message: 'Quiz generated successfully', data });
  } catch (error) { next(error); }
};

/* ── POST /api/v1/ai/generate-summary ───────────────────── */
const generateSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const { documentId } = req.body as { documentId: string };
    if (!documentId) throw new AppError(status.BAD_REQUEST, 'Document ID is required');

    const data = await AiService.generateSummary(userId, documentId);
    res.status(status.OK).json({ success: true, message: 'Summary generated successfully', data });
  } catch (error) { next(error); }
};

/* ── POST /api/v1/ai/chat ───────────────────────────────── */
const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const { documentId, question } = req.body as { documentId: string; question: string };
    if (!documentId || !question)
      throw new AppError(status.BAD_REQUEST, 'documentId and question are required');

    const data = await AiService.chat(userId, documentId, question);
    res.status(status.OK).json({ success: true, message: 'Response generated successfully', data });
  } catch (error) { next(error); }
};

/* ── POST /api/v1/ai/explain-concept ───────────────────── */
const explainConcept = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const { documentId, concept } = req.body as { documentId: string; concept: string };
    if (!documentId || !concept)
      throw new AppError(status.BAD_REQUEST, 'Please provide documentId and concept');

    const data = await AiService.explainConcept(userId, documentId, concept);
    res.status(status.OK).json({ success: true, message: 'Explanation generated successfully', data });
  } catch (error) { next(error); }
};

/* ── GET /api/v1/ai/chat-history/:documentId ────────────── */
const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const { documentId } = req.params;
    if (!documentId) throw new AppError(status.BAD_REQUEST, 'documentId is required');

    const data = await AiService.getChatHistory(userId, documentId as string);
    res.status(status.OK).json({
      success: true,
      message: data.length ? 'Chat history retrieved successfully' : 'No chat history found',
      data,
    });
  } catch (error) { next(error); }
};

export const AiController = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};
