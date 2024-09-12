import * as helper from '../src/helper.js';

// Password is less than 8 characters.
//Password does not contain at least one number and at least one letter.
describe('isvalidPassword', () => {
  describe('Valid Password', () => {
    test('a password contain letters and number and longer than 8 is valid', () => {
      expect(helper.isvalidPassword('aA1aaaaa')).toBe(true);
    });
    test('a password contain letters and number and longer than 8 is valid', () => {
      expect(helper.isvalidPassword('John12345678')).toBe(true);
    });
  });
  describe('Invalid Password', () => {
    test('empty password is invalid', () => {
      expect(helper.isvalidPassword('')).toBe(false);
    });
    test('Password does not contain at least one number and at least one letter.', () => {
      expect(helper.isvalidPassword('aaaa')).toBe(false);
    });
    test('Password is less than 8 characters.', () => {
      expect(helper.isvalidPassword('aA1')).toBe(false);
    });
  });
})