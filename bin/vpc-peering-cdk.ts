#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcPeeringCdkStack } from '../lib/main-stack';
import { Cloud9VpcStack } from '../lib/vpc-cloud9-stack';
import { RdsVpcStack } from '../lib/vpc-rds-stack';
import { VpcPeeringStack } from '../lib/vpc-peering-stack';
import { RdsRtbStack } from '../lib/rds-rtb-update-stack';
import { Cloud9RtbStack } from '../lib/cloud9-rtb-update-stack';
import { ImportedVpcStack } from '../lib/imported-vpc-stack';
import { ImportedDefaultVpcStack } from '../lib/imported-default-vpc-stack';

let REGION : string 
let ACCOUNT_ID : string

if(!process.env.REGION || !process.env.ACCOUNT_ID){
  console.log("Missing Environment Varialbes! Please check the guide (../import-vpc-guide.md)!")
  //import-vpc-guide.md
  //or run below command
  //chmod +x run ../run.sh
  //../run.sh
  process.exit(1);
}else{
  console.log("Ready to Go!")
  REGION = process.env.REGION
  ACCOUNT_ID = process.env.ACCOUNT_ID
}

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
// const cloud9Stack = new Cloud9VpcStack(app, 'vpc-cloud9',{}) //vpcId, vpcCidr

const defaultVpcStack = new ImportedDefaultVpcStack(app, 'defaultVpc', {
  env: {
    region: REGION,
    account: ACCOUNT_ID
  }
})
const rdsStack = new RdsVpcStack(app, 'vpc-rds', {
  // CLOUD9_VPC_CIDR : defaultVpcStack.vpc.vpcCidrBlock //'172.31.0.0/16'
})

const peeringDefault = new VpcPeeringStack(app, 'peering-default', {
  PEER_OWNER_ID: ACCOUNT_ID,
  REGION: REGION,
  VPC_ID : defaultVpcStack.vpc.vpcId,
  PEER_VPC_ID : rdsStack.vpcId
})

new RdsRtbStack(app, 'rds-to-default-vpc-rtb', {
  PEERING_CONNECTION: peeringDefault.peering,
  RDS_VPC: rdsStack.vpc,
  DEST_VPC_CIDR: defaultVpcStack.vpc.vpcCidrBlock
})
new Cloud9RtbStack(app, 'cloud9-to-default-vpc-rtb', {
  CLOUD9_VPC: defaultVpcStack.vpc,
  PEERING_CONNECTION: peeringDefault.peering,
  DEST_VPC_CIDR: rdsStack.vpcCidr,
  VPC_DEFAULT: true
})

// const peeringStack = new VpcPeeringStack(app, 'peering-cloud9', {
//   REGION: REGION,
//   PEER_OWNER_ID: ACCOUNT_ID!,
//   PEER_VPC_ID: rdsStack.vpcId,
//   VPC_ID: cloud9Stack.vpcId
// })

// const rtbRdsStack = new RdsRtbStack(app, 'rds-rtb', {
//   DEST_VPC_CIDR: cloud9Stack.vpcCidr,
//   PEERING_CONNECTION: peeringStack.peering,
//   RDS_VPC: rdsStack.vpc
// })

// const rtbCloud9Stack = new Cloud9RtbStack(app, 'cloud9-rtb',{
//   CLOUD9_VPC: cloud9Stack.vpc,
//   DEST_VPC_CIDR: rdsStack.vpcCidr,
//   PEERING_CONNECTION: peeringStack.peering
// })

// console.log("values of vpc default: ", process.env.REGION, process.env.ACCOUNT_ID)
// console.log("values of vpc default2: ", cdk.Stack.of(app).region.toString(), cdk.Stack.of(app).account.toString())



