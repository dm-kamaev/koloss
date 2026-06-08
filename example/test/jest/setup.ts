import { kafkaInstance } from '@/core/kafka_client.instance';
import { emailClientInstance } from '@/core/email_client.instance';
import { appErrorLogger } from '@/http';

jest.mock('@/core/kafka_client.instance.ts');
jest.mock('@/core/email_client.instance.ts');

let appErrorLoggerSpy: jest.SpyInstance;

beforeEach(() => {
  (kafkaInstance.send as jest.Mock).mockClear();
  (emailClientInstance.dispatch as jest.Mock).mockClear();
  appErrorLoggerSpy = jest.spyOn(appErrorLogger, 'error').mockImplementation(() => {});
});

afterEach(() => {
  appErrorLoggerSpy.mockRestore();
});
