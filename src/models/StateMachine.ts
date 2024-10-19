type Transition<STATE, ACTION, CALLBACK> = {
  from: STATE;
  action: ACTION;
  to: STATE;
  callbacks: CALLBACK[];
};

export class StateMachine<
  STATE extends string | number | symbol,
  ACTION extends string | number | symbol,
  INSTANCE extends object = object,
  CALLBACK extends (instance: INSTANCE, from: STATE, action: ACTION, to: STATE) => unknown
  = (instance: INSTANCE, from: STATE, action: ACTION, to: STATE) => unknown
> {
  protected instance: INSTANCE;
  protected currentState: STATE;

  protected static transitions: Map<string | number | symbol, Map<string | number | symbol, string | number | symbol>>;
  protected static callBackMap: Map<string, object[]>;

  constructor(instance: INSTANCE, initial: STATE, transtions: Transition<STATE, ACTION, CALLBACK>[]) {
    this.instance = instance;
    this.currentState = initial;

    if (!StateMachine.transitions && !StateMachine.callBackMap) {
      StateMachine.transitions = new Map<STATE, Map<ACTION, STATE>>();
      StateMachine.callBackMap = new Map<string, CALLBACK[]>();

      transtions.forEach(t => {
        this.addTransition(t);
        this.addCallBack(t);
      });
    }
  }

  static parseTransitions<
    STATE extends string | number | symbol,
    ACTION extends string | number | symbol,
    INSTANCE extends object = object,
    CALLBACK extends (instance: INSTANCE, from: STATE, action: ACTION, to: STATE) => unknown
    = (instance: INSTANCE, from: STATE, action: ACTION, to: STATE) => unknown
  >(transitions: { from: STATE, action: ACTION, to: STATE, callbacks?: CALLBACK[] }[]):
    Transition<STATE, ACTION, CALLBACK>[] {
    return transitions.map(t => ({
      from: t.from,
      action: t.action,
      to: t.to,
      callbacks: t.callbacks
    }));
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
      throw new Error(`State ${String(from)} has already an transition ${String(action)}, to ${String(to)}`);
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
      throw new Error(`State ${String(this.currentState)} is final`);
    }

    if (!currentVertex.has(action)) {
      // action can not apply to current state
      throw new Error(`Action ${String(action)} can not apply to current state ${String(this.currentState)}`);
    }

    const next = currentVertex.get(action) as STATE;
    this.triggerCallBack(this.currentState, action, next);

    this.currentState = next;
  }

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

  jumpTo(state: STATE) {
    this.currentState = state;
  }

  protected triggerCallBack(from: STATE, action: ACTION, to: STATE) {
    const key = `${String(from)}>${String(action)}>${String(to)}`;

    StateMachine.callBackMap.get(key)?.forEach((f: CALLBACK) => {
      f(this.instance, from, action, to);
    });
  }
}
