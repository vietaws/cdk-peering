### import default vpc to cdk project

`code file: imported-default-vpc-stack.ts`

_main stack: vpc-peering-cdk.ts_

#### 1. get varialbes for REGION & ACCOUNT_ID

```sh
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
echo $ACCOUNT_ID
```

```sh
REGION=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | jq -r .region)
echo $REGION
```

#### 2. setup env

```sh
export REGION=$REGION
export ACCOUNT_ID=$ACCOUNT_ID
```

#### 3. validate

```sh
env
```

#### connect to redshift

psql -h gen-ai-redshift-demo.cafsubk31dga.ap-southeast-1.redshift.amazonaws.com
-p 5439 -U awsuser -d demo
