import * as core from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { RUNTIME_VERSION } from '../constants/lambda';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';

interface Props extends core.StackProps {
  projectId: string;
  environment: Record<string, string>;
}
const HANDLER_DIR = '../dist/aws-lambda';

export class UdonariumBackendStack extends core.Stack {

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const defaultLambdaProps = this.createLambdaProps({
      environment: props.environment,
      timeoutSec: 5, // 外部エンドポイントを経由してJSONを処理するため3秒では足りない
    });

    const fn = this.createLambda(
      {
        ...defaultLambdaProps,
        description: 'udonarium key',
        entry: `${HANDLER_DIR}/index.js`,
      },
      'udonarium-backend'
    );
    const fnUrl = fn.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    })
    new core.CfnOutput(this, 'lambdaUrl', {
      value: fnUrl.url!
    })
  }


  private createLambdaProps(props: {
    environment?: Record<string, string>;
    initialPolicy?: iam.PolicyStatement[];
    timeoutSec?: number;
  }) {



    return {
      runtime: RUNTIME_VERSION,
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
