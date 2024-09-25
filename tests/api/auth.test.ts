import request from 'sync-request-curl';
import config from '../../src/config.json';

const baseUrl = `${config.url}:${config.port}/v1/admin/auth`;

describe('Auth Router', () => {
  test('should return an object', () => {
    const res = request('GET', `${baseUrl}/`);
    expect(res.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(res.body as string);
    expect(bodyObj.message).toEqual('Auth successful');
  });
});