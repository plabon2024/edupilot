import { Router } from 'express';
import { Role } from '../../../generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { QuizController } from './quiz.controller';

const router = Router();
router.use(checkAuth(Role.ADMIN, Role.USER));

/**
 * ⚠️ ROUTE ORDER MATTERS — specific static segments MUST come before dynamic /:param
 *
 * Base: /api/v1/quizzes
 *
 * ✅ Correct order example:
 *   GET  /document/:documentId  →  list quizzes for a document
 *   GET  /:id                   →  get single quiz by id
 *   POST /:id/submit            →  submit answers
 *   GET  /:id/results           →  get results
 *   DEL  /:id                   →  delete quiz
 *
 * ❌ Problem in old route: `/:documentId` was declared BEFORE `/quiz/:id`
 *    so Express matched "quiz" as the documentId param, skipping /quiz/:id entirely.
 *
 * Fix: use a dedicated prefix `/document/:documentId` for the list route
 *      so there is NO conflict with /:id routes.
 */

// GET  /api/v1/quizzes/document/:documentId  — list quizzes for a document
router.get('/document/:documentId', QuizController.getQuizzes);

// GET  /api/v1/quizzes/:id/results           — MUST come before /:id (more specific)
router.get('/:id/results', QuizController.getQuizResults);

// POST /api/v1/quizzes/:id/submit
router.post('/:id/submit', QuizController.submitQuiz);

// GET  /api/v1/quizzes/:id                   — single quiz
router.get('/:id', QuizController.getQuizById);

// DELETE /api/v1/quizzes/:id                  — delete quiz
router.delete('/:id', QuizController.deleteQuiz);

export const QuizRoutes = router;
