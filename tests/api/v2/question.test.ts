import {
    userRegister,
    clear
} from '../v1/helpers';

import {
    quizGetDetails,
    quizCreate,
    questionCreate,
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
          thumbnailUrl: "http://google.com/some/image/path.jpg"
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
        thumbnailUrl: "http://google.com/some/image/path.jpg"
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
        thumbnailUrl: "http://google.com/some/image/path.jpg"
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
          thumbnailUrl: "http://google.com/some/image/path.com"
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
          thumbnailUrl: ''
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
          thumbnailUrl: 'webcms3.cse.unsw.edu.au.png'
        };
        const res3 = questionCreate(token, quizId, questionBody3);
        expect(res3.statusCode).toBe(400);
        expect(res3.body).toStrictEqual(ERROR);
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
      thumbnailUrl: "http://google.com/some/image/path.jpg"
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
        thumbnailUrl: "http://google.com/some/image/path.jpg"
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
        thumbnailUrl: "http://google.com/some/image/path.jpg"
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
        thumbnailUrl: ""
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
        thumbnailUrl: "http://google.com/some/image/path.com"
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
        thumbnailUrl: "google.com/some/image/path.jpg"
      };
      const res2 = questionUpdate(token, quizId, questionId, updatedQuestionBody2);
      expect(res2.statusCode).toBe(400);
      expect(res2.body).toStrictEqual(ERROR);
    });
  });
});

// test for question delete
describe('DELETE /v1/admin/quiz/:quizId/question/:questionId', () => {
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
      thumbnailUrl: "http://google.com/some/image/path.jpg"
    });
    expect(createQuestionRes.statusCode).toBe(200);
    questionId = createQuestionRes.body.questionId;
  });


  describe('invalid cases', () => {
    // will be implemented after finished quizSessionUpdate
    test.todo('session for this quiz is not in END state');
  });
});