import { userRegister, clear, quizSessionCreate, quizSessionUpdateState } from '../v1/helpers';

import {
  quizGetDetails,
  quizCreate,
  questionCreate,
  questionMove,
  questionDuplicate,
  questionDelete,
  questionUpdate,
} from './helpers';

const ERROR = { error: expect.any(String) };

let token: string;
beforeEach(() => {
  clear();
  // Register a user and get the token
  const res = userRegister('test@example.com', 'ValidPass123', 'John', 'Doe');
  expect(res.statusCode).toBe(200);
  token = res.body.token;
});

afterAll(() => {
  clear();
});

// test for question create
describe('POST /v2/admin/quiz/:quizId/question', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test using the helper function with duration
    const quizResponse = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(quizResponse.statusCode).toBe(200);
    quizId = quizResponse.body.quizId;
  });
  describe('valid cases', () => {
    test('successful question creation', () => {
      const questionBody = {
        question: 'What is the capital of France?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
          { answer: 'Rome', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
      const getQuizRes = quizGetDetails(token, quizId);
      expect(getQuizRes.statusCode).toBe(200);
      const questions = getQuizRes.body.questions;
      expect(questions).toBeDefined();
      expect(questions.length).toBeGreaterThan(0);

      // Optionally, verify that the question matches what was added
      const addedQuestion = questions.find((q: any) => q.questionId === res.body.questionId);
      expect(addedQuestion).toBeDefined();
      expect(addedQuestion.question).toBe(questionBody.question);
      expect(addedQuestion.duration).toBe(questionBody.duration);
      expect(addedQuestion.points).toBe(questionBody.points);
      expect(addedQuestion.answers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ answer: 'Paris', correct: true }),
          expect.objectContaining({ answer: 'Berlin', correct: false }),
          expect.objectContaining({ answer: 'Rome', correct: false }),
        ])
      );
      expect(getQuizRes.body.duration).toEqual(60);
    });

    test('seccussfully add muli-questions', () => {
      const questionBody1 = {
        question: 'What is the capital of France?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
          { answer: 'Rome', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      let res = questionCreate(token, quizId, questionBody1);
      expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
      let getQuizRes = quizGetDetails(token, quizId);
      expect(getQuizRes.statusCode).toBe(200);
      const questionBody2 = {
        question: 'who is the most powerful person in the world?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Cheong', correct: false },
          { answer: 'Mao', correct: true },
          { answer: 'Ting', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      res = questionCreate(token, quizId, questionBody2);
      getQuizRes = quizGetDetails(token, quizId);
      expect(getQuizRes.statusCode).toBe(200);
      expect(getQuizRes.body.duration).toEqual(120);
    });
  });

  describe('invalid cases', () => {
    test('invalid thumbnail url', () => {
      const questionBody1 = {
        question: 'What is the capital of France?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
          { answer: 'Rome', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.com',
      };
      const res1 = questionCreate(token, quizId, questionBody1);
      expect(res1.statusCode).toBe(400);
      expect(res1.body).toStrictEqual(ERROR);

      const questionBody2 = {
        question: 'What is the capital of France?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
          { answer: 'Rome', correct: false },
        ],
        thumbnailUrl: '',
      };
      const res2 = questionCreate(token, quizId, questionBody2);
      expect(res2.statusCode).toBe(400);
      expect(res2.body).toStrictEqual(ERROR);

      const questionBody3 = {
        question: 'What is the capital of France?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
          { answer: 'Rome', correct: false },
        ],
        thumbnailUrl: 'webcms3.cse.unsw.edu.au.png',
      };
      const res3 = questionCreate(token, quizId, questionBody3);
      expect(res3.statusCode).toBe(400);
      expect(res3.body).toStrictEqual(ERROR);
    });

    test('invalid token', () => {
      const questionBody = {
        question: 'What is the capital of Germany?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Berlin', correct: true },
          { answer: 'Munich', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate('invalid_token', quizId, questionBody);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const questionBody = {
        question: 'What is the capital of Germany?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Berlin', correct: true },
          { answer: 'Munich', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate('', quizId, questionBody);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('invalid quizId', () => {
      const questionBody = {
        question: 'What is the capital of Germany?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Berlin', correct: true },
          { answer: 'Munich', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, 0, questionBody);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user
      const resRegister = userRegister('nice@unsw.edu.au', 'ValidPass123', 'Jane', 'Doe');
      expect(resRegister.statusCode).toBe(200);
      const otherToken = resRegister.body.token;

      const questionBody = {
        question: 'What is the capital of Italy?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Rome', correct: true },
          { answer: 'Milan', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(otherToken, quizId, questionBody);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('question string is less than 5 characters', () => {
      const questionBody = {
        question: 'Hi',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Yes', correct: true },
          { answer: 'No', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('question string is more than 50 characters', () => {
      const longQuestion = 'A'.repeat(51);
      const questionBody = {
        question: longQuestion,
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Option A', correct: true },
          { answer: 'Option B', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('number of answers is less than 2', () => {
      const questionBody = {
        question: 'Is the sky blue?',
        duration: 30,
        points: 5,
        answers: [{ answer: 'Yes', correct: true }],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('number of answers is more than 6', () => {
      const questionBody = {
        question: 'Name all continents',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Asia', correct: true },
          { answer: 'Africa', correct: true },
          { answer: 'North America', correct: true },
          { answer: 'South America', correct: true },
          { answer: 'Antarctica', correct: true },
          { answer: 'Europe', correct: true },
          { answer: 'Australia', correct: true },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('question duration is not positive', () => {
      const questionBody = {
        question: 'What is 2 + 2?',
        duration: 0,
        points: 5,
        answers: [
          { answer: '4', correct: true },
          { answer: '5', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('sum of question durations exceeds quiz duration', () => {
      const firstQuestionBody = {
        question: 'First long question',
        duration: 180,
        points: 5,
        answers: [
          { answer: 'Option A', correct: true },
          { answer: 'Option B', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const resFirst = questionCreate(token, quizId, firstQuestionBody);
      expect(resFirst.body).toHaveProperty('questionId');

      const secondQuestionBody = {
        question: 'Second question',
        duration: 1,
        points: 5,
        answers: [
          { answer: 'Option A', correct: true },
          { answer: 'Option B', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const resSecond = questionCreate(token, quizId, secondQuestionBody);
      expect(resSecond.statusCode).toBe(400);
      expect(resSecond.body).toStrictEqual(ERROR);
    });

    test('points awarded are less than 1', () => {
      const questionBody = {
        question: 'What is the speed of light?',
        duration: 60,
        points: 0,
        answers: [
          { answer: '299,792 km/s', correct: true },
          { answer: '150,000 km/s', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('points awarded are greater than 10', () => {
      const questionBody = {
        question: 'What is the speed of sound?',
        duration: 60,
        points: 11,
        answers: [
          { answer: '343 m/s', correct: true },
          { answer: '150 m/s', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('answer length shorter than 1 character', () => {
      const questionBody = {
        question: 'What does DNA stand for?',
        duration: 60,
        points: 5,
        answers: [
          { answer: '', correct: true },
          { answer: 'Deoxyribonucleic Acid', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('answer length longer than 30 characters', () => {
      const longAnswer = 'A'.repeat(31);
      const questionBody = {
        question: 'What does DNA stand for?',
        duration: 60,
        points: 5,
        answers: [
          { answer: longAnswer, correct: true },
          { answer: 'Deoxyribonucleic Acid', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('duplicate answer strings within the same question', () => {
      const questionBody = {
        question: 'Which planet is known as the Red Planet?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Mars', correct: true },
          { answer: 'Mars', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('no correct answers provided', () => {
      const questionBody = {
        question: 'Which planet is known as the Blue Planet?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Mars', correct: false },
          { answer: 'Venus', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});

// test for question update
describe('PUT /v2/admin/quiz/:quizid/question/:questionid', () => {
  let quizId: number;
  let questionId: number;

  beforeEach(() => {
    // Create a quiz
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

    // Create a question
    const questionBody = {
      question: 'What is the capital of France?',
      duration: 60,
      points: 5,
      answers: [
        { answer: 'Paris', correct: true },
        { answer: 'Berlin', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    const createQuestionRes = questionCreate(token, quizId, questionBody);
    expect(createQuestionRes.statusCode).toBe(200);
    questionId = createQuestionRes.body.questionId;
  });

  describe('Valid Cases', () => {
    test('successfully update the quiz question', () => {
      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 120,
        points: 7,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(200);

      const quizDetailsRes = quizGetDetails(token, quizId);
      expect(quizDetailsRes.statusCode).toBe(200);
      const updatedQuestion = quizDetailsRes.body.questions.find(
        (q: any) => q.questionId === questionId
      );
      expect(updatedQuestion).toBeDefined();
      expect(updatedQuestion.question).toBe(updatedQuestionBody.question);
      expect(updatedQuestion.duration).toBe(updatedQuestionBody.duration);
      expect(updatedQuestion.points).toBe(updatedQuestionBody.points);
    });

    test('successful update should change last edited time', async () => {
      // Get initial quiz details
      const quizDetailsRes = quizGetDetails(token, quizId);
      expect(quizDetailsRes.statusCode).toBe(200);
      const initialTimeLastEdited = quizDetailsRes.body.timeLastEdited;

      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 120,
        points: 7,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const updateRes = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(updateRes.statusCode).toBe(200);

      const updatedQuizDetailsRes = quizGetDetails(token, quizId);
      expect(updatedQuizDetailsRes.statusCode).toBe(200);
      const updatedTimeLastEdited = updatedQuizDetailsRes.body.timeLastEdited;
      expect(updatedTimeLastEdited).not.toBe(initialTimeLastEdited);
    });
  });

  describe('Error Cases', () => {
    test('invalid thumbnail url', () => {
      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 120,
        points: 7,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
        thumbnailUrl: '',
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);

      const updatedQuestionBody1 = {
        question: 'What is the largest country in the world?',
        duration: 120,
        points: 7,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.com',
      };
      const res1 = questionUpdate(token, quizId, questionId, updatedQuestionBody1);
      expect(res1.statusCode).toBe(400);
      expect(res1.body).toStrictEqual(ERROR);

      const updatedQuestionBody2 = {
        question: 'What is the largest country in the world?',
        duration: 120,
        points: 7,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
        thumbnailUrl: 'google.com/some/image/path.jpg',
      };
      const res2 = questionUpdate(token, quizId, questionId, updatedQuestionBody2);
      expect(res2.statusCode).toBe(400);
      expect(res2.body).toStrictEqual(ERROR);
    });

    test('invalid quizId', () => {
      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 120,
        points: 7,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate(token, 0, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('Invalid questionId does not refer to a valid question within this quiz', () => {
      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      // Attempting to update with an invalid questionId
      const res = questionUpdate(token, quizId, 99999, updatedQuestionBody);
      expect(res.statusCode).toBe(400); // Expect a 400 status code
    });

    test('Invalid token', () => {
      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate('invalid_token', quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(401);
    });

    test('Not owner of the quiz (valid token but not the quiz owner)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      // Assuming we have another token from a different user who doesn't own this quiz
      const registerOtherUserRes = userRegister(
        'otheruser@example.com',
        'OtherValidPass123',
        'Jane',
        'Doe'
      );
      expect(registerOtherUserRes.statusCode).toBe(200);
      const otherUserToken = registerOtherUserRes.body.token;
      const res = questionUpdate(otherUserToken, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(403);
    });

    test('Invalid question string length (less than 5 or more than 50 characters)', () => {
      const updatedQuestionBody = {
        question: 'Hi', // Invalid length (less than 5 characters)
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Invalid number of answers (less than 2 or more than 6)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true }, // Only 1 answer (less than 2)
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Invalid question duration (not a positive number)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: -1, // Invalid duration (negative)
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Total duration exceeds 180 seconds after question update', () => {
      // Create the first question with a valid duration
      const questionBody1 = {
        question: 'Question 1',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Answer 1', correct: true },
          { answer: 'Answer 2', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const createQuestionRes1 = questionCreate(token, quizId, questionBody1);
      expect(createQuestionRes1.statusCode).toBe(200);

      // Create another question with a small duration
      const questionBody2 = {
        question: 'Question 2',
        duration: 50,
        points: 5,
        answers: [
          { answer: 'Answer 1', correct: true },
          { answer: 'Answer 2', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const createQuestionRes2 = questionCreate(token, quizId, questionBody2);
      expect(createQuestionRes2.statusCode).toBe(200);

      // Now try to update the first question to push total duration over 180 seconds
      const updatedQuestionBody = {
        question: 'Updated Question',
        duration: 100,
        points: 5,
        answers: [
          { answer: 'Answer A', correct: true },
          { answer: 'Answer B', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };

      const res = questionUpdate(
        token,
        quizId,
        createQuestionRes1.body.questionId,
        updatedQuestionBody
      );
      expect(res.statusCode).toBe(400);
    });

    test('Invalid points awarded (less than 1 or greater than 10)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 0, // Invalid points (less than 1)
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Answer string length (shorter than 1 character or longer than 30 characters)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: '', correct: true }, // Invalid answer (empty string)
          { answer: 'Berlin', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Duplicate answers in the same question', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Paris', correct: false }, // Duplicate answers
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('No correct answers provided', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: false },
          { answer: 'Berlin', correct: false }, // No correct answer
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });
  });
});

// test for question delete
describe('DELETE /v2/admin/quiz/:quizId/question/:questionId', () => {
  let quizId: number;
  let questionId: number;
  beforeEach(() => {
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

    const createQuestionRes = questionCreate(token, quizId, {
      question: 'Are you my master?',
      duration: 60,
      points: 6,
      answers: [
        { answer: 'Yes', correct: true },
        { answer: 'No', correct: false },
        { answer: 'Maybe', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    });
    expect(createQuestionRes.statusCode).toBe(200);
    questionId = createQuestionRes.body.questionId;
  });

  describe('invalid cases', () => {
    test('session for this quiz is not in END state', () => {
      // Create a session to ensure the quiz is not in END state
      const sessionRes = quizSessionCreate(token, quizId, 2);
      expect(sessionRes.statusCode).toBe(200);

      // Now attempt to delete the question
      const deleteRes = questionDelete(token, quizId, questionId);
      expect(deleteRes.statusCode).toBe(400);
    });
  });
  describe('valid cases', () => {
    test('successfully delete a question when all quiz sessions are in END state', () => {
      // Start a session for the quiz
      const sessionRes = quizSessionCreate(token, quizId, 2); // Create a session
      expect(sessionRes.statusCode).toBe(200);
      const sessionId = sessionRes.body.sessionId;
      const endSessionRes = quizSessionUpdateState(token, quizId, sessionId, 'END');
      expect(endSessionRes.statusCode).toBe(200);

      // Now attempt to delete the question
      const deleteRes = questionDelete(token, quizId, questionId);
      expect(deleteRes.statusCode).toBe(200);
    });
  });
});

// test for question move
describe('PUT /v2/admin/quiz/:quizId/question/:questionId/move', () => {
  let quizId: number;
  let questionId1: number;
  let questionId2: number;

  beforeEach(() => {
    // Create a quiz first
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

    const questionBody1 = {
      question: 'What is the capital of France?',
      duration: 60,
      points: 5,
      answers: [
        { answer: 'Paris', correct: true },
        { answer: 'Berlin', correct: false },
        { answer: 'Rome', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    const createQuestionRes1 = questionCreate(token, quizId, questionBody1);
    expect(createQuestionRes1.statusCode).toBe(200);
    questionId1 = createQuestionRes1.body.questionId;

    // Add the second question
    const questionBody2 = {
      question: 'Who is the president of the United States?',
      duration: 60,
      points: 5,
      answers: [
        { answer: 'Biden', correct: true },
        { answer: 'Obama', correct: false },
        { answer: 'Trump', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path2.jpg',
    };
    const createQuestionRes2 = questionCreate(token, quizId, questionBody2);
    expect(createQuestionRes2.statusCode).toBe(200);
    questionId2 = createQuestionRes2.body.questionId;
  });
  describe('invalid cases', () => {
    test('attempt to move a question to an invalid position', () => {
      // Try to move question 1 to an invalid position
      const invalidPosition = 5;
      const moveRes = questionMove(token, quizId, questionId1, invalidPosition);
      expect(moveRes.statusCode).toBe(400);
      expect(moveRes.body).toStrictEqual(ERROR);
    });
  });
  describe('valid cases', () => {
    test('successfully move a question', () => {
      // Move question 1 to the position of question 2
      const moveRes = questionMove(token, quizId, questionId1, 1);
      expect(moveRes.statusCode).toBe(200);
    });
  });
});

// test for question questionDuplicate
describe('POST /v2/admin/quiz/:quizId/question/:questionId/duplicate', () => {
  let quizId: number;
  let questionId: number;
  beforeEach(() => {
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

    const createQuestionRes = questionCreate(token, quizId, {
      question: 'Are you my master?',
      duration: 60,
      points: 6,
      answers: [
        { answer: 'Yes', correct: true },
        { answer: 'No', correct: false },
        { answer: 'Maybe', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    });
    expect(createQuestionRes.statusCode).toBe(200);
    questionId = createQuestionRes.body.questionId;
  });

  describe('valid cases', () => {
    test('successfully duplicate the question', () => {
      const res = questionDuplicate(token, quizId, questionId);
      expect(res.statusCode).toBe(200);
    });
  });
});
