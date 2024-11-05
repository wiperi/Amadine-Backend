import { QuizSessionState, PlayerAction } from './Enums';
const { LOBBY, END, QUESTION_COUNTDOWN, QUESTION_OPEN, QUESTION_CLOSE, FINAL_RESULTS, ANSWER_SHOW } = QuizSessionState;
const { END: GO_TO_END, NEXT_QUESTION, SKIP_COUNTDOWN, GO_TO_ANSWER, GO_TO_FINAL_RESULTS } = PlayerAction;


type Token = string | number | symbol;

type Transition<S extends Token, A extends Token> = {
  from: S;
  action: A;
  to: S;
  callBack?: () => void | undefined;
};

export type STProps<S extends Token, A extends Token> = {
  _state: S;
  rules: Map<S, Map<A, { to: S; callBack: () => void | undefined }>>;
  beforeStateChange?: (action: A) => void;
  afterStateChange?: (action: A) => void;
};

export class ST<S extends Token, A extends Token> {
  private state: S;
  private rules: Map<S, Map<A, { to: S; callBack: () => void | undefined }>>;
  private beforeStateChange?: (action: A) => void;
  private afterStateChange?: (action: A) => void;

  constructor(private props: STProps<S, A>) {
    const { _state: state, rules, beforeStateChange, afterStateChange } = props;
    this.state = state;
    this.rules = rules;
    this.beforeStateChange = beforeStateChange;
    this.afterStateChange = afterStateChange;
  }

  getCurrentState() {
    return this.state;
  }

  dispatch(action: A) {
    this.beforeStateChange?.(action);

    const vertex = this.rules.get(this.state);
    // no out edge of current state
    if (!vertex) {
      throw new Error(`State ${String(this.state)} is final`);
    }
    // action not exist in current state
    if (!vertex.has(action)) {
      throw new Error(
        `Action ${String(action)} can not apply to current state ${String(this.state)}`
      );
    }

    const { to, callBack } = vertex.get(action);

    this.state = to;
    callBack && callBack();

    this.afterStateChange?.(action);
  }

  jumpTo(state: S) {
    this.state = state;

    this.afterStateChange?.(null);
  }

  static parse<S extends Token, A extends Token>(transitions: Transition<S, A>[]) {
    const parsed = new Map<S, Map<A, { to: S; callBack: () => void | undefined }>>();

    transitions.forEach(t => {
      const { from, action, to, callBack } = t;

      // if vertex not exist, create one
      if (!parsed.has(from)) {
        parsed.set(from, new Map());
      }

      // if edge already exist, error
      if (parsed.get(from).has(action)) {
        throw new Error(
          `State ${String(from)} has already an transition ${String(action)}, to ${String(to)}`
        );
      }

      // add edge
      parsed.get(from).set(action, { to, callBack });
    });

    return parsed;
  }
}

// enum State {
//   good = 'good',
//   bad = 'bad',
// }

// enum Action {
//   smile = 'smile',
//   cry = 'cry',
// }

// class Son {

//   private static transitions = ST.parse([
//     { from: LOBBY, action: GO_TO_END, to: END },
//     { from: LOBBY, action: NEXT_QUESTION, to: QUESTION_COUNTDOWN },
//     { from: QUESTION_COUNTDOWN, action: SKIP_COUNTDOWN, to: QUESTION_OPEN },
//     { from: QUESTION_COUNTDOWN, action: GO_TO_END, to: END },
//     { from: QUESTION_OPEN, action: GO_TO_ANSWER, to: ANSWER_SHOW },
//     { from: QUESTION_OPEN, action: GO_TO_END, to: END },
//     { from: QUESTION_CLOSE, action: NEXT_QUESTION, to: QUESTION_COUNTDOWN },
//     { from: QUESTION_CLOSE, action: GO_TO_ANSWER, to: ANSWER_SHOW },
//     { from: QUESTION_CLOSE, action: GO_TO_FINAL_RESULTS, to: FINAL_RESULTS },
//     { from: QUESTION_CLOSE, action: GO_TO_END, to: END },
//     { from: FINAL_RESULTS, action: GO_TO_END, to: END },
//     { from: ANSWER_SHOW, action: NEXT_QUESTION, to: QUESTION_COUNTDOWN },
//     { from: ANSWER_SHOW, action: GO_TO_FINAL_RESULTS, to: FINAL_RESULTS },
//     { from: ANSWER_SHOW, action: GO_TO_END, to: END },
//   ]);
//   private st = new ST({
//     state: LOBBY,
//     rules: Son.transitions,
//     beforeStateChange: action => {
//       console.log('beforeStateChange', this.state);
//     },
//     afterStateChange: action => {
//       console.log('afterStateChange', this.state);
//     },
//   });

//   constructor() {}

//   get state() {
//     return this.st.getCurrentState();
//   }

//   dispatch(action: PlayerAction) {
//     this.st.dispatch(action);
//   }
// }

// const son = new Son();
// son.dispatch(NEXT_QUESTION);
// son.dispatch(SKIP_COUNTDOWN);
// son.dispatch(GO_TO_END);
