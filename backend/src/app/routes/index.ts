import { Router } from 'express';
import { AuthRoutes } from '../module/auth/auth.route';
import { DocumentRoutes } from '../module/document/document.route';
import { QuizRoutes } from '../module/quiz/quiz.route';
import { FlashcardRoutes } from '../module/flashcard/flashcard.route';
import { ProgressRoutes } from '../module/progress/progress.route';
import { PaymentRoutes } from '../module/payment/payment.route';
import { AiRoutes } from '../module/ai/ai.route';
import { AdminRoutes } from '../module/admin/admin.route';

type TModuleRoutes = {
  path: string;
  route: Router;
};

const router = Router();

const moduleRoutes: TModuleRoutes[] = [
  { path: '/auth',      route: AuthRoutes },
  { path: '/documents', route: DocumentRoutes },
  { path: '/quizzes',   route: QuizRoutes },
  { path: '/flashcards',route: FlashcardRoutes },
  { path: '/progress',  route: ProgressRoutes },
  { path: '/payments',  route: PaymentRoutes },
  { path: '/ai',        route: AiRoutes },
  { path: '/admin',     route: AdminRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;