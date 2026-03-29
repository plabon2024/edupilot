import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { ProgressService } from './progress.service';

/* ── GET /api/v1/progress/dashboard ─────────────────────────── */
const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const data = await ProgressService.getDashboard(userId);
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

/* ── GET /api/v1/progress/document/:documentId ──────────────── */
const getDocumentProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const data = await ProgressService.getDocumentProgress(
      userId,
      req.params.documentId as string,
    );
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

// NOTE: Quiz completion → use POST /api/v1/quizzes/:id/submit (QuizController.submitQuiz)
// That endpoint validates answers, calculates score, and atomically marks the quiz complete.

export const ProgressController = { getDashboard, getDocumentProgress };
