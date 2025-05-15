import * as core from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { RUNTIME_VERSION, TARGET_APP_DIRECTORY } from '../constants/lambda';

const bundling = {
  externalModules: ['@udonarium-backend/core', '@aws-sdk/client-s3'],
};

interface Props extends core.StackProps {
  projectId: string;
  ssmLambdaLayerKey: string;
}
const HANDLER_DIR = `${TARGET_APP_DIRECTORY}/src`;

export class UdonariumBackendStack extends core.Stack {

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const defaultLambdaProps = this.createLambdaProps({
      ssmKeyForLambdaLayerArn: props.ssmLambdaLayerKey,
      environment: {  },
      timeoutSec: 5, // 外部エンドポイントを経由してJSONを処理するため3秒では足りない
    });

    this.createLambda(
      {
        ...defaultLambdaProps,
        description: 'udonarium key',
        entry: `${HANDLER_DIR}/index.ts`,
      },
      'udonarium-backend'
    );
  }


  private createLambdaProps(props: {
    ssmKeyForLambdaLayerArn: string;
    environment?: Record<string, string>;
    initialPolicy?: iam.PolicyStatement[];
    timeoutSec?: number;
  }) {
    const lambdaLayerArn = StringParameter.valueForStringParameter(this, props.ssmKeyForLambdaLayerArn);

    const layers = [
      LayerVersion.fromLayerVersionArn(this, 'node_modules-layer', lambdaLayerArn),
    ];

    // 同じStack上でLayerVersionを作っていない場合、cdk synthで sam local 実行用のoutputを作るときにレイヤーを使うとエラーになる。
    const layerSettings = process.env['CDK_SYNTH'] ? {} : { bundling, layers };

    return {
      runtime: RUNTIME_VERSION,
      ...layerSettings,
      environment: props.environment,
      initialPolicy: props.initialPolicy,
      timeout: props.timeoutSec ? core.Duration.seconds(props.timeoutSec) : undefined,
    };
  }

  private createLambda(props: NodejsFunctionProps, key: string) {
    // 第2引数は [\p{L}\p{Z}\p{N}_.:/=+\-@]* で表現される文字列である必要が文字。{}は使えないので置換する
    const k = key.replaceAll('{', '__').replaceAll('}', '__');
    const func = new NodejsFunction(this, k, props);
    return func;
  }


}
