import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {IVpc, InstanceType, IpAddresses, SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2'
import * as cloud9 from '@aws-cdk/aws-cloud9-alpha'
import { IUser, ManagedPolicy, Role, User } from "aws-cdk-lib/aws-iam";


export class Cloud9VpcStack extends Stack {
    public vpcId : string
    public vpcCidr : string
    public vpc : Vpc
    constructor(scope : Construct, id: string, props : StackProps){
        super(scope, id, props)

        this.createVpc(id)
        this.createCloud9()
    }
    private createCloud9(){
        // const user = new User(this, 'kevin',{
        //     userName: 'kevincdk'
        // })
        // user.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSCloud9Administrator'))
        const adminRole = Role.fromRoleArn(this, 'AdminRoleCDK', `arn:aws:iam::${Stack.of(this).account}:role/AdminRole`, {mutable: false})
        const user = User.fromUserArn(this, 'kevincdk', `arn:aws:iam::${Stack.of(this).account}:user/kevin`)
        new cloud9.Ec2Environment(this, 'C9Cdk', {
            vpc: this.vpc,
            instanceType: new InstanceType('t3.large'),
            imageId: cloud9.ImageId.AMAZON_LINUX_2,
            automaticStop: Duration.minutes(30),
            connectionType: cloud9.ConnectionType.CONNECT_SSM,
            subnetSelection:{
                subnetType: SubnetType.PUBLIC
            },
            // owner: cloud9.Owner.accountRoot(this.accountId)
            owner: cloud9.Owner.user(user)
          })
    }
    private createVpc(id : string){
        this.vpc = new Vpc(this, id, {
            vpcName: id,
            ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: `${id}-public`,
                    subnetType: SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: `${id}-private`,
                    subnetType: SubnetType.PRIVATE_ISOLATED
                }
            ]
        })
        this.vpcId = this.vpc.vpcId
        this.vpcCidr = this.vpc.vpcCidrBlock
        // this.accountId = Stack.of(this).account
    }
}