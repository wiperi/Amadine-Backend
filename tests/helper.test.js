import * as helper from "../src/helper.js";
import { ERROR_MESSAGES } from "../src/errors.js";

describe('isvalidUserName', () => {
  test('should return true for a valid user name_1', () => {
    expect(helper.isValidUserName('John Wick')).toBe(true);
  });

  test('should return true for a valid user name_2', () => {
    expect(helper.isValidUserName('Altolia Pandragoong')).toBe(true);
  });

  test('should return false for NameFirst shorter than 2 characters', () => {
    expect(helper.isValidUserName('J Wick')).toBe(false);
  });

  test('should return false for NameFirst longer than 20 characters', () => {
    expect(helper.isValidUserName('Johnvvvvvvvvvvvvvvvvv Wick')).toBe(false);
  });

  test('should return false for NameFirst containing invalid characters', () => {
    expect(helper.isValidUserName('John! Wick')).toBe(false);
  });

  test('should return false for NameLast containing invalid characters', () => {
    expect(helper.isValidUserName('John Wick!')).toBe(false);
  });

  test('should return false for NameLast shorter than 2 characters', () => {
    expect(helper.isValidUserName('John W')).toBe(false);
  });

  test('should return false for NameLast longer than 20 characters', () => {
    expect(helper.isValidUserName('John Wickkkkkkkkkkkkkkkkkk')).toBe(false);
  });

  test('should return false for empty string', () => {
    expect(helper.isValidUserName('')).toBe(false);
  });

  test('should return false for string with only spaces', () => {
    expect(helper.isValidUserName('   ')).toBe(false);
  });

  test('should return true for NameFirst with exactly 2 characters', () => {
    expect(helper.isValidUserName('Jo Wick')).toBe(true);
  });

  test('should return true for NameFirst with exactly 20 characters', () => {
    expect(helper.isValidUserName('Johnvvvvvvvvvvvvvvvv Wick')).toBe(true);
  });

  test('should return true for NameLast with exactly 2 characters', () => {
    expect(helper.isValidUserName('John Wi')).toBe(true);
  });

  test('should return true for NameLast with exactly 20 characters', () => {
    expect(helper.isValidUserName('John Wickkkkkkkkkkkkkkkkk')).toBe(true);
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
