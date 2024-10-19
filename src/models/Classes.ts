import { QuizSessionState, Color, PlayerAction } from './Enums';

export class User {
  userId: number;

  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number = 1;
  numFailedPasswordsSinceLastLogin: number = 0;
  oldPasswords: string[] = [];

  constructor(userId: number, email: string, password: string, nameFirst: string, nameLast: string) {
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
  thumbnailUrl: string = '';

  constructor(authUserId: number, quizId: number, name: string, description: string) {
    this.authUserId = authUserId;
    this.quizId = quizId;
    this.name = name;
    this.description = description;
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
  duration: number;
  points: number;

  private answers: Answer[] = [];

  private getRandomUniqueColor(): Color {
    const unusedColor: Color[] = Object.values(Color);
    for (const answer of this.answers) {
      unusedColor.splice(unusedColor.indexOf(answer.colour), 1);
    }

    if (unusedColor.length <= 0) {
      throw new Error(`Can not create more answers. Current number of answers: ${this.answers.length}`);
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

  constructor(questionId: number, question: string, duration: number, points: number, answers: Answer[]) {
    this.questionId = questionId;
    this.question = question;
    this.duration = duration;
    this.points = points;

    answers.forEach(answer => {
      answer.colour = this.getRandomUniqueColor();
    });
    this.answers = answers;
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

  messages: Message[] = [];
  state: QuizSessionState = QuizSessionState.LOBBY;
  atQuestion: number = 1; // Question index starting from 1
  timeCreated: number = Math.floor(Date.now() / 1000);

  private fsm: QuizSessionSM = QuizSessionSM.getInstance();

  updateState(action: PlayerAction) {
    this.fsm.transition(this, action);
  }

  constructor(sessionId: number, quizId: number) {
    this.sessionId = sessionId;
    this.quizId = quizId;
  }
}

export class Player {
  playerId: number; // Must be globally unique
  quizSessionId: number;

  name: string;

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

type Transition<STATE, ACTION, CALLBACK> = {
  from: STATE;
  action: ACTION;
  to: STATE;
  callbacks: CALLBACK[];
};

function toTransition<STATE, ACTION, CALLBACK>(from: STATE, action: ACTION, to: STATE, callbacks: CALLBACK[] = []):
  Transition<STATE, ACTION, CALLBACK> {
  return {
    from,
    action,
    to,
    callbacks
  }
}

class StateMachine<
  STATE extends string | number | symbol,
  ACTION extends string | number | symbol,
  CALLBACK extends (from: STATE, action: ACTION, to: STATE) => unknown
  = (from: STATE, action: ACTION, to: STATE) => unknown
> {

  protected current: STATE;
  protected transitions: Map<STATE, Map<ACTION, STATE>> = new Map();
  protected callBackMap: Map<string, CALLBACK[]> = new Map();

  constructor(initial: STATE, transtions: Transition<STATE, ACTION, CALLBACK>[]) {
    this.current = initial;

    transtions.forEach(t => {
      this.addTransition(t);
      this.addCallBack(t);
    })
  }

  addTransition(t: Transition<STATE, ACTION, CALLBACK>) {
    // If it is a new transition, add to map
    const { from, action, to } = t;

    // if there is from node, create one
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Map<ACTION, STATE>());
    }

    // if already has a edge, error, no duplicated edge
    if (this.transitions.get(from).has(action)) {
      throw new Error('no duplicated edge')
    }

    this.transitions.get(from)!.set(action, to);
  }

  addCallBack(t: Transition<STATE, ACTION, CALLBACK>) {
    const { from, action, to, callbacks } = t;
    const key = `${String(from)}>${String(action)}>${String(to)}`;

    if (!this.callBackMap.has(key)) {
      this.callBackMap.set(key, []);
    }

    callbacks && this.callBackMap.get(key).push(...callbacks);
  }

  dispatch(action: ACTION) {
    const currentVertex = this.transitions.get(this.current);
    if (!currentVertex) {
      // there is no out edge of current state
      throw new Error('current state is final')
    }
    
    if (!currentVertex.has(action)) {
      // action can not apply to current state
      throw new Error('action can not apply to current state')
    }

    const next = currentVertex.get(action);
    this.triggerCallBack(this.current, action, next);

    this.current = next;
  }

  tryDispatchFrom(from: STATE, action: ACTION) {
    const currentVertex = this.transitions.get(from);
    if (!currentVertex) {
      // there is no out edge of current state
      throw new Error('current state is final')
    }
    
    if (!currentVertex.has(action)) {
      // action can not apply to current state
      throw new Error('action can not apply to current state')
    }

    const next = currentVertex.get(action);
    this.triggerCallBack(this.current, action, next);
  }


  private triggerCallBack(from: STATE, action: ACTION, to: STATE) {
    const key = `${String(from)}>${String(action)}>${String(to)}`;

    this.callBackMap.get(key)?.forEach(f => {
      f(from, action, to);
    })
  }
}

class QuizSessionSM {
  private static instance: QuizSessionSM | null = null;
  private session: QuizSession;
  private stateMachine: StateMachine<QuizSessionState, PlayerAction>;

  private constructor() {
    const { LOBBY, QUESTION_CLOSE, QUESTION_COUNTDOWN, QUESTION_OPEN } = QuizSessionState;
    const { NEXT_QUESTION, SKIP_COUNTDOWN } = PlayerAction;
    const rule = [
      toTransition(LOBBY, NEXT_QUESTION, QUESTION_CLOSE, [() => {
        this.session.atQuestion++;
        this.session.state = QUESTION_CLOSE;
      }]),
    ];

    this.stateMachine = new StateMachine<QuizSessionState, PlayerAction>(QuizSessionState.LOBBY, rule);
    // Initialize transitions and callbacks here
  }

  public static getInstance(): QuizSessionSM {
    if (!QuizSessionSM.instance) {
      QuizSessionSM.instance = new QuizSessionSM();
    }
    return QuizSessionSM.instance;
  }

  transition(session: QuizSession, action: PlayerAction): void {
    this.session = session;
    this.stateMachine.tryDispatchFrom(session.state, action);
  }
}


// test state machine
const session = new QuizSession(1, 1);
const sm = QuizSessionSM.getInstance();
session.updateState(PlayerAction.NEXT_QUESTION);
session.updateState(PlayerAction.NEXT_QUESTION);
console.log(session);