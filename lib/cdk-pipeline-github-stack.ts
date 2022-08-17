import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import * as cdk from 'aws-cdk-lib';

export class CdkPipelineGithubStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDK-Pipeline-Github',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('maximillianus/cdk-pipeline-github', 'master'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });
  }
}
