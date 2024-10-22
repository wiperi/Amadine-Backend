import path from 'path';

const config = {
  url: 'http://127.0.0.1',
  port: '3200',
  expandDocs: false,
  jwtSecretKey: 'a1b2c3d4e5f6g7h8',
  logPath: path.join(process.cwd(), 'logs')
};

export default config;
