import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import status from 'http-status';

/* ── List all flashcard sets for a user ─────────────────────── */
const getAllFlashcardSets = async (userId: string) => {
  return prisma.flashcard.findMany({
    where: { userId },
    include: {
      document: { select: { title: true } },
      cards: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/* ── List flashcard sets for a specific document ─────────────── */
const getFlashcardsByDocument = async (userId: string, documentId: string) => {
  return prisma.flashcard.findMany({
    where: { userId, documentId },
    include: {
      document: { select: { title: true, fileName: true } },
      cards: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/* ── Mark a card as reviewed ─────────────────────────────────── */
const reviewCard = async (userId: string, cardId: string) => {
  const card = await prisma.flashcardCard.findUnique({
    where: { id: cardId },
    include: { flashcard: { select: { userId: true } } },
  });

  if (!card || card.flashcard.userId !== userId) {
    throw new AppError(status.NOT_FOUND, 'Flashcard card not found');
  }

  return prisma.flashcardCard.update({
    where: { id: cardId },
    data: {
      lastReviewed: new Date(),
      reviewCount: { increment: 1 },
    },
  });
};

/* ── Toggle star on a card ───────────────────────────────────── */
const toggleStar = async (userId: string, cardId: string) => {
  const card = await prisma.flashcardCard.findUnique({
    where: { id: cardId },
    include: { flashcard: { select: { userId: true } } },
  });

  if (!card || card.flashcard.userId !== userId) {
    throw new AppError(status.NOT_FOUND, 'Flashcard card not found');
  }

  return prisma.flashcardCard.update({
    where: { id: cardId },
    data: { isStarred: !card.isStarred },
  });
};

/* ── Delete a flashcard set ──────────────────────────────────── */
const deleteFlashcardSet = async (userId: string, setId: string) => {
  const set = await prisma.flashcard.findFirst({
    where: { id: setId, userId },
  });

  if (!set) {
    throw new AppError(status.NOT_FOUND, 'Flashcard set not found');
  }

  await prisma.flashcard.delete({ where: { id: set.id } });
};

export const FlashcardService = {
  getAllFlashcardSets,
  getFlashcardsByDocument,
  reviewCard,
  toggleStar,
  deleteFlashcardSet,
};
