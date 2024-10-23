export type EmptyObject = Record<never, never>;

export type ReturnedQuizView = {
  quizId: number;
  name: string;
};

export type ParamQuestionBody = {
  question: string;
  duration: number;
  points: number;
  answers: Array<{ answer: string; correct: boolean }>;
};
