#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcPeeringCdkStack } from '../lib/main-stack';
import { Cloud9VpcStack } from '../lib/vpc-cloud9-stack';
import { RdsVpcStack } from '../lib/vpc-rds-stack';
import { VpcPeeringStack } from '../lib/vpc-peering-stack';
import { RdsRtbStack } from '../lib/rds-rtb-update-stack';
import { Cloud9RtbStack } from '../lib/cloud9-rtb-update-stack';

const app = new cdk.App();
new VpcPeeringCdkStack(app, 'VpcPeeringCdkStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
const cloud9Stack = new Cloud9VpcStack(app, 'vpc-cloud9',{}) //vpcId, vpcCidr
const rdsStack = new RdsVpcStack(app, 'vpc-rds', {
  CLOUD9_VPC_CIDR : cloud9Stack.vpcCidr //'172.31.0.0/16'
})
const peeringStack = new VpcPeeringStack(app, 'peering', {
  REGION: rdsStack.region,
  PEER_OWNER_ID: rdsStack.accountId,
  PEER_VPC_ID: rdsStack.vpcId,
  VPC_ID: cloud9Stack.vpcId
})

const rtbRdsStack = new RdsRtbStack(app, 'rds-rtb', {
  CLOUD9_VPC_CIDR: cloud9Stack.vpcCidr,
  PEERING_CONNECTION: peeringStack.peering,
  RDS_VPC: rdsStack.vpc
})

const rtbCloud9Stack = new Cloud9RtbStack(app, 'cloud9-rtb',{
  CLOUD9_VPC: cloud9Stack.vpc,
  RDS_VPC_CIDR: rdsStack.vpcCidr,
  PEERING_CONNECTION: peeringStack.peering
})