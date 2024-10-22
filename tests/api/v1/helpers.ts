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

export function userRegister(email: string, password: string, nameFirst: string, nameLast: string): ParsedResponse {
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

export function userLogin(email: string, password: string): ParsedResponse {
  const res = request('POST', `${AUTH_URL}/login`, {
    json: {
      email,
      password
    }
  });
  return parse(res);
}

export function userLogout(token: string): ParsedResponse {
  const res = request('POST', `${AUTH_URL}/logout`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function userGetDetails(token: string): ParsedResponse {
  const res = request('GET', `${USER_URL}/details`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function userUpdateDetails(token: string, email: string, nameFirst: string, nameLast: string): ParsedResponse {
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

export function userUpdatePassword(token: string, oldPassword: string, newPassword: string): ParsedResponse {
  const res = request('PUT', `${USER_URL}/password`, {
    json: {
      token,
      oldPassword,
      newPassword
    }
  });
  return parse(res);
}

export function quizGetList(token: string): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/list`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function quizGetDetails(token: string, quizId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function quizCreate(token: string, name: string, description: string): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}`, {
    json: {
      token,
      name,
      description,
    }
  });
  return parse(res);
}

export function quizUpdate(token: string, quizId: number, name: string, description: string): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}`, {
    json: {
      token,
      name,
      description,
    }
  });
  return parse(res);
}

export function quizDelete(token: string, quizId: number): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/${quizId}`, {
    qs: {
      token,
    }
  });
  return parse(res);
}

export function quizUpdateDescription(token: string, quizId: number, description: string): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/description`, {
    json: {
      token,
      description
    }
  });
  return parse(res);
}

export function quizGetTrash(token: string): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/trash`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function quizRestore(token: string, quizId: number): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/restore`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function quizDeletePermanently(token: string, quizId: number): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/${quizId}`, {
    qs: {
      token
    }
  });
  return parse(res);
}

export function questionMove(token: string, quizId: number, questionId: number, newPosition: number): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/question/${questionId}/move`, {
    json: {
      token,
      newPosition
    }
  });
  return parse(res);
}

export function questionCreate(token: string, quizId: number, questionBody: object): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/question`, {
    json: {
      token,
      questionBody
    }
  });
  return parse(res);
}

export function quizRequestNameUpdate(quizId: Number, token: String, name: String) {
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

export function questionDuplicate(token: string, quizId: number, questionId: number): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/question/${questionId}/duplicate`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function trashEmpty(token: string, quizIds: string): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/trash/empty`, {
    qs: {
      token,
      quizIds
    }
  });
  return parse(res);
}
export function questionDelete(token: string, quizId: number, questionId: number): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/${quizId}/question/${questionId}`, {
    qs: {
      token,
    }
  });
  return parse(res);
}

export function quizTransfer(token: string, quizId: number, userEmail: string): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/transfer`, {
    json: {
      token,
      userEmail
    }
  });
  return parse(res);
}

export function questionUpdate(token: string, quizId: number, questionId: number, questionBody: object): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/question/${questionId}`, {
    json: {
      token,
      questionId,
      questionBody
    }
  });
  return parse(res);
}

export function quizSessionCreate(token: string, quizId: number, autoStartNum: number): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/session/start`, {
    json: {
      token,
      autoStartNum
    }
  });
  return parse(res);
}

export function quizUpdateThumbnail(token: string,  quizId: number, imgUrl: string): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/thumnail`, {
    headers: {
      token
    },
    json: {
      imgUrl
    }
  });
  return parse(res);
}

export function quizSessionGetActivity(token: string,  quizId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}/sessions`, {
    headers: {
      token
    },
  });
  return parse(res);
}

export function quizStartNewSession(token: string,  quizId: number, autoStartNum: number): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/sessions/start`, {
    headers: {
      token
    },
    json: {
      autoStartNum
    }
  });
  return parse(res);
}

export function quizSessionUpdateState(token: string,  quizId: number, sessionId: number, action: string): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/sessions/${sessionId}`, {
    headers: {
      token
    },
    json: {
      action
    }
  });
  return parse(res);
}

export function quizSessionGetStatus(token: string,  quizId: number, sessionId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}/sessions/${sessionId}`, {
    headers: {
      token
    },
  });
  return parse(res);
}

export function quizSessionGetFinalResult(token: string,  quizId: number, sessionId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}/sessions/${sessionId}/result`, {
    headers: {
      token
    },
  });
  return parse(res);
}

export function quizSessionGetFinalResultCsvFormat(token: string,  quizId: number, sessionId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}/sessions/${sessionId}/result/csv`, {
    headers: {
      token
    },
  });
  return parse(res);
}

export function playerJoinSession(sessionId: number, name: string): ParsedResponse {
  const res = request('POST', `${PLAYER_URL}/join`, {
    json: {
      sessionId,
      name,
    }
  });
  return parse(res);
}

export function playerGetStatusInSession(playerId: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}`, {});
  return parse(res);
}

export function playerGetQuestionInfo(playerId: number, questionposition: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}/question/${questionposition}`, {});
  return parse(res);
}

export function playerSubmitAnswer(answerIds: object, playerId: number, questionposition: number): ParsedResponse {
  const res = request('PUT', `${PLAYER_URL}/${playerId}/question/${questionposition}/answer`, {
    json: {
      answerIds
    }
  });
  return parse(res);
}

export function playerGetOneQuestionResult(playerId: number, questionposition: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}/question/${questionposition}/result`, {});
  return parse(res);
}

export function playerGetWholeQuestionFinalResult(playerId: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}/result`, {});
  return parse(res);
}

export function playerGetMessage(playerId: number): ParsedResponse {
  const res = request('GET', `${PLAYER_URL}/${playerId}/chat`, {});
  return parse(res);
}

export function playerPostMessage(playerId: number, message: object): ParsedResponse {
  const res = request('POST', `${PLAYER_URL}/${playerId}/chat`, {
    json: {
      message
    }
  });
  return parse(res);
}