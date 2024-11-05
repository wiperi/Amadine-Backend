import { QuizSessionState, Color, PlayerAction } from './Enums';
import { StateMachine } from './StateMachine';
import fs from 'fs';
import path from 'path';
import config from '@/_config';
import { getQuizSessionResultCSV } from '@/utils/helper';
import { quizSessionTimers } from '@/dataStore';
import { ST } from './ST';
const {
  LOBBY,
  QUESTION_COUNTDOWN,
  QUESTION_OPEN,
  QUESTION_CLOSE,
  ANSWER_SHOW,
  FINAL_RESULTS,
  END,
} = QuizSessionState;
const {
  NEXT_QUESTION,
  SKIP_COUNTDOWN,
  GO_TO_ANSWER,
  GO_TO_FINAL_RESULTS,
  END: GO_TO_END,
} = PlayerAction;

export class User {
  userId: number;

  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number = 1;
  numFailedPasswordsSinceLastLogin: number = 0;
  oldPasswords: string[] = [];

  constructor(
    userId: number,
    email: string,
    password: string,
    nameFirst: string,
    nameLast: string
  ) {
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.nameFirst = nameFirst;
    this.nameLast = nameLast;
  }
}

export class Quiz {
  authUserId: number;
  quizId: number;

  name: string;
  description: string;
  timeCreated: number = Math.floor(Date.now() / 1000);
  timeLastEdited: number = Math.floor(Date.now() / 1000);
  active: boolean = true;
  questions: Question[] = [];
  thumbnailUrl: string = '#';

  constructor(authUserId: number, quizId: number, name: string, description: string) {
    this.authUserId = authUserId;
    this.quizId = quizId;
    this.name = name;
    this.description = description;
  }

  duration(): number {
    return this.questions.reduce((acc, question) => acc + question.duration, 0);
  }
}

export class UserSession {
  sessionId: number;
  authUserId: number;

  token: string;
  deviceInfo?: string;

  constructor(sessionId: number, authUserId: number, token: string, deviceInfo?: string) {
    this.sessionId = sessionId;
    this.authUserId = authUserId;
    this.token = token;
    this.deviceInfo = deviceInfo;
  }
}

export class Question {
  // Position matters in quiz
  questionId: number;

  question: string;
  duration: number; // in seconds
  thumbnailUrl: string = '#';
  points: number;

  answers: Answer[] = [];

  private getRandomUniqueColor(): Color {
    const unusedColor: Color[] = Object.values(Color);
    for (const answer of this.answers) {
      unusedColor.splice(unusedColor.indexOf(answer.colour), 1);
    }

    if (unusedColor.length <= 0) {
      throw new Error(
        `Can not create more answers. Current number of answers: ${this.answers.length}`
      );
    }

    const randomIndex = Math.floor(Math.random() * unusedColor.length);
    return unusedColor[randomIndex];
  }

  /**
   * Return a copy of seleciton of answers
   *
   * @param start The beginning index of the specified portion of the array. If start is undefined, then the slice begins at index 0.
   * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'. If end is undefined, then the slice extends to the end of the array.
   * @returns
   */
  getAnswersSlice(start?: number, end?: number): Answer[] {
    return this.answers.slice(start, end);
  }

  setAnswers(answers: Answer[]): void {
    answers.forEach(answer => {
      answer.colour = this.getRandomUniqueColor();
    });
    this.answers = answers;
  }

  addAnswer(answer: Answer): void {
    answer.colour = this.getRandomUniqueColor();
    this.answers.push(answer);
  }

  deleteAnswer(answerId: number): void {
    this.answers = this.answers.filter(answer => answer.answerId !== answerId);
  }

  constructor(
    questionId: number,
    question: string,
    duration: number,
    points: number,
    answers: Answer[],
    thumbnailUrl: string = '#'
  ) {
    this.questionId = questionId;
    this.question = question;
    this.duration = duration;
    this.points = points;

    answers.forEach(answer => {
      answer.colour = this.getRandomUniqueColor();
    });
    this.answers = answers;
    this.thumbnailUrl = thumbnailUrl;
  }
}

export class Answer {
  answerId: number;

  answer: string;
  correct: boolean;

  colour: Color;

  constructor(answerId: number, answer: string, correct: boolean) {
    this.answerId = answerId;
    this.answer = answer;
    this.correct = correct;
  }
}

export class QuizSession {
  sessionId: number;
  quizId: number;
  autoStartNum: number;
  metadata: Quiz;
  timeCurrentQuestionStarted: number; // in unix timestamp seconds

  messages: Message[] = [];
  atQuestion: number = 0; // Question index starting from 1, 0 means not started
  timeCreated: number = Math.floor(Date.now() / 1000);

