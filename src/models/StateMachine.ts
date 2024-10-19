
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
  CALLBACK extends (...args: unknown[]) => unknown
  = (...args: unknown[]) => unknown
> {

  protected currentState: STATE;
  protected static transitions = new Map();
  protected static callBackMap = new Map();

  constructor(initial: STATE, transtions: Transition<STATE, ACTION, CALLBACK>[]) {
    this.currentState = initial;

    transtions.forEach(t => {
      this.addTransition(t);
      this.addCallBack(t);
    })
  }

  getCurrentState() {
    return this.currentState;
  }

  addTransition(t: Transition<STATE, ACTION, CALLBACK>) {
    const { from, action, to } = t;

    // If vertex not exist, create one
    if (!StateMachine.transitions.has(from)) {
      StateMachine.transitions.set(from, new Map<ACTION, STATE>());
    }

    // If edge already exist, error
    if (StateMachine.transitions.get(from).has(action)) {
      throw new Error(`State ${String(from)} has already an transition ${String(action)}, to ${String(to)}`)
    }

    StateMachine.transitions.get(from)!.set(action, to);
  }

  addCallBack(t: Transition<STATE, ACTION, CALLBACK>) {
    const { from, action, to, callbacks } = t;
    const key = `${String(from)}>${String(action)}>${String(to)}`;

    if (!StateMachine.callBackMap.has(key)) {
      StateMachine.callBackMap.set(key, []);
    }

    callbacks && StateMachine.callBackMap.get(key).push(...callbacks);
  }

  dispatch(action: ACTION) {
    const currentVertex = StateMachine.transitions.get(this.currentState);
    if (!currentVertex) {
      // There is no out edge of current state
      throw new Error(`State ${String(this.currentState)} is final`)
    }

    if (!currentVertex.has(action)) {
      // action can not apply to current state
      throw new Error(`Action ${String(action)} can not apply to current state ${String(this.currentState)}`)
    }

    const next = currentVertex.get(action);
    this.triggerCallBack(this.currentState, action, next);

    this.currentState = next;
  }

  tryDispatchFrom(from: STATE, action: ACTION) {
    const currentVertex = StateMachine.transitions.get(from);
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


  protected triggerCallBack(from: STATE, action: ACTION, to: STATE) {
    const key = `${String(from)}>${String(action)}>${String(to)}`;

    StateMachine.callBackMap.get(key)?.forEach((f: CALLBACK) => {
      f(from, action, to);
    })
  }
}

type QuizSessionSmCallBack = (session: QuizSession, from: QuizSessionState, action: PlayerAction, to: QuizSessionState) => unknown;
export class QuizSessionSM extends StateMachine<QuizSessionState, PlayerAction, QuizSessionSmCallBack> {

  private session: QuizSession;


  // const { LOBBY, QUESTION_COUNTDOWN, QUESTION_OPEN, QUESTION_CLOSE, ANSWER_SHOW, FINAL_RESULTS, END } = QuizSessionState;
  // const { NEXT_QUESTION, SKIP_COUNTDOWN, GO_TO_ANSWER, GO_TO_FINAL_RESULTS, END: GO_TO_END } = PlayerAction;

  // const transitions = [
  //   toTransition(LOBBY, GO_TO_END, END, []),
  //   toTransition(LOBBY, NEXT_QUESTION, QUESTION_COUNTDOWN, []),
  //   toTransition(QUESTION_COUNTDOWN, SKIP_COUNTDOWN, QUESTION_OPEN, []),
  //   toTransition(QUESTION_COUNTDOWN, GO_TO_END, END, []),
  //   toTransition(QUESTION_OPEN, GO_TO_ANSWER, ANSWER_SHOW, []),
  //   toTransition(QUESTION_OPEN, GO_TO_END, END, []),
  //   toTransition(QUESTION_CLOSE, NEXT_QUESTION, QUESTION_COUNTDOWN, []),
  //   toTransition(QUESTION_CLOSE, GO_TO_ANSWER, ANSWER_SHOW, []),
  //   toTransition(QUESTION_CLOSE, GO_TO_FINAL_RESULTS, FINAL_RESULTS, []),
  //   toTransition(QUESTION_CLOSE, GO_TO_END, END, []),
  //   toTransition(FINAL_RESULTS, GO_TO_END, END, []),
  //   toTransition(ANSWER_SHOW, NEXT_QUESTION, QUESTION_COUNTDOWN, []),
  //   toTransition(ANSWER_SHOW, GO_TO_FINAL_RESULTS, FINAL_RESULTS, []),
  //   toTransition(ANSWER_SHOW, GO_TO_END, END, []),
  // ];

  private static edges: any[];

  static {
    const { LOBBY, QUESTION_COUNTDOWN, QUESTION_OPEN, QUESTION_CLOSE, ANSWER_SHOW, FINAL_RESULTS, END } = QuizSessionState;
    const { NEXT_QUESTION, SKIP_COUNTDOWN, GO_TO_ANSWER, GO_TO_FINAL_RESULTS, END: GO_TO_END } = PlayerAction;

    QuizSessionSM.edges = [
      toTransition(LOBBY, GO_TO_END, END, []),
      toTransition(LOBBY, NEXT_QUESTION, QUESTION_COUNTDOWN, []),
      toTransition(QUESTION_COUNTDOWN, SKIP_COUNTDOWN, QUESTION_OPEN, []),
      toTransition(QUESTION_COUNTDOWN, GO_TO_END, END, []),
      toTransition(QUESTION_OPEN, GO_TO_ANSWER, ANSWER_SHOW, []),
      toTransition(QUESTION_OPEN, GO_TO_END, END, []),
      toTransition(QUESTION_CLOSE, NEXT_QUESTION, QUESTION_COUNTDOWN, []),
      toTransition(QUESTION_CLOSE, GO_TO_ANSWER, ANSWER_SHOW, []),
      toTransition(QUESTION_CLOSE, GO_TO_FINAL_RESULTS, FINAL_RESULTS, []),
      toTransition(QUESTION_CLOSE, GO_TO_END, END, []),
      toTransition(FINAL_RESULTS, GO_TO_END, END, []),
      toTransition(ANSWER_SHOW, NEXT_QUESTION, QUESTION_COUNTDOWN, []),
      toTransition(ANSWER_SHOW, GO_TO_FINAL_RESULTS, FINAL_RESULTS, []),
      toTransition(ANSWER_SHOW, GO_TO_END, END, []),
    ];
  }

  constructor(session: QuizSession) {
    super(QuizSessionState.LOBBY, QuizSessionSM.edges);
    this.session = session;
  }

  override triggerCallBack(from: QuizSessionState, action: PlayerAction, to: QuizSessionState) {
    const key = `${String(from)}>${String(action)}>${String(to)}`;

    StateMachine.callBackMap.get(key)?.forEach((f: QuizSessionSmCallBack) => {
      f(this.session, from, action, to);
    })
  }

}
