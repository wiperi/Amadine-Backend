export type Transition<STATE, ACTION, CALLBACK> = {
  from: STATE;
  action: ACTION;
  to: STATE;
  callbacks: CALLBACK[];
};

/**
 * StateMachine class represents a finite state machine.
 * It manages state transitions based on defined actions and allows for callback execution.
 *
 * @template STATE - The type for states (string, number, or symbol)
 * @template ACTION - The type for actions (string, number, or symbol)
 * @template INSTANCE - The type of the instance object, callbacks can access instance and make side effects (default: object)
 * @template CALLBACK - The type of callback function (default: function with instance, from, action, and to parameters)
 */
export class StateMachine<
  STATE extends string | number | symbol,
  ACTION extends string | number | symbol,
  INSTANCE extends object = undefined,
  CALLBACK extends (instance: INSTANCE, from: STATE, action: ACTION, to: STATE) => unknown = (
    instance: INSTANCE,
    from: STATE,
    action: ACTION,
    to: STATE,
  ) => unknown,
> {
  // The instance object that the state machine operates on
  protected instance: INSTANCE;
  // The current state of the state machine
  protected currentState: STATE;

  // Static map to store all transitions
  protected static transitions: Map<
    string | number | symbol,
    Map<string | number | symbol, string | number | symbol>
  >;

  // Static map to store all callbacks
  protected static callBackMap: Map<string, object[]>;

  /**
   * @param initial - The initial state
   * @param transtions - Array of transitions
   * @param instance - The instance object, callbacks can access instance and make side effects
   *
   * The transitions is a static property of the class,
   * so a class have only one set of transitions, i.e. every instance of the class share the same transitions rules
   * use StateMachine.parseTransitions to parse transitions from an array of objects
   */
  constructor(
    initial: STATE,
    transitions: Transition<STATE, ACTION, CALLBACK>[],
    instance?: INSTANCE,
  ) {
    this.instance = instance;
    this.currentState = initial;

    // Initialize static maps if they don't exist
    if (!StateMachine.transitions && !StateMachine.callBackMap) {
      StateMachine.transitions = new Map<STATE, Map<ACTION, STATE>>();
      StateMachine.callBackMap = new Map<string, CALLBACK[]>();

      // Add each transition and callback
      transitions.forEach(t => {
        this.addTransition(t);
        this.addCallBack(t);
      });
    }
  }

  /**
   * Static method to parse transitions
   * @param transitions - Array of transition objects
   * @returns Array of Transition objects
   */
  static parseTransitions<
    STATE extends string | number | symbol,
    ACTION extends string | number | symbol,
    INSTANCE extends object = undefined,
    CALLBACK extends (instance: INSTANCE, from: STATE, action: ACTION, to: STATE) => unknown = (
      instance: INSTANCE,
      from: STATE,
      action: ACTION,
      to: STATE,
    ) => unknown,
  >(
    transitions: { from: STATE; action: ACTION; to: STATE; callbacks?: CALLBACK[] }[],
  ): Transition<STATE, ACTION, CALLBACK>[] {
    return transitions.map(t => ({
      from: t.from,
      action: t.action,
      to: t.to,
      callbacks: t.callbacks,
    }));
  }

  /**
   * Get the current state of the state machine
   * @returns The current state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Add a new transition to the state machine
   * @param t - The transition to add
   */
  addTransition(t: Transition<STATE, ACTION, CALLBACK>) {
    const { from, action, to } = t;

    // If vertex not exist, create one
    if (!StateMachine.transitions.has(from)) {
      StateMachine.transitions.set(from, new Map<ACTION, STATE>());
    }

    // If edge already exist, error
    if (StateMachine.transitions.get(from).has(action)) {
      throw new Error(
        `State ${String(from)} has already an transition ${String(action)}, to ${String(to)}`,
      );
    }

    StateMachine.transitions.get(from)!.set(action, to);
  }

  /**
   * Add a callback to the state machine
   * @param t - The transition containing the callback
   */
  addCallBack(t: Transition<STATE, ACTION, CALLBACK>) {
    const { from, action, to, callbacks } = t;
    const key = `${String(from)}>${String(action)}>${String(to)}`;

    if (!StateMachine.callBackMap.has(key)) {
      StateMachine.callBackMap.set(key, []);
    }

    callbacks && StateMachine.callBackMap.get(key).push(...callbacks);
  }

  /**
   * Dispatch an action to transition the state machine
   * @param action - The action to dispatch
   */
  dispatch(action: ACTION) {
    const currentVertex = StateMachine.transitions.get(this.currentState);
    if (!currentVertex) {
      // There is no out edge of current state
      throw new Error(`State ${String(this.currentState)} is final`);
    }

    if (!currentVertex.has(action)) {
      // action can not apply to current state
      throw new Error(
        `Action ${String(action)} can not apply to current state ${String(this.currentState)}`,
      );
    }

    const next = currentVertex.get(action) as STATE;
    this.triggerCallBack(this.currentState, action, next);

    this.currentState = next;
  }

  /**
   * Check if an action can be dispatched from a given state
   * @param from - The state to dispatch from
   * @param action - The action to dispatch
   * @returns The next state if the action can be dispatched, undefined otherwise
   */
  canDispatch(from: STATE, action: ACTION): STATE | undefined {
    const currentVertex = StateMachine.transitions.get(from);
    if (!currentVertex) {
      // There is no out edge of current state
      throw new Error(`State ${String(from)} is final`);
    }

    if (!currentVertex.has(action)) {
      // action can not apply to current state
      throw new Error(`Action ${String(action)} can not apply to current state ${String(from)}`);
    }

    const next = currentVertex.get(action) as STATE;
    this.triggerCallBack(from, action, next);
    return next;
  }

  /**
   * Jump to a specific state
   * @param state - The state to jump to
   */
  jumpTo(state: STATE) {
    this.currentState = state;
  }

  /**
   * Trigger callbacks associated with a transition
   * @param from - The state transitioning from
   * @param action - The action causing the transition
   * @param to - The state transitioning to
   */
  protected triggerCallBack(from: STATE, action: ACTION, to: STATE) {
    const key = `${String(from)}>${String(action)}>${String(to)}`;

    StateMachine.callBackMap.get(key)?.forEach((f: CALLBACK) => {
      f(this.instance, from, action, to);
    });
  }
}
