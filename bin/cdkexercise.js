#!/usr/bin/env node

const cdk = require('aws-cdk');
const { CdkexerciseStack } = require('../lib/cdkexercise-stack');

const app = new cdk.App();
new CdkexerciseStack(app, 'CdkexerciseStack', {});
