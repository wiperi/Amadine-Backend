import request, { Response } from 'sync-request-curl';
import config from '../../../src/config';
import {parse, ParsedResponse} from '../../../tests/api/v1/helpers';

const AUTH_URL = `${config.url}:${config.port}/v2/admin/auth`;
const QUIZ_URL = `${config.url}:${config.port}/v2/admin/quiz`;
const USER_URL = `${config.url}:${config.port}/v2/admin/user`;

export function userLogout(token: string): ParsedResponse {
  const res = request('POST', `${AUTH_URL}/logout`, {
    headers: {
      token
    }
  });
  return parse(res);
}

export function userGetDetails(token: string): ParsedResponse {
  const res = request('GET', `${USER_URL}/details`, {
    headers: {
      token
    }
  });
  return parse(res);
}

export function userUpdateDetails(token: string, email: string, nameFirst: string, nameLast: string): ParsedResponse {
  const res = request('PUT', `${USER_URL}/details`, {
    headers: {
        token
    },
    json: {
      email,
      nameFirst,
      nameLast
    }
  });
  return parse(res);
}

export function userUpdatePassword(token: string, oldPassword: string, newPassword: string): ParsedResponse {
  const res = request('PUT', `${USER_URL}/password`, {
    headers: {
        token
    },
    json: {
      oldPassword,
      newPassword
    }
  });
  return parse(res);
}

export function quizGetList(token: string): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/list`, {
    headers: {
      token
    }
  });
  return parse(res);
}

export function quizGetDetails(token: string, quizId: number): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/${quizId}`, {
    headers: {
      token
    }
  });
  return parse(res);
}

export function quizCreate(token: string, name: string, description: string): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}`, {
    headers: {
        token
    },
    json: {
      name,
      description,
    }
  });
  return parse(res);
}

export function quizDelete(token: string, quizId: number): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/${quizId}`, {
    headers: {
      token,
    }
  });
  return parse(res);
}

export function quizUpdateDescription(token: string, quizId: number, description: string): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/description`, {
    headers: {
        token
    },
    json: {
      description
    }
  });
  return parse(res);
}

export function quizGetTrash(token: string): ParsedResponse {
  const res = request('GET', `${QUIZ_URL}/trash`, {
    headers: {
      token
    }
  });
  return parse(res);
}

export function quizRestore(token: string, quizId: number): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/restore`, {
    headers: {
      token
    }
  });
  return parse(res);
}

export function questionMove(token: string, quizId: number, questionId: number, newPosition: number): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/question/${questionId}/move`, {
    headers: {
        token
    },
    json: {
      newPosition
    }
  });
  return parse(res);
}

export function questionCreate(token: string, quizId: number, questionBody: object): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/question`, {
    headers: {
        token
    },
    json: {
      questionBody
    }
  });
  return parse(res);
}

export function quizRequestNameUpdate(quizId: number, token:string, name: string) {
  const res = request(
    'PUT',
    `${config.url}:${config.port}/v1/admin/quiz/${quizId}/name`,
    {
      headers: {
        token
    },
      json: {
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
    headers: {
      token
    }
  })
  return parse(res);
}

export function trashEmpty(token: string, quizIds: string): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/trash/empty`, {
    headers: {
        token
    },
    qs: {
      quizIds
    }
  });
  return parse(res);
}
export function questionDelete(token: string, quizId: number, questionId: number): ParsedResponse {
  const res = request('DELETE', `${QUIZ_URL}/${quizId}/question/${questionId}`, {
    headers: {
      token,
    }
  });
  return parse(res);
}

export function quizTransfer(token: string, quizId: number, userEmail: string): ParsedResponse {
  const res = request('POST', `${QUIZ_URL}/${quizId}/transfer`, {
    headers: {
        token
    },
    json: {
      quizId,
      userEmail
    }
  });
  return parse(res);
}

export function questionUpdate(token: string,  quizId: number, questionId: number, questionBody: object): ParsedResponse {
  const res = request('PUT', `${QUIZ_URL}/${quizId}/question/${questionId}`, {
    headers: {
        token
    },
    json: {
      quizId,
      questionId,
      questionBody
    }
  });
  return parse(res);
}
