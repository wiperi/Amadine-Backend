import * as helper from "../src/helper.js";
import { ERROR_MESSAGES } from "../src/errors.js";

// test the isValidUserName function
describe('isValidUserName', () => {
  test('should return true for a valid user name_1', () => {
    expect(helper.isValidUserName('Wick')).toBe(true);
  });

  test('should return true for a valid user name_2', () => {
    expect(helper.isValidUserName('Altolia')).toBe(true);
  });

  test('should return false for Name shorter than 2 characters', () => {
    expect(helper.isValidUserName('J')).toBe(false);
  });

  test('should return false for Name longer than 20 characters', () => {
    expect(helper.isValidUserName('Johnvvvvvvvvvvvvvvvvv')).toBe(false);
  });

  test('should return false for Name containing invalid characters', () => {
    expect(helper.isValidUserName('John!')).toBe(false);
  });

  test('should return true for only empty', () => {
    expect(helper.isValidUserName('    ')).toBe(true);
  });

  test('should return false for string with wrong format', () => {
    expect(helper.isValidUserName('你好')).toBe(false);
  });

  test('should return true for Name with exactly 2 characters', () => {
    expect(helper.isValidUserName('Jo')).toBe(true);
  });

  test('should return true for Name with exactly 20 characters', () => {
    expect(helper.isValidUserName('Johnvvvvvvvvvvvvvvvv')).toBe(true);
  });

});
// Password is less than 8 characters.
//Password does not contain at least one number and at least one letter.
describe('isvalidPassword', () => {
  describe('Valid Password', () => {
    test('a password contain letters and number and longer than 8 is valid', () => {
      expect(helper.isValidPassword('aA1aaaaa')).toBe(true);
    });
    test('a password contain letters and number and longer than 8 is valid', () => {
      expect(helper.isValidPassword('John12345678')).toBe(true);
    });
  });
  describe('Invalid Password', () => {
    test('empty password is invalid', () => {
      expect(helper.isValidPassword('')).toBe(false);
    });
    test('Password does not contain at least one number and at least one letter.', () => {
      expect(helper.isValidPassword('aaaa')).toBe(false);
    });
    test('Password is less than 8 characters.', () => {
      expect(helper.isValidPassword('aA1')).toBe(false);
    });
  });
})

describe('getNewID()', () => {
  it('should return a number', () => {
    expect(typeof helper.getNewID()).toBe('number');
  });
  it('should return a 12 digit number', () => {
    expect(helper.getNewID().toString().length).toBe(12);
  });
});

