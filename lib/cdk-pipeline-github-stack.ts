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

    const source = CodePipelineSource.gitHub(
      'maximillianus/cdk-pipeline-github',
      'master'
    );

    // Create initial CI/CD Pipeline
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDK-Pipeline-Github',
      synth: new ShellStep('Synth', {
        input: source,
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
          input: source,
          // envFromCfnOutputs: {
          //   lambdaFunctionUrl: lambdaStage.lambdaFunctionUrl
          // },
          commands: ['bash ./test/validate.sh']
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
