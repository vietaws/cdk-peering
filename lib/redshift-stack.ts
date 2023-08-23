import { RemovalPolicy, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as rs from '@aws-cdk/aws-redshift-alpha'
import { SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

// https://docs.aws.amazon.com/redshift/latest/dg/t_loading-tables-from-s3.html
export interface RedshiftProps extends StackProps{
    VPC : Vpc
}

export class RedShiftStack extends Stack{
    public redshift : rs.Cluster
    private dbName :string = 'demo'
    constructor(scope : Construct, id: string, props : RedshiftProps){
        super(scope, id, props)
        
        const rsRole = new Role(this, 'rs-role', {
            assumedBy: new ServicePrincipal('redshift.amazonaws.com'),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
                ManagedPolicy.fromAwsManagedPolicyName('AmazonRedshiftQueryEditor'),
                ManagedPolicy.fromAwsManagedPolicyName('AmazonRedshiftReadOnlyAccess'),
            ],

        })
        this.redshift = new rs.Cluster(this, 'my-redshift-cluster', {
            vpc: props.VPC,
            masterUser: {
                masterUsername: "awsuser",
                masterPassword: SecretValue.unsafePlainText("Awsuser123")
            },
            clusterName: 'gen-ai-redshift-demo',
            clusterType: rs.ClusterType.SINGLE_NODE,
            defaultDatabaseName: this.dbName,
            nodeType: rs.NodeType.DC2_LARGE,
            numberOfNodes: 1,
            enhancedVpcRouting: true,
            vpcSubnets: {subnetType: SubnetType.PRIVATE_ISOLATED},
            removalPolicy: RemovalPolicy.DESTROY,
            roles: [rsRole]
        })
        this.redshift.connections.allowDefaultPortFromAnyIpv4()

        
        this.redshift.addDefaultIamRole(rsRole)

        
        // const user = new rs.User(this, 'User', {
        //     cluster: this.redshift,
        //     databaseName: this.dbName,
        //     username: 'myuser',
            
        // });

        // const productTable = new rs.Table(this, 'rs-product-table', {
        //     cluster: this.redshift,
        //     databaseName: this.dbName,
        //     tableName: 'product',
        //     tableColumns: [
        //         {name : 'id', dataType: 'varchar(15)'},
        //         {name : 'name', dataType: 'varchar(100)'},
        //         {name : 'price', dataType: 'float)'},
        //     ],
        //     removalPolicy: RemovalPolicy.DESTROY,
        // })
        // productTable.grant(user, rs.TableAction.ALL)

    }
}