import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { FlashcardService } from './flashcard.service';

const assertUser = (req: Request): string => {
  const userId = (req.user as { userId?: string })?.userId;
  if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');
  return userId;
};

/* ── GET /api/v1/flashcards ─────────────────────────────────── */
const getAllFlashcardSets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = assertUser(req);
    const sets = await FlashcardService.getAllFlashcardSets(userId);
    res.status(status.OK).json({ success: true, count: sets.length, data: sets });
  } catch (error) { next(error); }
};

/* ── GET /api/v1/flashcards/document/:documentId ─────────────── */
const getFlashcards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = assertUser(req);
    const documentId = String(req.params.documentId);
    const sets = await FlashcardService.getFlashcardsByDocument(userId, documentId);
    res.status(status.OK).json({ success: true, count: sets.length, data: sets });
  } catch (error) { next(error); }
};

/* ── POST /api/v1/flashcards/cards/:cardId/review ───────────── */
const reviewFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = assertUser(req);
    const cardId = String(req.params.cardId);
    const updated = await FlashcardService.reviewCard(userId, cardId);
    res.status(status.OK).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

/* ── PUT /api/v1/flashcards/cards/:cardId/star ──────────────── */
const toggleStarFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = assertUser(req);
    const cardId = String(req.params.cardId);
    const updated = await FlashcardService.toggleStar(userId, cardId);
    res.status(status.OK).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

/* ── DELETE /api/v1/flashcards/:id ──────────────────────────── */
const deleteFlashcardSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = assertUser(req);
    const setId = String(req.params.id);
    await FlashcardService.deleteFlashcardSet(userId, setId);
    res.status(status.OK).json({ success: true, message: 'Flashcard set deleted successfully' });
  } catch (error) { next(error); }
};

export const FlashcardController = {
  getAllFlashcardSets,
  getFlashcards,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
};
