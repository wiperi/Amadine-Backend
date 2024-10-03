import request, { Response } from 'sync-request-curl';
import config from '../../src/config.json';

const AUTH_URL = `${config.url}:${config.port}/v1/admin/auth`;
const QUIZ_URL = `${config.url}:${config.port}/v1/admin/quiz`;
const USER_URL = `${config.url}:${config.port}/v1/admin/user`;

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
      quizId
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
