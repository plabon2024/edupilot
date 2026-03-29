import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { QuizService } from './quiz.service';

/* ── GET /api/v1/quizzes/document/:documentId ─── list quizzes for document */
const getQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const data = await QuizService.getQuizzesByDocument(userId, req.params.documentId as string);
    res.status(status.OK).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/* ── GET /api/v1/quizzes/:id ─────────────────── get single quiz */
const getQuizById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const data = await QuizService.getQuizById(req.params.id as string, userId);
    res.status(status.OK).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/* ── POST /api/v1/quizzes/:id/submit ─────────── submit answers */
const submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const { answers } = req.body;
    const data = await QuizService.submitQuiz(req.params.id as string, userId, answers);

    res.status(status.OK).json({
      success: true,
      message: 'Quiz submitted successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* ── GET /api/v1/quizzes/:id/results ─────────── quiz results */
const getQuizResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const data = await QuizService.getQuizResults(req.params.id as string, userId);
    res.status(status.OK).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/* ── DELETE /api/v1/quizzes/:id ──────────────── delete quiz */
const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const result = await QuizService.deleteQuiz(req.params.id as string, userId);
    res.status(status.OK).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const QuizController = {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};
