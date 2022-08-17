import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class CdkPipelineLambdaStack extends cdk.Stack {
  public readonly lambdaFunctionUrl: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new lambda.Function(this, 'LambdaFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: new lambda.InlineCode('exports.handler = _ => "Hello, CDK";')
    });

    this.lambdaFunctionUrl = 'https://example.com';

    // Disabling public function URL due to security reason
    // const fnUrl = fn.addFunctionUrl({
    //   authType: lambda.FunctionUrlAuthType.NONE
    // });

    // this.lambdaFunctionUrl = new cdk.CfnOutput(this, 'lambda-function-url', {
    //   value: fnUrl.url
    // });
  }
}
