// State of a quiz session
export enum QuizSessionState {
  LOBBY = 0,
  QUESTION_COUNTDOWN,
  QUESTION_OPEN,
  QUESTION_CLOSE,
  ANSWER_SHOW,
  FINAL_RESULTS,
  END,
}

// Action that can be taken in a quiz session
export enum PlayerAction {
  NEXT_QUESTION = 50,
  SKIP_COUNTDOWN,
  GO_TO_ANSWER,
  GO_TO_FINAL_RESULTS,
  END,
}

export enum Color {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  BROWN = 'brown',
  ORANGE = 'orange',
}
