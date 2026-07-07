// eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
import { testTransaction } from 'pg-transactional-tests';

import { kafkaInstance } from '#/core/kafka/kafka_client.instance';
import { emailClientInstance } from '#/core/email/email_client.instance';
import { appErrorLogger } from '#/http';
import { pgConnect } from '#/core/pg/pg.instance';

jest.mock('#/core/kafka/kafka_client.instance.ts');
jest.mock('#/core/email/email_client.instance.ts');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let appErrorLoggerSpy: jest.SpyInstance;

beforeEach(() => {
  (kafkaInstance.send as jest.Mock).mockClear();
  (emailClientInstance.dispatch as jest.Mock).mockClear();
  appErrorLoggerSpy = jest.spyOn(appErrorLogger, 'error').mockImplementation(() => {});
  // appErrorLoggerSpy = jest.spyOn(appErrorLogger, 'error').mockImplementation(() => console.error.bind(console));
});

afterEach(() => {
  appErrorLoggerSpy.mockRestore();
});

afterAll(async () => {
  await pgConnect.destroy();
});
