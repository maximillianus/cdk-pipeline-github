import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CdkPipelineLambdaStack } from './cdk-pipeline-lambda-stack';

export class CdkPipelineAppStage extends cdk.Stage {
  public readonly lambdaFunctionUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const lambdaStack = new CdkPipelineLambdaStack(this, 'LambdaStack');

    this.lambdaFunctionUrl = lambdaStack.lambdaFunctionUrl;
  }
}
