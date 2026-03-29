import { Router } from 'express';
import { Role } from '../../../generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { ProgressController } from './progress.controller';

const router = Router();
router.use(checkAuth(Role.ADMIN, Role.USER));

// GET  /api/v1/progress/dashboard           — overall dashboard stats
router.get('/dashboard', ProgressController.getDashboard);

// GET  /api/v1/progress/document/:documentId — per-document progress
router.get('/document/:documentId', ProgressController.getDocumentProgress);

// NOTE: Quiz completion: use POST /api/v1/quizzes/:id/submit (QuizController.submitQuiz)

export const ProgressRoutes = router;
