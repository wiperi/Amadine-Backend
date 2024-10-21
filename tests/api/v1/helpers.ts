import request, { Response } from 'sync-request-curl';
import config from '../../../src/config';

const AUTH_URL = `${config.url}:${config.port}/v1/admin/auth`;
const QUIZ_URL = `${config.url}:${config.port}/v1/admin/quiz`;
const USER_URL = `${config.url}:${config.port}/v1/admin/user`;
const PLAYER_URL = `${config.url}:${config.port}/v1/player`;

type ParsedResponse = Omit<Response, 'body'> & { body: Record<string, any> };

function parse(res: Response): ParsedResponse {
  return {
    ...res,
    body: JSON.parse(res.body.toString())
  }
}

export function clear(): ParsedResponse {
  const res = request('DELETE', `${config.url}:${config.port}/v1/clear`);
  return parse(res);
}

export function registerUser(email: string, password: string, nameFirst: string, nameLast: string): ParsedResponse {
  const res = request('POST', `${AUTH_URL}/register`, {
    json: {
      email,
      password,
      nameFirst,
      nameLast
    }
  });
  return parse(res);
}

export function loginUser(email: string, password: string): ParsedResponse {
  const res = request('POST', `${AUTH_URL}/login`, {
    json: {
      email,
      password
    }
  });
  return parse(res);
}

export function logoutUser(token: string): ParsedResponse {
  const res = request('POST', `${AUTH_URL}/logout`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function getUserDetails(token: string): ParsedResponse {
  const res = request('GET', `${USER_URL}/details`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function updateUserDetails(token: string, email: string, nameFirst: string, nameLast: string): ParsedResponse {
  const res = request('PUT', `${USER_URL}/details`, {
    json: {
      token,
      email,
      nameFirst,
      nameLast
    }
  });
  return parse(res);
}

export function updateUserPassword(token: string, oldPassword: string, newPassword: string): ParsedResponse {
  const res = request('PUT', `${USER_URL}/password`, {
    json: {
      token,
      oldPassword,
      newPassword
    }
  });
  return parse(res);
}

export function getQuizList(token: string): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/list`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function getQuizDetails(token: string, quizId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function createQuiz(token: string, name: string, description: string): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}`, {
    json: {
      token,
      name,
      description,
    }
  });
  return parse(res);
}

export function updateQuiz(token: string, quizId: number, name: string, description: string): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}`, {
    json: {
      token,
      name,
      description,
    }
  });
  return parse(res);
}

export function deleteQuiz(token: string, quizId: number): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/${quizId}`, {
    qs: {
      token,
    }
  });
  return parse(res);
}

export function updateQuizDescription(token: string, quizId: number, description: string): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/description`, {
    json: {
      token,
      description
    }
  });
  return parse(res);
}

export function getQuizTrash(token: string): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/trash`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function restoreQuiz(token: string, quizId: number): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/restore`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function deleteQuizPermanently(token: string, quizId: number): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/${quizId}`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function moveQuestion(token: string, quizId: number, questionId: number, newPosition: number): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/question/${questionId}/move`, {
    json: {
      token,
      newPosition
    }
  });
  return parse(res);
}

export function createQuestion(token: string, quizId: number, questionBody: object): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/question`, {
    json: {
      token,
      questionBody
    }
  });
  return parse(res);
}

export function requestAdminQuizNameUpdate(quizId: Number, token: String, name: String) {
  const res = request(
    'PUT',
    `${config.url}:${config.port}/v1/admin/quiz/${quizId}/name`,
    {
      json: {
        token,
        name
      }
    }
  );

  if (res.statusCode === 200) {
    return JSON.parse(res.body.toString());
  }
  return res.statusCode;
}

export function duplicateQuestion(token: string, quizId: number, questionId: number): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/question/${questionId}/duplicate`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function emptyTrash(token: string, quizIds: string): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/trash/empty`, {
    qs: {
      token,
      quizIds
    }
  });
  return parse(res);
}
export function deleteQuestion(token: string, quizId: number, questionId: number): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/${quizId}/question/${questionId}`, {
    qs: {
      token,
    }
  });
  return parse(res);
}

export function transferQuiz(token: string, quizId: number, userEmail: string): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/transfer`, {
    json: {
      token,
      quizId,
      userEmail
    }
  });
  return parse(res);
}

export function updateQuestion(token: string,  quizId: number, questionId: number, questionBody: object): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/question/${questionId}`, {
    json: {
      token,
      quizId,
      questionId,
      questionBody
    }
  });
  return parse(res);
}

export function updateThumbnail(token: string,  quizId: number, imgUrl: string): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/thumnail`, {
    headers: {
      token
    },
    json: {
      quizId,
      imgUrl
    }
  });
  return parse(res);
}

export function viewaActivity(token: string,  quizId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}/sessions`, {
    headers: {
      token
    },
    qs: {
      quizId,
    }
  });
  return parse(res);
}

export function newSession(token: string,  quizId: number, autoStartNum: number): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/sessions/start`, {
    headers: {
      token
    },
    json: {
      quizId,
      autoStartNum
    }
  });
  return parse(res);
}

export function updateSession(token: string,  quizId: number, sessionId: number, action: string): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/sessions/${sessionId}`, {
    headers: {
      token
    },
    json: {
      quizId,
      sessionId,
      action
    }
  });
  return parse(res);
}

export function getNewSession(token: string,  quizId: number, sessionId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}/sessions/${sessionId}`, {
    headers: {
      token
    },
    qs: {
      quizId,
      sessionId,
    }
  });
  return parse(res);
}

export function getSessionFinalResult(token: string,  quizId: number, sessionId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}/sessions/${sessionId}/result`, {
    headers: {
      token
    },
    qs: {
      quizId,
      sessionId,
    }
  });
  return parse(res);
}

export function getCSVFormat(token: string,  quizId: number, sessionId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}/sessions/${sessionId}/result/csv`, {
    headers: {
      token
    },
    qs: {
      quizId,
      sessionId,
    }
  });
  return parse(res);
}

export function joinSession(sessionId: number, name: string): ParsedResponse {
  const res = request('POST', `${PLAYER_URL}/join`, {
    json: {
      sessionId,
      name,
    }
  });
  return parse(res);
}

export function getPlayerSession(playerId: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}`, {
    qs: {
      playerId
    }
  });
  return parse(res);
}

export function getPlayerQuestionInfo(playerId: number, questionposition: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}/question/${questionposition}`, {
    qs: {
      playerId,
      questionposition
    }
  });
  return parse(res);
}

export function putAnswer(answerIds: number, playerId: number, questionposition: number): ParsedResponse {
  const res = request('PUT', `${PLAYER_URL}/${playerId}/question/${questionposition}/answer`, {
    json: {
      answerIds,
      playerId,
      questionposition
    }
  });
  return parse(res);
}

export function getQuestionResult(playerId: number, questionposition: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}/question/${questionposition}/result`, {
    qs: {
      playerId,
      questionposition
    }
  });
  return parse(res);
}

export function getSessionResult(playerId: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}/result`, {
    qs: {
      playerId,
    }
  });
  return parse(res);
}

export function getSessionMessage(playerId: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}/chat`, {
    qs: {
      playerId,
    }
  });
  return parse(res);
}

export function postMessage(playerId: number, message: object): ParsedResponse {
  const res = request('POST', `${PLAYER_URL}/${playerId}/chat`, {
    qs: {
      playerId,
      message
    }
  });
  return parse(res);
}