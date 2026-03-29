import { Router } from 'express';
import { Role } from '../../../generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { FlashcardController } from './flashcard.controller';

const router = Router();
router.use(checkAuth(Role.ADMIN, Role.USER));

// GET    /api/v1/flashcards                         — list all flashcard sets for user
router.get('/', FlashcardController.getAllFlashcardSets);

// GET    /api/v1/flashcards/document/:documentId    — list sets for a document
router.get('/document/:documentId', FlashcardController.getFlashcards);

// POST   /api/v1/flashcards/cards/:cardId/review    — mark card as reviewed
router.post('/cards/:cardId/review', FlashcardController.reviewFlashcard);

// PUT    /api/v1/flashcards/cards/:cardId/star      — toggle star on a card
router.put('/cards/:cardId/star', FlashcardController.toggleStarFlashcard);

// DELETE /api/v1/flashcards/:id                     — delete flashcard set
router.delete('/:id', FlashcardController.deleteFlashcardSet);

export const FlashcardRoutes = router;
