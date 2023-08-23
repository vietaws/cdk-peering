import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";


export class S3BucketStack extends Stack{
    public bucket : Bucket
    constructor(scope: Construct, id: string, props: StackProps){
        super(scope, id, props)
        this.bucket = new Bucket(this, id, {
            bucketName: id+'-'+Math.floor((Math.random()*100000+1)),
            removalPolicy: RemovalPolicy.DESTROY
        })
    }
}