  private static transitions = ST.parse<QuizSessionState, PlayerAction>([
    { from: LOBBY, action: GO_TO_END, to: END },
    { from: LOBBY, action: NEXT_QUESTION, to: QUESTION_COUNTDOWN },
    { from: QUESTION_COUNTDOWN, action: SKIP_COUNTDOWN, to: QUESTION_OPEN },
    { from: QUESTION_COUNTDOWN, action: GO_TO_END, to: END },
    { from: QUESTION_OPEN, action: GO_TO_ANSWER, to: ANSWER_SHOW },
    { from: QUESTION_OPEN, action: GO_TO_END, to: END },
    { from: QUESTION_CLOSE, action: NEXT_QUESTION, to: QUESTION_COUNTDOWN },
    { from: QUESTION_CLOSE, action: GO_TO_ANSWER, to: ANSWER_SHOW },
    { from: QUESTION_CLOSE, action: GO_TO_FINAL_RESULTS, to: FINAL_RESULTS },
    { from: QUESTION_CLOSE, action: GO_TO_END, to: END },
    { from: FINAL_RESULTS, action: GO_TO_END, to: END },
    { from: ANSWER_SHOW, action: NEXT_QUESTION, to: QUESTION_COUNTDOWN },
    { from: ANSWER_SHOW, action: GO_TO_FINAL_RESULTS, to: FINAL_RESULTS },
    { from: ANSWER_SHOW, action: GO_TO_END, to: END },
  ]);

  private beforeStateChange = (action: PlayerAction) => {
    if (this.atQuestion === this.metadata.questions.length && action === NEXT_QUESTION) {
      throw new Error('Already the last question');
    }
  }

  private onStateChange = () => {
    console.log('this', this);


    if (quizSessionTimers.has(this.sessionId)) {
      clearTimeout(quizSessionTimers.get(this.sessionId));
    }

    if (this.state() === QUESTION_COUNTDOWN) {
      this.atQuestion++;
      const currentQuestion = this.atQuestion;
      quizSessionTimers.set(
        this.sessionId,
        setTimeout(() => {
          if (this.atQuestion === currentQuestion && this.state() === QUESTION_COUNTDOWN) {
            this.dispatch(SKIP_COUNTDOWN);
          }
        }, 3000)
      );
    }

    if (this.state() === QUESTION_OPEN) {
      // Get question duration
      const duration = this.metadata.questions[this.atQuestion - 1].duration;
      // Set time when question started
      this.timeCurrentQuestionStarted = Math.floor(Date.now() / 1000);
      // Store current question position
      const currentQuestion = this.atQuestion;

      quizSessionTimers.set(
        this.sessionId,
        setTimeout(() => {
          // If session is still on the same question and hasn't changed state
          if (this.atQuestion === currentQuestion && this.state() === QUESTION_OPEN) {
            this.stateMachine.jumpTo(QUESTION_CLOSE);
            this.onStateChange();
            this.timeCurrentQuestionStarted = undefined;
          }
        }, duration * 1000)
      );
    }

    if (this.state() === END) {
      this.atQuestion = 0;
      this.timeCurrentQuestionStarted = undefined;
    }

    if (this.state() === FINAL_RESULTS) {
      this.atQuestion = 0;
      // Save results to file
      const result = getQuizSessionResultCSV(this.quizId, this.sessionId);
      const filePath = path.join(
        config.resultsPath,
        `quiz${this.quizId}_session${this.sessionId}.csv`
      );
      // If results not exist , create file
      if (!fs.existsSync(config.resultsPath)) {
        fs.mkdirSync(config.resultsPath, { recursive: true });
      }
      fs.writeFileSync(filePath, result);
    }
  }

  private stateMachine = new ST<QuizSessionState, PlayerAction>({
    _state: LOBBY,
    rules: QuizSession.transitions,
    beforeStateChange: this.beforeStateChange,
    afterStateChange: this.onStateChange,
  });

  /**
   * Gets the current state of the quiz session.
   * @returns The current state of the quiz session.
   */
  state(): QuizSessionState {
    return this.stateMachine.getCurrentState();
  }

  /**
   * Dispatches an action to the state machine and handles automatic state transitions.
   * @param action - The action to dispatch.
   * @throws Error if the action is not valid.
   */
  dispatch(action: PlayerAction): void {
    this.stateMachine.dispatch(action);
  }



  constructor(sessionId: number, quiz: Quiz, autoStartNum: number) {
    this.sessionId = sessionId;
    this.quizId = quiz.quizId;

    this.metadata = JSON.parse(JSON.stringify(quiz));
    Object.setPrototypeOf(this.metadata, Quiz.prototype);

    this.autoStartNum = autoStartNum;
  }
}

export class Player {
  playerId: number; // Must be globally unique
  quizSessionId: number;

  name: string;

  totalScore: number = 0;
  submits: {
    questionId: number;
    answerIds: number[];
    timeSubmitted: number;
    timeSpent: number;
    isRight: boolean;
    score: number;
  }[] = [];

  constructor(playerId: number, quizSessionId: number, name: string) {
    this.playerId = playerId;
    this.quizSessionId = quizSessionId;
    this.name = name;
  }
}

export class Message {
  playerId: number;
  playerName: string;
  messageBody: string;
  timeSent: number = Math.floor(Date.now() / 1000);

  constructor(playerId: number, playerName: string, messageBody: string) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.messageBody = messageBody;
  }
}
