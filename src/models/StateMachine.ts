/**
 * Valid types of the state and action
 */
type Token = string | number | symbol;

/**
 * A type representing a state transition.
 * @template S - The type of the state
 * @template A - The type of the action
 */
type Transition<S extends Token, A extends Token> = {
  from: S;
  action: A;
  to: S;
  callBack?: () => void | undefined;
};

/**
 * A type representing the properties of the state machine.
 * @template S - The type of the state
 * @template A - The type of the action
 */
type Props<S extends Token, A extends Token> = {
  state: S;
  rules: Map<S, Map<A, { to: S; callBack: () => void | undefined }>>;
  beforeStateChange?: (action: A) => void | undefined;
  afterStateChange?: (action: A) => void | undefined;
};

/**
 * A finite state machine.
 * It manages state transitions based on defined actions and allows for callback execution.
 * @template S - The type of the state
 * @template A - The type of the action
 */
export class StateMachine<S extends Token, A extends Token> {
  private _state: Props<S, A>['state'];
  private rules: Props<S, A>['rules'];
  private beforeStateChange?: Props<S, A>['beforeStateChange'];
  private afterStateChange?: Props<S, A>['afterStateChange'];

  /**
   * Creates an instance of the state machine.
   * @param props - The properties of the state machine.
   * @example
   * const stateMachine = new ST<string, string>({
   *  state: 'A',
   *  rules: ST.parse<string, string>({
   *    { from: 'A', action: 'B', to: 'C' },
   *    { from: 'A', action: 'D', to: 'E', callBack: () => console.log('D') },
   *  }),
   *  beforeStateChange: (action) => console.log('Before state change', action),
   *  afterStateChange: (action) => console.log('After state change', action),
   * });
   */
  constructor(props: Props<S, A>) {
    const { state, rules, beforeStateChange, afterStateChange } = props;
    this._state = state;
    this.rules = rules;
    this.beforeStateChange = beforeStateChange;
    this.afterStateChange = afterStateChange;
  }

  /**
   * Gets the current state of the state machine.
   * @returns The current state.
   */
  get state() {
    return this._state;
  }

  /**
   * Dispatches an action to the state machine, causing a state transition.
   * @param action - The action to dispatch.
   * @throws Error if the current state is final or the action is not valid for the current state.
   */
  dispatch(action: A) {
    this.beforeStateChange?.(action);

    const vertex = this.rules.get(this._state);
    // No outbound edge from current state
    if (!vertex) {
      throw new Error(`State ${String(this._state)} is final`);
    }
    // Action not exist for current state
    if (!vertex.has(action)) {
      throw new Error(
        `Action ${String(action)} can not apply to current state ${String(this._state)}`
      );
    }

    const { to, callBack } = vertex.get(action);

    this._state = to;
    callBack && callBack();

    this.afterStateChange?.(action);
  }

  /**
   * Jumps to a specific state without any action, then triggers the afterStateChange callback.
   * @param state - The state to jump to.
   */
  jumpTo(state: S) {
    this._state = state;

    this.afterStateChange?.(null);
  }

  /**
   * Parses an array of transitions into a rules map.
   * @param transitions - The array of transitions to parse.
   * @returns The parsed rules map.
   * @throws Error if a transition already exists for a state-action pair.
   * @example
   * const transitions = [
   *  { from: 'A', action: 'B', to: 'C' },
   *  { from: 'A', action: 'D', to: 'E', callBack: () => console.log('D') },
   * ];
   * const rules = ST.parse<string, string>(transitions);
   */
  static parse<S extends Token, A extends Token>(
    transitions: Transition<S, A>[]
  ): Props<S, A>['rules'] {
    const parsed = new Map<S, Map<A, { to: S; callBack:() => void | undefined }>>();

    transitions.forEach(t => {
      const { from, action, to, callBack } = t;

      // If vertex not exist, create one
      if (!parsed.has(from)) {
        parsed.set(from, new Map());
      }

      // If edge already exist, error
      if (parsed.get(from).has(action)) {
        throw new Error(
          `State ${String(from)} has already an transition ${String(action)}, to ${String(to)}`
        );
      }

      // Create edge
      parsed.get(from).set(action, { to, callBack });
    });

    return parsed;
  }
}
