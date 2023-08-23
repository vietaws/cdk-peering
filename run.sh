#!/bin/bash

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
echo $ACCOUNT_ID

REGION=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | jq -r .region)
echo $REGION

export REGION=$REGION
export ACCOUNT_ID=$ACCOUNT_ID

# psql -h gen-ai-redshift-demo.cafsubk31dga.ap-southeast-1.redshift.amazonaws.com -p 5439 -U awsuser -d demo

#create table public.test (c1 int);