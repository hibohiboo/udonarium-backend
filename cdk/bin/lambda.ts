#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { UdonariumBackendStack } from '../lib/lambda-stack';

dotenv.config({ path: './.env.local' });

const envList = [
  'PROJECT_ID',
  'SSM_PARAM_KEY_LAYER_VERSIONS_ARN',
] as const;
for (const key of envList) {
  if (!process.env[key]) throw new Error(`please add ${key} to .env`);
}
const processEnv = process.env as Record<(typeof envList)[number], string>;

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new UdonariumBackendStack(app, `${processEnv.PROJECT_ID}-KartaGraphRESTAPIStack`, {
  ssmLambdaLayerKey: `${processEnv.SSM_PARAM_KEY_LAYER_VERSIONS_ARN}-${processEnv.PROJECT_ID}`,
  env,
  projectId: processEnv.PROJECT_ID,
});
