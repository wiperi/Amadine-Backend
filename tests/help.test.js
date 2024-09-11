import * as helper from '../src/helper.js';

// Password is less than 8 characters.
//Password does not contain at least one number and at least one letter.
describe('helper', () => {
    describe('invalidPassword', () => {
    test('password is less than 8 characters', () => {
      expect(helper.invalidPassword('aA1')).toBe(true);
    });
    test('password does not contain at least one number and at least one letter', () => {
      expect(helper.invalidPassword('aaaaAAAA')).toBe(true);
    });
    test('password is valid', () => {
      expect(helper.invalidPassword('aaaaAAAA1')).toBe(false);
    });
  });
}); 