import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {CfnRoute, CfnRouteTable, IVpc, InstanceClass, InstanceSize, InstanceType, IpAddresses, Peer, Port, RouterType, Subnet, SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2'
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, MysqlEngineVersion, StorageType } from "aws-cdk-lib/aws-rds";

export interface rdsProps extends StackProps {
    CLOUD9_VPC_CIDR ?: string
}

export class RdsVpcStack extends Stack {
    public vpcId : string
    public vpcCidr : string
    public accountId : string 
    public region : string
    public vpc : Vpc
    constructor(scope : Construct, id: string, props : rdsProps){
        super(scope, id, props)

        this.createVpc(id)
        this.createRds('mydb-cdk')
    }
    private createVpc(id : string){
        this.vpc = new Vpc(this, id, {
            vpcName: id,
            ipAddresses: IpAddresses.cidr('10.1.0.0/16'),
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
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                    
                }
            ]
        })
        this.vpcId = this.vpc.vpcId
        this.vpcCidr = this.vpc.vpcCidrBlock
        this.accountId = Stack.of(this).account
        this.region = Stack.of(this).region

        
    }
    private createRds(id : string){
        const mysqlUsername = 'dbadmin'
        const mysqlPassword = new Secret(this, id, {
            secretName: id,
            description: "mysql password in secret manager",
            generateSecretString: {
                excludeCharacters: "\"@/\\ '",
                generateStringKey: 'password',
                passwordLength: 30,
                secretStringTemplate: JSON.stringify({username: mysqlUsername})
            }
        })
        const mysqlCred = Credentials.fromSecret(mysqlPassword, mysqlUsername)
        const rds = new DatabaseInstance(this, 'rds-db', {
            engine: DatabaseInstanceEngine.mysql({
                version: MysqlEngineVersion.VER_8_0_33
            }),
            vpc: this.vpc,
            publiclyAccessible: false,
            credentials: mysqlCred,
            removalPolicy: RemovalPolicy.DESTROY,
            deleteAutomatedBackups: true,
            vpcSubnets: {
                subnetType: SubnetType.PRIVATE_ISOLATED
            },
            storageType: StorageType.GP3,
            instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE)
        })

        //open security group for inbound
        rds.connections.allowFrom(Peer.anyIpv4(), Port.tcp(3306))

        //output
        new CfnOutput(this, 'rds-endpoint', {
            value: rds.dbInstanceEndpointAddress,
            description: "rds endpoint"
        })
        new CfnOutput(this, 'rds-sg', {
            value: rds.connections.securityGroups[0].securityGroupId,
            description: 'rds security group'
        })
       
    }
}