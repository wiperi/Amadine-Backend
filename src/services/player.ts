import { getData } from '@/dataStore';
import { QuizSession, Player } from '@/models/Classes';
import { QuizSessionState } from '@/models/Enums';
import { ERROR_MESSAGES } from '@/utils/errors';
import { findQuizSessionById, getNewID, getRandomName, isPlayerNameUnique } from '@/utils/helper';
import { HttpError } from '@/utils/HttpError';

export function PlayerJoinSession(sessionId: number, name: string): { playerId: number } {
  if (!isPlayerNameUnique(name, sessionId)) {
    throw new HttpError(400, ERROR_MESSAGES.PLAYER_NAME_ALREADY_USED);
  }

  const quizSession: QuizSession = findQuizSessionById(sessionId);

  if (!quizSession) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_SESSION_ID);
  }

  if (quizSession.state() !== QuizSessionState.LOBBY) {
    throw new HttpError(400, ERROR_MESSAGES.SESSION_NOT_IN_LOBBY_STATE);
  }

  // if name is empty, then generated with the structure 5letters + 3numbers
  if (!name) {
    name = getRandomName();
  }

  const playerId: number = getNewID('player');

  const player: Player = new Player(playerId, sessionId, name);

  getData().players.push(player);

  return { playerId: playerId };
}
