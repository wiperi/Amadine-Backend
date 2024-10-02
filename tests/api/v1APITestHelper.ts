import request, { Response } from 'sync-request-curl';
import config from '../../src/config.json';

const BASE_URL = `${config.url}:${config.port}/v1/admin/auth`;

type ParsedResponse = Omit<Response, 'body'> & { body: Record<string, any> };

function parse(res: Response): ParsedResponse {
  return {
    ...res,
    body: JSON.parse(res.body.toString())
  }
}

export function registerUser(email: string, password: string, nameFirst: string, nameLast: string): ParsedResponse {
  const res = request('POST', `${BASE_URL}/register`, {
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
  const res = request('POST', `${BASE_URL}/login`, {
    json: {
      email,
      password
    }
  });
  return parse(res);
}

export function logoutUser(token: string): ParsedResponse {
  const res = request('POST', `${BASE_URL}/logout`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function getUserDetails(token: string): ParsedResponse {
  const res = request('GET', `${BASE_URL}/user/details`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function updateUserDetails(token: string, nameFirst: string, nameLast: string): ParsedResponse {
  const res = request('PUT', `${BASE_URL}/user/details`, {
    json: {
      token,
      nameFirst,
      nameLast
    }
  });
  return parse(res);
}

export function updateUserPassword(token: string, oldPassword: string, newPassword: string): ParsedResponse {
  const res = request('PUT', `${BASE_URL}/user/password`, {
    json: {
      token,
      oldPassword,
      newPassword
    }
  });
  return parse(res);
}

export function getQuizList(token: string): ParsedResponse {
  const res = request('GET', `${BASE_URL}/quiz/list`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function getQuizDetails(token: string, quizId: string): ParsedResponse {
  const res = request('GET', `${BASE_URL}/quiz/details`, {
    json: {
      token,
      quizId
    }
  });
  return parse(res);
}

export function createQuiz(token: string, name: string, description: string, duration: number): ParsedResponse {
  const res = request('POST', `${BASE_URL}/quiz/create`, {
    json: {
      token,
      name,
      description,
      duration
    }
  });
  return parse(res);
}

export function updateQuiz(token: string, quizId: string, name: string, description: string, duration: number): ParsedResponse {
  const res = request('PUT', `${BASE_URL}/quiz/update`, {
    json: {
      token,
      quizId,
      name,
      description,
      duration
    }
  });
  return parse(res);
}

export function deleteQuiz(token: string, quizId: string): ParsedResponse {
  const res = request('DELETE', `${BASE_URL}/quiz/delete`, {
    json: {
      token,
      quizId
    }
  });
  return parse(res);
}

export function updateQuizDescription(token: string, quizId: string, description: string): ParsedResponse {
  const res = request('PUT', `${BASE_URL}/quiz/description`, {
    json: {
      token,
      quizId,
      description
    }
  });
  return parse(res);
}

export function getQuizTrash(token: string): ParsedResponse {
  const res = request('GET', `${BASE_URL}/quiz/trash`, {
    json: {
      token
    }
  });
  return parse(res);
}

export function restoreQuiz(token: string, quizId: string): ParsedResponse {
  const res = request('POST', `${BASE_URL}/quiz/restore`, {
    json: {
      token,
      quizId
    }
  });
  return parse(res);
}

export function deleteQuizPermanently(token: string, quizId: string): ParsedResponse {
  const res = request('DELETE', `${BASE_URL}/quiz/delete`, {
    json: {
      token,
      quizId
    }
  });
  return parse(res);
}
