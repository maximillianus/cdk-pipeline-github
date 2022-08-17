import { Construct } from 'constructs';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  ManualApprovalStep
} from 'aws-cdk-lib/pipelines';
import * as cdk from 'aws-cdk-lib';
import { CdkPipelineAppStage } from './cdk-pipeline-app-stage';

export class CdkPipelineGithubStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create initial CI/CD Pipeline
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDK-Pipeline-Github',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(
          'maximillianus/cdk-pipeline-github',
          'master'
        ),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });

    const lambdaStage = new CdkPipelineAppStage(this, 'Test', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
      }
    });

    // Add a stage for Lambda
    pipeline
      .addStage(lambdaStage)
      // .addPost(new ManualApprovalStep('Approval'))
      .addPost(
        new ShellStep('Echo Lambda FnUrl', {
          envFromCfnOutputs: {
            lambdaFunctionUrl: lambdaStage.lambdaFunctionUrl
          },
          commands: ['echo "Hello World"', 'echo $lambdaFunctionUrl']
        })
      );

    // add Wave for multiple parallel deployment
    const wave = pipeline.addWave('wave');
    wave.addStage(
      new CdkPipelineAppStage(this, 'CdkPipelineApp-US', {
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' }
      })
    );
  }
}
