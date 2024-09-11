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
describe('invalidUserName', () => {
  test('should return false for a valid user name_1', () => {
    const result = helper.invalidUserName('John Wick');
    expect(result.isValid).toBe(false);
  });

  test('should return false for a valid user name_2', () => {
    const result = helper.invalidUserName('Altolia Pandragoong');
    expect(result.isValid).toBe(false);
  });

  test('should return true for NameFirst shorter than 2 characters', () => {
    const result = helper.invalidUserName('J Wick');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe(ERROR_MESSAGES.NAME_FIRST_LENGTH);
  });

  test('should return true for NameFirst longer than 20 characters', () => {
    const result = helper.invalidUserName('Johnvvvvvvvvvvvvvvvvv Wick');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe(ERROR_MESSAGES.NAME_FIRST_LENGTH);
  });

  test('should return true for NameFirst containing invalid characters', () => {
    const result = helper.invalidUserName('John! Wick');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe(ERROR_MESSAGES.NAME_FIRST_FORMAT);
  });

  test('should return true for NameLast containing invalid characters', () => {
    const result = helper.invalidUserName('John Wick!');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe(ERROR_MESSAGES.NAME_LAST_FORMAT);
  });

  test('should return true for NameLast shorter than 2 characters', () => {
    const result = helper.invalidUserName('John W');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe(ERROR_MESSAGES.NAME_LAST_LENGTH);
  });

  test('should return true for NameLast longer than 20 characters', () => {
    const result = helper.invalidUserName('John Wickkkkkkkkkkkkkkkkkk');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe(ERROR_MESSAGES.NAME_LAST_LENGTH);
  });

  test('should return true for empty string', () => {
    const result = helper.invalidUserName('');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe(ERROR_MESSAGES.NAME_FIRST_LENGTH);
  });

  test('should return true for string with only spaces', () => {
    const result = helper.invalidUserName('   ');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe(ERROR_MESSAGES.NAME_FIRST_LENGTH);
  });

  test('should return false for NameFirst with exactly 2 characters', () => {
    const result = helper.invalidUserName('Jo Wick');
    expect(result.isValid).toBe(false);
  });

  test('should return false for NameFirst with exactly 20 characters', () => {
    const result = helper.invalidUserName('Johnvvvvvvvvvvvvvvv Wick');
    expect(result.isValid).toBe(false);
  });

  test('should return false for NameLast with exactly 2 characters', () => {
    const result = helper.invalidUserName('John Wi');
    expect(result.isValid).toBe(false);
  });

  test('should return false for NameLast with exactly 20 characters', () => {
    const result = helper.invalidUserName('John Wickkkkkkkkkkkkkkkk');
    expect(result.isValid).toBe(false);
  });
});
/////////////////////////////////////////////////////////////////////