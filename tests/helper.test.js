import * as helper from "../src/helper.js";
import { ERROR_MESSAGES } from "../src/errors.js";
/////////////////////////////////////////////////////////////////////
// Example
/////////////////////////////////////////////////////////////////////

// describe('{FUNCTION_NAME} ie.adminUserLogin', () => {
//   test('should return an object', () => {});
//   test('...', () => {});
//   test('...', () => {});

//   describe('invalid input', () => {
//     test('...', () => {});
//     test('...', () => {});
//   });
// });

/////////////////////////////////////////////////////////////////////
// Test Cases
describe('isvalidUserName', () => {
  test('should return true for a valid user name_1', () => {
    expect(helper.isvalidUserName('John Wick')).toBe(true);
  });

  test('should return true for a valid user name_2', () => {
    expect(helper.isvalidUserName('Altolia Pandragoong')).toBe(true);
  });

  test('should return false for NameFirst shorter than 2 characters', () => {
    expect(helper.isvalidUserName('J Wick')).toBe(false);
  });

  test('should return false for NameFirst longer than 20 characters', () => {
    expect(helper.isvalidUserName('Johnvvvvvvvvvvvvvvvvv Wick')).toBe(false);
  });

  test('should return false for NameFirst containing invalid characters', () => {
    expect(helper.isvalidUserName('John! Wick')).toBe(false);
  });

  test('should return false for NameLast containing invalid characters', () => {
    expect(helper.isvalidUserName('John Wick!')).toBe(false);
  });

  test('should return false for NameLast shorter than 2 characters', () => {
    expect(helper.isvalidUserName('John W')).toBe(false);
  });

  test('should return false for NameLast longer than 20 characters', () => {
    expect(helper.isvalidUserName('John Wickkkkkkkkkkkkkkkkkk')).toBe(false);
  });

  test('should return false for empty string', () => {
    expect(helper.isvalidUserName('')).toBe(false);
  });

  test('should return false for string with only spaces', () => {
    expect(helper.isvalidUserName('   ')).toBe(false);
  });

  test('should return true for NameFirst with exactly 2 characters', () => {
    expect(helper.isvalidUserName('Jo Wick')).toBe(true);
  });

  test('should return true for NameFirst with exactly 20 characters', () => {
    expect(helper.isvalidUserName('Johnvvvvvvvvvvvvvvvv Wick')).toBe(true);
  });

  test('should return true for NameLast with exactly 2 characters', () => {
    expect(helper.isvalidUserName('John Wi')).toBe(true);
  });

  test('should return true for NameLast with exactly 20 characters', () => {
    expect(helper.isvalidUserName('John Wickkkkkkkkkkkkkkkkk')).toBe(true);
  });
});
/////////////////////////////////////////////////////////////////////