#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { UdonariumBackendStack } from '../lib/lambda-stack';

dotenv.config({ path: './.env.local' });

const envList = [
  'PROJECT_ID',
  'SSM_PARAM_KEY_LAYER_VERSIONS_ARN',
  'SKYWAY_APP_ID',
  'SKYWAY_SECRET',
  'SKYWAY_UDONARIUM_LOBBY_SIZE',
  'ACCESS_CONTROL_ALLOW_ORIGIN',
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

new UdonariumBackendStack(app, `${processEnv.PROJECT_ID}-UdonariumBackendStack`, {
  ssmLambdaLayerKey: `${processEnv.SSM_PARAM_KEY_LAYER_VERSIONS_ARN}-${processEnv.PROJECT_ID}`,
  env,
  projectId: processEnv.PROJECT_ID,
  environment: {
    SKYWAY_APP_ID: processEnv.SKYWAY_APP_ID,
    SKYWAY_SECRET: processEnv.SKYWAY_SECRET,
    SKYWAY_UDONARIUM_LOBBY_SIZE: processEnv.SKYWAY_UDONARIUM_LOBBY_SIZE,
    ACCESS_CONTROL_ALLOW_ORIGIN: processEnv.ACCESS_CONTROL_ALLOW_ORIGIN,
  },
});
