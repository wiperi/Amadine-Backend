import { EmptyObject } from '@/models/Types';
import { find } from '@/utils/helper';
import { QuizSessionState } from '@/models/Enums';

export function adminPlayerSubmitAnswers(
  playerId: number,
  questionPosition: number,
  answerIds: number[]
): EmptyObject {
  // If player ID does not exist
  const player = find.player(playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  // Session is not in QUESTION_OPEN state
  const quizSession = find.quizSession(player.quizSessionId);
  if (!quizSession) {
    throw new Error('Quiz session not found');
  }
  if (quizSession.state() !== QuizSessionState.QUESTION_OPEN) {
    throw new Error('Quiz session is not in QUESTION_OPEN state');
  }

  // If question position is not valid for the session this player is in
  if (questionPosition <= 0 || questionPosition > quizSession.metadata.questions.length) {
    throw new Error('Question position is out of range');
  }

  // If session is not currently on this question
  if (quizSession.atQuestion !== questionPosition) {
    throw new Error('Session is not currently on this question');
  }

  // Answer IDs are not valid for this particular question
  // const question = quizSession.metadata.questions[questionPosition - 1];
  // if (answerIds.some(answerId => !question.answers.map(answer => answer.id).includes(answerId))) {
  //   throw new Error('Answer IDs are not valid for this particular question');
  // }
  // There are duplicate answer IDs provided
  // Less than 1 answer ID was submitted

  return {};
}
