import { Runtime } from 'aws-cdk-lib/aws-lambda';

export const RUNTIME_VERSION = Runtime.NODEJS_22_X;
export const TARGET_APP_DIRECTORY = '../packages/backend/aws-lambda';