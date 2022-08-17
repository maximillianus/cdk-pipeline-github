import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import * as cdk from 'aws-cdk-lib';
import { CdkPipelineAppStage } from './cdk-pipeline-app-stage';


export class CdkPipelineGithubStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create initial CI/CD Pipeline
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDK-Pipeline-Github',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('maximillianus/cdk-pipeline-github', 'master'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });

    // Add a stage for Lambda
    pipeline
        .addStage(new CdkPipelineAppStage(this, "Test", {
            env: { 
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: process.env.CDK_DEFAULT_REGION
            }
        }))
        .addPost(new ManualApprovalStep('Approval'));

    // add Wave for multiple parallel deployment
    const wave = pipeline.addWave('wave');
    wave.addStage(new CdkPipelineAppStage(this, 'CdkPipelineApp-US', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' }
    }));
  }
}
