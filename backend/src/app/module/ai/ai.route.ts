import { Router } from 'express';
import { Role } from '../../../generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { usageLimiter } from '../../middleware/usageLimiter';
import { AiController } from './ai.controller';

const router = Router();

// All AI routes require authentication
router.use(checkAuth(Role.ADMIN, Role.USER));

/**
 * AI Routes — /api/v1/ai
 *
 * POST routes that call Gemini API are protected by usageLimiter
 * to prevent abuse (rate-limits daily AI calls per user).
 *
 * GET routes (chat history) do not consume AI credits.
 */

// POST /api/v1/ai/generate-flashcards
router.post('/generate-flashcards', usageLimiter, AiController.generateFlashcards);

// POST /api/v1/ai/generate-quiz
router.post('/generate-quiz', usageLimiter, AiController.generateQuiz);

// POST /api/v1/ai/generate-summary
router.post('/generate-summary', usageLimiter, AiController.generateSummary);

// POST /api/v1/ai/chat
router.post('/chat', usageLimiter, AiController.chat);

// POST /api/v1/ai/explain-concept
router.post('/explain-concept', usageLimiter, AiController.explainConcept);

// GET  /api/v1/ai/chat-history/:documentId  ← GET (not POST — reads history, no AI call)
router.get('/chat-history/:documentId', AiController.getChatHistory);

export const AiRoutes = router;
