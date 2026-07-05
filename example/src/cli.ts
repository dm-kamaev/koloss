// ENTRY point for run task vi cli or by cron

import { parseArgs } from 'node:util';
import { AsyncOK } from '@/lib';
import { orderJobs } from '@/module/order/order.cli.router';
import { userJobs } from '@/module/user/user.cli.router';

const jobs: Record<string, () => AsyncOK> = {
  ...orderJobs,
  ...userJobs,
};

export async function invokeCommand(args: string[] = process.argv) {
  const { positionals } = parseArgs({
    args: args.slice(2),
    allowPositionals: true,
    strict: false, // Prevent throwing on unknown options meant for the job
  });

  const taskName = positionals[0];

  if (!taskName) {
    console.error('Task name is required');
    process.exit(1);
  }

  const job = jobs[taskName];

  if (!job) {
    throw new Error(`Task ${taskName} not found`);
  }

  await job();
}

async function runCli() {
  try {
    await invokeCommand();

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  runCli();
}
