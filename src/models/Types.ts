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

export type ParamQuestionBodyV2 = ParamQuestionBody & { thumbnailUrl: string };

export type RemoveFunctions<T> = Omit<
  T,
  keyof { [K in keyof T as T[K] extends (...args: any[]) => unknown ? K : never]: never }
>;

export type AnswerReturned = {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
};

export type QuestionReturned = {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: AnswerReturned[];
};

export type QuizReturned = {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: QuestionReturned[];
  duration: number;
};

export type QuestionReturnedV2 = QuestionReturned & { thumbnailUrl: string };

export type QuizReturnedV2 = QuizReturned & {
  questions: QuestionReturnedV2[];
  thumbnailUrl: string;
};

export type MessagesReturned = {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
};

export type RankedPlayer = {
  name: string;
  score: number;
}

export type QuestionResult = {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}
export type GetSessionResultReturned = {
  usersRankedByScore: RankedPlayer[];
  questionResults: QuestionResult[];
}
