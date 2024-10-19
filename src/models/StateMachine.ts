
import { QuizSessionState, PlayerAction } from './Enums';
import { QuizSession } from './Classes';

type Transition<STATE, ACTION, CALLBACK> = {
  from: STATE;
  action: ACTION;
  to: STATE;
  callbacks: CALLBACK[];
};

function toTransition<
  STATE,
  ACTION,
  CALLBACK extends (from: STATE, action: ACTION, to: STATE) => unknown
  = (from: STATE, action: ACTION, to: STATE) => unknown
>(from: STATE, action: ACTION, to: STATE, callbacks?: CALLBACK[]):
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
    const { from, action, to } = t;

    // If vertex not exist, create one
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Map<ACTION, STATE>());
    }

    // If edge already exist, error
    if (this.transitions.get(from).has(action)) {
      throw new Error(`State ${String(from)} has already an transition ${String(action)}, to ${String(to)}`)
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
      // There is no out edge of current state
      throw new Error(`State ${String(this.current)} is final`)
    }

    if (!currentVertex.has(action)) {
      // action can not apply to current state
      throw new Error(`Action ${String(action)} can not apply to current state ${String(this.current)}`)
    }

    const next = currentVertex.get(action);
    this.triggerCallBack(this.current, action, next);

    this.current = next;
  }

  tryDispatchFrom(from: STATE, action: ACTION) {
    const currentVertex = this.transitions.get(from);
    if (!currentVertex) {
      // There is no out edge of current state
      throw new Error(`State ${String(from)} is final`)
    }

    if (!currentVertex.has(action)) {
      // action can not apply to current state
      throw new Error(`Action ${String(action)} can not apply to current state ${String(from)}`)
    }

    const next = currentVertex.get(action);
    this.triggerCallBack(from, action, next);
  }


  private triggerCallBack(from: STATE, action: ACTION, to: STATE) {
    const key = `${String(from)}>${String(action)}>${String(to)}`;

    this.callBackMap.get(key)?.forEach(f => {
      f(from, action, to);
    })
  }
}

export class QuizSessionSM {
  private static instance: QuizSessionSM | null = null;
  private session: QuizSession;
  private stateMachine: StateMachine<QuizSessionState, PlayerAction>;

  private constructor() {
    const { LOBBY, QUESTION_COUNTDOWN, QUESTION_OPEN, QUESTION_CLOSE, ANSWER_SHOW, FINAL_RESULTS, END } = QuizSessionState;
    const { NEXT_QUESTION, SKIP_COUNTDOWN, GO_TO_ANSWER, GO_TO_FINAL_RESULTS, END: GO_TO_END } = PlayerAction;

    const transitions = [
      toTransition(LOBBY, GO_TO_END, END, [() => {
        this.session.state = END;
      }]),
      toTransition(LOBBY, NEXT_QUESTION, QUESTION_COUNTDOWN, [() => {
        this.session.state = QUESTION_COUNTDOWN;
      }]),
      toTransition(QUESTION_COUNTDOWN, SKIP_COUNTDOWN, QUESTION_OPEN, [() => {
        this.session.state = QUESTION_OPEN;
      }]),
      toTransition(QUESTION_COUNTDOWN, GO_TO_END, END, [() => {
        this.session.state = END;
      }]),
      toTransition(QUESTION_OPEN, GO_TO_ANSWER, ANSWER_SHOW, [() => {
        this.session.state = ANSWER_SHOW;
      }]),
      toTransition(QUESTION_OPEN, GO_TO_END, END, [() => {
        this.session.state = END;
      }]),
      toTransition(QUESTION_CLOSE, NEXT_QUESTION, QUESTION_COUNTDOWN, [() => {
        this.session.state = QUESTION_COUNTDOWN;
      }]),
      toTransition(QUESTION_CLOSE, GO_TO_ANSWER, ANSWER_SHOW, [() => {
        this.session.state = ANSWER_SHOW;
      }]),
      toTransition(QUESTION_CLOSE, GO_TO_FINAL_RESULTS, FINAL_RESULTS, [() => {
        this.session.state = FINAL_RESULTS;
      }]),
      toTransition(QUESTION_CLOSE, GO_TO_END, END, [() => {
        this.session.state = END;
      }]),
      toTransition(FINAL_RESULTS, GO_TO_END, END, [() => {
        this.session.state = END;
      }]),
      toTransition(ANSWER_SHOW, NEXT_QUESTION, QUESTION_COUNTDOWN, [() => {
        this.session.state = QUESTION_COUNTDOWN;
      }]),
      toTransition(ANSWER_SHOW, GO_TO_FINAL_RESULTS, FINAL_RESULTS, [() => {
        this.session.state = FINAL_RESULTS;
      }]),
      toTransition(ANSWER_SHOW, GO_TO_END, END, [() => {
        this.session.state = END;
      }]),
    ];

    this.stateMachine = new StateMachine<QuizSessionState, PlayerAction>(QuizSessionState.LOBBY, transitions);
  }

  public static getInstance(): QuizSessionSM {
    if (!QuizSessionSM.instance) {
      QuizSessionSM.instance = new QuizSessionSM();
    }
    return QuizSessionSM.instance;
  }

  transition(session: QuizSession, action: PlayerAction): void {
    this.session = session;
    try {
      this.stateMachine.tryDispatchFrom(session.state, action);
    } catch (error) {
      throw error;
    }
  }
}
