// eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
import { testTransaction } from 'pg-transactional-tests';

import { kafkaInstance } from '#/lib/kafka/kafka_client.instance';
import { emailClientInstance } from '#/lib/email/email_client.instance';
import { appErrorLogger } from '#/entry/http';
import { pgConnect } from '#/lib/pg/pg.instance';

jest.mock('#/lib/kafka/kafka_client.instance.ts');
jest.mock('#/lib/email/email_client.instance.ts');

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
