#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { LambdaLayersStack } from '../lib/lambda-layer-stack';
import { bundleNpm } from '../lib/process/setup';

dotenv.config({ path: './.env.local' });
const envList = ['SSM_PARAM_KEY_LAYER_VERSIONS_ARN', 'PROJECT_ID'] as const;
for (const key of envList) {
  if (!process.env[key]) throw new Error(`please add ${key} to .env`);
}
const processEnv = process.env as Record<(typeof envList)[number], string>;

bundleNpm();

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new LambdaLayersStack(app, `${processEnv.PROJECT_ID}-LambdaLayersStack`, {
  ssmKey: `${processEnv.SSM_PARAM_KEY_LAYER_VERSIONS_ARN}-${processEnv.PROJECT_ID}`,
  commonSsmKey: `${processEnv.SSM_PARAM_KEY_LAYER_VERSIONS_ARN}-${processEnv.PROJECT_ID}-common`,
  env,
});
