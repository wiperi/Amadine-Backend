import * as helper from '../src/helper.js';

describe('getNewID()', () => {
  it('should return a number', () => {
    expect(typeof helper.getNewID()).toBe('number');
  });
  it('should return a 12 digit number', () => {
    expect(helper.getNewID().toString().length).toBe(12);
  });
});