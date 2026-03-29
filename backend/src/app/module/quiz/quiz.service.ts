import status from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SubmitAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

// ─── Get all quizzes for a document ──────────────────────────────────────────
const getQuizzesByDocument = async (userId: string, documentId: string) => {
  return prisma.quiz.findMany({
    where: { userId, documentId },
    include: {
      document: { select: { title: true, fileName: true } },
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
          difficulty: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// ─── Get single quiz by id ────────────────────────────────────────────────────
const getQuizById = async (quizId: string, userId: string) => {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    include: {
      document: { select: { title: true, fileName: true } },
      questions: true,
    },
  });
  if (!quiz) throw new AppError(status.NOT_FOUND, 'Quiz not found');
  return quiz;
};

// ─── Submit answers ───────────────────────────────────────────────────────────
const submitQuiz = async (quizId: string, userId: string, answers: SubmitAnswer[]) => {
  if (!Array.isArray(answers) || answers.length === 0)
    throw new AppError(status.BAD_REQUEST, 'Answers must be a non-empty array');

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    include: { questions: { orderBy: { createdAt: 'asc' } } },
  });
  if (!quiz) throw new AppError(status.NOT_FOUND, 'Quiz not found');
  if (quiz.completedAt) throw new AppError(status.BAD_REQUEST, 'Quiz already completed');

  if (answers.length !== quiz.totalQuestions)
    throw new AppError(
      status.BAD_REQUEST,
      `Expected ${quiz.totalQuestions} answers, got ${answers.length}`,
    );

  const answeredIndices = new Set<number>();
  let correctCount = 0;
  const answerRecords: {
    quizId: string;
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[] = [];

  for (const entry of answers) {
    const { questionIndex, selectedAnswer } = entry;

    if (
      typeof questionIndex !== 'number' ||
      questionIndex < 0 ||
      questionIndex >= quiz.totalQuestions
    )
      throw new AppError(status.BAD_REQUEST, `Invalid question index: ${questionIndex}`);

    if (answeredIndices.has(questionIndex))
      throw new AppError(status.BAD_REQUEST, `Duplicate answer for index ${questionIndex}`);

    answeredIndices.add(questionIndex);

    const question = quiz.questions[questionIndex];
    if (!question)
      throw new AppError(status.BAD_REQUEST, `No question at index ${questionIndex}`);

    const isCorrect = selectedAnswer.trim() === question.correctAnswer.trim();
    if (isCorrect) correctCount++;

    answerRecords.push({ quizId: quiz.id, questionId: question.id, selectedAnswer, isCorrect });
  }

  const score = Math.round((correctCount / quiz.totalQuestions) * 100);

  // Use a transaction: clear old answers → insert new → update quiz
  await prisma.$transaction([
    prisma.quizUserAnswer.deleteMany({ where: { quizId: quiz.id } }),
    prisma.quizUserAnswer.createMany({ data: answerRecords }),
    prisma.quiz.update({
      where: { id: quiz.id },
      data: { score, completedAt: new Date() },
    }),
  ]);

  return { quizId: quiz.id, score, correctCount, totalQuestions: quiz.totalQuestions };
};

// ─── Get quiz results (detailed) ──────────────────────────────────────────────
const getQuizResults = async (quizId: string, userId: string) => {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    include: {
      document: { select: { title: true } },
      questions: { orderBy: { createdAt: 'asc' } },
      userAnswers: true,
    },
  });
  if (!quiz) throw new AppError(status.NOT_FOUND, 'Quiz not found');
  if (!quiz.completedAt) throw new AppError(status.BAD_REQUEST, 'Quiz has not been completed yet');

  type QuizQuestion = (typeof quiz.questions)[number];
  type QuizUserAnswer = (typeof quiz.userAnswers)[number];
  const detailedResults = quiz.questions.map((question: QuizQuestion, index: number) => {
    const userAnswer = quiz.userAnswers.find((a: QuizUserAnswer) => a.questionId === question.id);
    return {
      questionIndex: index,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      selectedAnswer: userAnswer?.selectedAnswer ?? null,
      isCorrect: userAnswer?.isCorrect ?? false,
      explanation: question.explanation,
    };
  });

  return {
    quiz: {
      id: quiz.id,
      title: quiz.title,
      document: quiz.document,
      score: quiz.score,
      totalQuestions: quiz.totalQuestions,
      completedAt: quiz.completedAt,
    },
    results: detailedResults,
  };
};

// ─── Delete quiz ──────────────────────────────────────────────────────────────
const deleteQuiz = async (quizId: string, userId: string) => {
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, userId } });
  if (!quiz) throw new AppError(status.NOT_FOUND, 'Quiz not found');

  await prisma.quiz.delete({ where: { id: quiz.id } });
  return { message: 'Quiz deleted successfully' };
};

export const QuizService = {
  getQuizzesByDocument,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};
