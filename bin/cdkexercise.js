#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { CdkexerciseStack } = require('../lib/cdkexercise-stack');

const app = new cdk.App();
new CdkexerciseStack(app, 'CdkexerciseStack', {});
