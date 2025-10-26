import { cdk8s } from 'projen';

const project = new cdk8s.Cdk8sTypeScriptApp({
  cdk8sVersion: '2.3.33',
  defaultReleaseBranch: 'main',
  name: 'learn-cdk8s+',
  projenrcTs: true,

  // デフォルトのワークフローを無効化
  buildWorkflow: false,
  
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

// 既存のワークフローファイルを削除
project.tryRemoveFile('.github/workflows/build.yml');
project.tryRemoveFile('.github/workflows/pull-request-lint.yml');

// 新しいテストワークフローを追加
const testWorkflow = project.github!.addWorkflow('test');
testWorkflow.on({
  push: {
    branches: ['*']
  },
  pullRequest: {
    branches: ['*']
  }
});

testWorkflow.addJob('test', {
  permissions: {},
  runsOn: ['ubuntu-latest'],
  steps: [
    {
      name: 'Checkout',
      uses: 'actions/checkout@v4'
    },
    {
      name: 'Setup Node.js',
      uses: 'actions/setup-node@v4',
      with: {
        'node-version': '18',
        'cache': 'npm'
      }
    },
    {
      name: 'Install dependencies',
      run: 'npm ci'
    },
    {
      name: 'Build',
      run: 'npm run build'
    },
    {
      name: 'Test',
      run: 'npm test'
    }
  ]
});

project.synth();